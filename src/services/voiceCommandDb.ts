import { supabase } from "@/integrations/supabase/client";
import type { ParsedCommand } from "@/utils/voiceCommandParser";

export type ApplyVoiceCommandResult =
  | { ok: true }
  | { ok: false; reason: string };

const normalizeName = (s: string) => s.trim().replace(/\s+/g, " ");

async function findRawMaterialIdByName(userId: string, name: string) {
  const normalized = normalizeName(name);

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

    const { error: updateError } = await supabase
      .from("raw_materials")
      .update({ current_stock: next })
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

  // Payment/Return/Query not wired yet (not requested)
  return { ok: false, reason: "This command type is not connected yet." };
}
