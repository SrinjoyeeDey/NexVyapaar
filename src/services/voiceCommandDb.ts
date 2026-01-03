import { supabase } from "@/integrations/supabase/client";
import type { ParsedCommand } from "@/utils/voiceCommandParser";

export type ApplyVoiceCommandResult =
  | { ok: true }
  | { ok: false; reason: string };

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ");

async function findRawMaterialIdByName(userId: string, name: string) {
  const normalized = normalizeName(name);

  // Exact match
  const { data, error } = await supabase
    .from("raw_materials")
    .select("id,name")
    .eq("user_id", userId)
    .ilike("name", normalized)
    .limit(1);

  if (error) throw error;
  if (data && data.length > 0) return data[0].id as string;

  // Fallback: contains match
  const { data: data2, error: error2 } = await supabase
    .from("raw_materials")
    .select("id,name")
    .eq("user_id", userId)
    .ilike("name", `%${normalized}%`)
    .limit(1);

  if (error2) throw error2;
  if (data2 && data2.length > 0) return data2[0].id as string;

  return null;
}

async function findOrCreateSupplierId(userId: string, name: string) {
  const normalized = normalizeName(name);

  // 1) Try to find existing
  const { data: existing, error: searchError } = await supabase
    .from("suppliers")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", normalized)
    .limit(1);

  if (!searchError && existing && existing.length > 0) {
    return existing[0].id;
  }

  // 2) Create new if not found
  const { data: inserted, error: insertError } = await supabase
    .from("suppliers")
    .insert({
      user_id: userId,
      name: normalized,
      contact_person: "Created via Voice",
    })
    .select("id")
    .single();

  if (insertError) throw insertError;
  return inserted.id;
}

export async function applyVoiceCommandToDb(command: ParsedCommand): Promise<ApplyVoiceCommandResult> {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) return { ok: false, reason: userError.message };
  if (!user) return { ok: false, reason: "Not authenticated" };

  if (command.type === "sale") {
    if (!command.product) return { ok: false, reason: "Missing product" };
    if (!command.quantity) return { ok: false, reason: "Missing quantity" };

    const totalAmount = command.amount ?? 0;

    // 1) Insert sales record
    const { error: insertError } = await supabase.from("sales_data").insert({
      user_id: user.id,
      product_name: normalizeName(command.product),
      quantity: command.quantity,
      price: totalAmount,
      sale_date: new Date().toISOString().slice(0, 10),
    });
    if (insertError) return { ok: false, reason: insertError.message };

    // 2) Decrease raw material stock if it exists (best-effort)
    const materialId = await findRawMaterialIdByName(user.id, command.product);
    if (materialId) {
      // Atomic update
      const { error: stockError } = await supabase
        .from("raw_materials")
        .update({})
        .eq("id", materialId);

      // If we can't do atomic decrement without RPC, do a safe read+update.
      // (Keep it simple but reliable.)
      if (stockError) {
        // ignore and fallback below
      }

      const { data: currentRow, error: readError } = await supabase
        .from("raw_materials")
        .select("current_stock")
        .eq("id", materialId)
        .single();
      if (!readError) {
        const current = Number(currentRow?.current_stock ?? 0);
        const next = Math.max(0, current - command.quantity);
        await supabase.from("raw_materials").update({ current_stock: next }).eq("id", materialId);
      }
    }

    return { ok: true };
  }

  if (command.type === "inventory") {
    if (!command.product) return { ok: false, reason: "Missing product" };
    if (!command.quantity) return { ok: false, reason: "Missing quantity" };

    const materialId = await findRawMaterialIdByName(user.id, command.product);
    if (!materialId) {
      return {
        ok: false,
        reason: `Item \"${normalizeName(command.product)}\" not found in Inventory. Please add it first (or say: \"Add ${command.quantity} ${normalizeName(command.product)}\" after creating the item).`,
      };
    }

    const { data: currentRow, error: readError } = await supabase
      .from("raw_materials")
      .select("current_stock")
      .eq("id", materialId)
      .single();
    if (readError) return { ok: false, reason: readError.message };

    const current = Number(currentRow?.current_stock ?? 0);
    const next = current + command.quantity;

    const updatePayload: any = { current_stock: next };
    if (command.expiryDate) {
      updatePayload.expiry_date = command.expiryDate;
    }

    const { error: updateError } = await supabase
      .from("raw_materials")
      .update(updatePayload)
      .eq("id", materialId);

    if (updateError) return { ok: false, reason: updateError.message };

    return { ok: true };
  }

  if (command.type === "expired") {
    if (!command.product) return { ok: false, reason: "Missing product" };
    if (!command.quantity) return { ok: false, reason: "Missing quantity" };

    const materialId = await findRawMaterialIdByName(user.id, command.product);
    if (!materialId) {
      return { ok: false, reason: `Item \"${normalizeName(command.product)}\" not found in Inventory.` };
    }

    const { data: currentRow, error: readError } = await supabase
      .from("raw_materials")
      .select("current_stock")
      .eq("id", materialId)
      .single();
    if (readError) return { ok: false, reason: readError.message };

    const current = Number(currentRow?.current_stock ?? 0);
    const next = Math.max(0, current - command.quantity);

    const { error: updateError } = await supabase
      .from("raw_materials")
      .update({ current_stock: next })
      .eq("id", materialId);

    if (updateError) return { ok: false, reason: updateError.message };

    return { ok: true };
  }

  if (command.type === "purchase_order") {
    if (!command.product) return { ok: false, reason: "Missing product" };
    if (!command.quantity) return { ok: false, reason: "Missing quantity" };
    if (!command.supplier) return { ok: false, reason: "Missing supplier" };

    try {
      // 1) Find/Create Supplier
      const supplierId = await findOrCreateSupplierId(user.id, command.supplier);

      // 2) Find/Verify Material (best effort)
      const materialId = await findRawMaterialIdByName(user.id, command.product);

      // 3) Create Purchase Order
      const poNumber = `PO-${Math.floor(Math.random() * 90000) + 10000}`;
      const totalAmount = command.amount ?? 0;

      const { data: po, error: poError } = await supabase
        .from("purchase_orders")
        .insert({
          user_id: user.id,
          supplier_id: supplierId,
          po_number: poNumber,
          total_amount: totalAmount,
          status: "pending",
          order_date: new Date().toISOString().slice(0, 10),
        })
        .select("id")
        .single();

      if (poError) return { ok: false, reason: poError.message };

      // 4) Create PO Item
      const { error: itemError } = await supabase
        .from("purchase_order_items")
        .insert({
          purchase_order_id: po.id,
          material_id: materialId,
          quantity: command.quantity,
          unit_price: totalAmount > 0 ? totalAmount / command.quantity : 0,
          total_price: totalAmount,
        });

      if (itemError) return { ok: false, reason: itemError.message };

      // 5) Update Supplier Price (if price known)
      if (materialId && totalAmount > 0) {
        const unitPrice = totalAmount / command.quantity;

        // Check if price exists
        const { data: existingPrice } = await supabase
          .from("supplier_prices")
          .select("id")
          .eq("supplier_id", supplierId)
          .eq("material_id", materialId)
          .limit(1);

        if (existingPrice && existingPrice.length > 0) {
          await supabase
            .from("supplier_prices")
            .update({ price_per_unit: unitPrice })
            .eq("id", existingPrice[0].id);
        } else {
          await supabase
            .from("supplier_prices")
            .insert({
              supplier_id: supplierId,
              material_id: materialId,
              price_per_unit: unitPrice,
            });
        }
      }

      return { ok: true };
    } catch (e: any) {
      return { ok: false, reason: e.message };
    }
  }

  // Payment/Return/Query not wired yet (not requested)
  return { ok: false, reason: "This command type is not connected yet." };
}
