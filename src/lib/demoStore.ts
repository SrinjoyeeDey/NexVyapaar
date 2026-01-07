import { toast } from "sonner";

// Types for our demo store
interface DemoStoreData {
    rawMaterials: Map<string, any>;
    finishedProducts: Map<string, any>;
    suppliers: Map<string, any>;
    purchaseOrders: Map<string, any>;
    salesData: any[];
    transactions: any[];
    marketingCampaigns: any[];
    communityPosts: any[];
    lowStockAlerts: any[];
    customerFeedback: any[];
}

// Event listeners for real-time updates
type EventCallback = () => void;
const eventListeners: Map<string, EventCallback[]> = new Map();

// Central demo store
class DemoStore {
    private data: DemoStoreData;
    private userId: string;

    constructor() {
        this.userId = "";
        this.data = {
            rawMaterials: new Map(),
            finishedProducts: new Map(),
            suppliers: new Map(),
            purchaseOrders: new Map(),
            salesData: [],
            transactions: [],
            marketingCampaigns: [],
            communityPosts: [],
            lowStockAlerts: [],
            customerFeedback: [],
        };
        this.loadFromLocalStorage();
    }

    // Initialize with user ID
    setUserId(userId: string) {
        this.userId = userId;
    }

    getUserId() {
        return this.userId;
    }

    // Generate unique IDs
    private generateId(): string {
        return `demo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Save to localStorage for persistence
    private saveToLocalStorage() {
        try {
            const serialized = {
                rawMaterials: Array.from(this.data.rawMaterials.entries()),
                finishedProducts: Array.from(this.data.finishedProducts.entries()),
                suppliers: Array.from(this.data.suppliers.entries()),
                purchaseOrders: Array.from(this.data.purchaseOrders.entries()),
                salesData: this.data.salesData,
                transactions: this.data.transactions,
                marketingCampaigns: this.data.marketingCampaigns,
                communityPosts: this.data.communityPosts,
                lowStockAlerts: this.data.lowStockAlerts,
                customerFeedback: this.data.customerFeedback,
            };
            localStorage.setItem("demo_store_data", JSON.stringify(serialized));
        } catch (error) {
            console.error("Failed to save demo store:", error);
        }
    }

    // Load from localStorage
    private loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem("demo_store_data");
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data.rawMaterials = new Map(parsed.rawMaterials || []);
                this.data.finishedProducts = new Map(parsed.finishedProducts || []);
                this.data.suppliers = new Map(parsed.suppliers || []);
                this.data.purchaseOrders = new Map(parsed.purchaseOrders || []);
                this.data.salesData = parsed.salesData || [];
                this.data.transactions = parsed.transactions || [];
                this.data.marketingCampaigns = parsed.marketingCampaigns || [];
                this.data.communityPosts = parsed.communityPosts || [];
                this.data.lowStockAlerts = parsed.lowStockAlerts || [];
                this.data.customerFeedback = parsed.customerFeedback || [];
            }
        } catch (error) {
            console.error("Failed to load demo store:", error);
        }
    }

    // Clear all data
    clear() {
        this.data = {
            rawMaterials: new Map(),
            finishedProducts: new Map(),
            suppliers: new Map(),
            purchaseOrders: new Map(),
            salesData: [],
            transactions: [],
            marketingCampaigns: [],
            communityPosts: [],
            lowStockAlerts: [],
            customerFeedback: [],
        };
        this.saveToLocalStorage();
        this.emit("store_cleared");
    }

    // Event system
    on(event: string, callback: EventCallback) {
        if (!eventListeners.has(event)) {
            eventListeners.set(event, []);
        }
        eventListeners.get(event)!.push(callback);
    }

    private emit(event: string) {
        const callbacks = eventListeners.get(event);
        if (callbacks) {
            callbacks.forEach((cb) => cb());
        }
    }

    // RAW MATERIALS OPERATIONS
    getRawMaterials(): any[] {
        return Array.from(this.data.rawMaterials.values());
    }

    addRawMaterial(material: any): any {
        const id = this.generateId();
        const newMaterial = {
            ...material,
            id,
            user_id: this.userId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        this.data.rawMaterials.set(id, newMaterial);
        this.saveToLocalStorage();
        this.emit("raw_materials_changed");

        // Check if we need to create a low stock alert
        this.checkAndCreateLowStockAlert(newMaterial);

        return newMaterial;
    }

    updateRawMaterial(id: string, updates: any): any {
        const existing = this.data.rawMaterials.get(id);
        if (!existing) throw new Error("Material not found");

        const updated = {
            ...existing,
            ...updates,
            updated_at: new Date().toISOString(),
        };
        this.data.rawMaterials.set(id, updated);
        this.saveToLocalStorage();
        this.emit("raw_materials_changed");

        // Recheck low stock alerts
        this.checkAndCreateLowStockAlert(updated);

        return updated;
    }

    deleteRawMaterial(id: string): void {
        this.data.rawMaterials.delete(id);
        // Remove related alerts
        this.data.lowStockAlerts = this.data.lowStockAlerts.filter(
            (alert) => alert.material_id !== id
        );
        this.saveToLocalStorage();
        this.emit("raw_materials_changed");
        this.emit("low_stock_alerts_changed");
    }

    // FINISHED PRODUCTS OPERATIONS
    getFinishedProducts(): any[] {
        return Array.from(this.data.finishedProducts.values());
    }

    addFinishedProduct(product: any): any {
        const id = this.generateId();
        const newProduct = {
            ...product,
            id,
            user_id: this.userId,
            created_at: new Date().toISOString(),
        };
        this.data.finishedProducts.set(id, newProduct);
        this.saveToLocalStorage();
        this.emit("finished_products_changed");
        return newProduct;
    }

    deleteFinishedProduct(id: string): void {
        this.data.finishedProducts.delete(id);
        this.saveToLocalStorage();
        this.emit("finished_products_changed");
    }

    // SUPPLIERS OPERATIONS
    getSuppliers(): any[] {
        return Array.from(this.data.suppliers.values());
    }

    addSupplier(supplier: any): any {
        const id = this.generateId();
        const newSupplier = {
            ...supplier,
            id,
            user_id: this.userId,
            created_at: new Date().toISOString(),
        };
        this.data.suppliers.set(id, newSupplier);
        this.saveToLocalStorage();
        this.emit("suppliers_changed");
        return newSupplier;
    }

    updateSupplier(id: string, updates: any): any {
        const existing = this.data.suppliers.get(id);
        if (!existing) throw new Error("Supplier not found");

        const updated = { ...existing, ...updates };
        this.data.suppliers.set(id, updated);
        this.saveToLocalStorage();
        this.emit("suppliers_changed");
        return updated;
    }

    deleteSupplier(id: string): void {
        this.data.suppliers.delete(id);
        this.saveToLocalStorage();
        this.emit("suppliers_changed");
    }

    // PURCHASE ORDERS OPERATIONS
    getPurchaseOrders(): any[] {
        return Array.from(this.data.purchaseOrders.values());
    }

    addPurchaseOrder(po: any): any {
        const id = this.generateId();
        const newPO = {
            ...po,
            id,
            user_id: this.userId,
            created_at: new Date().toISOString(),
        };
        this.data.purchaseOrders.set(id, newPO);
        this.saveToLocalStorage();
        this.emit("purchase_orders_changed");
        return newPO;
    }

    updatePurchaseOrder(id: string, updates: any): any {
        const existing = this.data.purchaseOrders.get(id);
        if (!existing) throw new Error("PO not found");

        const updated = { ...existing, ...updates };
        this.data.purchaseOrders.set(id, updated);

        // If status changed to delivered, update inventory
        if (updates.status === "delivered" && existing.status !== "delivered") {
            this.handlePODelivery(updated);
        }

        this.saveToLocalStorage();
        this.emit("purchase_orders_changed");
        return updated;
    }

    private handlePODelivery(po: any): void {
        // In a real scenario, we'd update inventory based on PO items
        toast.success("Inventory updated from delivered PO!");
    }

    // SALES DATA OPERATIONS
    getSalesData(): any[] {
        return this.data.salesData;
    }

    addSale(sale: any): any {
        const newSale = {
            ...sale,
            id: this.generateId(),
            user_id: this.userId,
            sale_date: sale.sale_date || new Date().toISOString(),
            created_at: new Date().toISOString(),
        };
        this.data.salesData.push(newSale);

        // Deduct from inventory if material exists
        if (sale.product_name) {
            this.deductInventory(sale.product_name, sale.quantity);
        }

        this.saveToLocalStorage();
        this.emit("sales_data_changed");
        return newSale;
    }

    private deductInventory(productName: string, quantity: number): void {
        for (const [id, material] of this.data.rawMaterials.entries()) {
            if (material.name === productName) {
                const newStock = (material.current_stock || 0) - quantity;
                this.updateRawMaterial(id, { current_stock: Math.max(0, newStock) });
                break;
            }
        }
    }

    // TRANSACTIONS OPERATIONS
    getTransactions(): any[] {
        return this.data.transactions;
    }

    addTransaction(transaction: any): any {
        const newTransaction = {
            ...transaction,
            id: this.generateId(),
            user_id: this.userId,
            created_at: transaction.created_at || new Date().toISOString(),
        };
        this.data.transactions.push(newTransaction);
        this.saveToLocalStorage();
        this.emit("transactions_changed");
        return newTransaction;
    }

    // MARKETING CAMPAIGNS OPERATIONS
    getMarketingCampaigns(): any[] {
        return this.data.marketingCampaigns;
    }

    addMarketingCampaign(campaign: any): any {
        const newCampaign = {
            ...campaign,
            id: this.generateId(),
            user_id: this.userId,
            created_at: new Date().toISOString(),
        };
        this.data.marketingCampaigns.push(newCampaign);
        this.saveToLocalStorage();
        this.emit("marketing_campaigns_changed");
        return newCampaign;
    }

    // COMMUNITY POSTS OPERATIONS
    getCommunityPosts(): any[] {
        return this.data.communityPosts;
    }

    addCommunityPost(post: any): any {
        const newPost = {
            ...post,
            id: this.generateId(),
            user_id: this.userId,
            created_at: new Date().toISOString(),
            likes_count: 0,
            comments_count: 0,
        };
        this.data.communityPosts.push(newPost);
        this.saveToLocalStorage();
        this.emit("community_posts_changed");
        return newPost;
    }

    // LOW STOCK ALERTS OPERATIONS
    getLowStockAlerts(): any[] {
        return this.data.lowStockAlerts.filter((alert) => !alert.is_acknowledged);
    }

    private checkAndCreateLowStockAlert(material: any): void {
        const currentStock = material.current_stock || 0;
        const reorderPoint = material.reorder_point || 0;

        // Remove existing alerts for this material
        this.data.lowStockAlerts = this.data.lowStockAlerts.filter(
            (alert) => alert.material_id !== material.id
        );

        // Create new alert if needed
        if (currentStock <= reorderPoint && reorderPoint > 0) {
            const alert = {
                id: this.generateId(),
                user_id: this.userId,
                material_id: material.id,
                alert_type: "low_stock",
                message: `${material.name} is running low! Current: ${currentStock}, Reorder at: ${reorderPoint}`,
                current_value: currentStock,
                threshold_value: reorderPoint,
                is_acknowledged: false,
                created_at: new Date().toISOString(),
            };
            this.data.lowStockAlerts.push(alert);
            this.emit("low_stock_alerts_changed");
        }
    }

    acknowledgeAlert(alertId: string): void {
        const alert = this.data.lowStockAlerts.find((a) => a.id === alertId);
        if (alert) {
            alert.is_acknowledged = true;
            this.saveToLocalStorage();
            this.emit("low_stock_alerts_changed");
        }
    }

    // CUSTOMER FEEDBACK OPERATIONS
    getCustomerFeedback(): any[] {
        return this.data.customerFeedback;
    }

    addCustomerFeedback(feedback: any): any {
        const newFeedback = {
            ...feedback,
            id: this.generateId(),
            user_id: this.userId,
            feedback_date: feedback.feedback_date || new Date().toISOString(),
            created_at: new Date().toISOString(),
        };
        this.data.customerFeedback.push(newFeedback);
        this.saveToLocalStorage();
        this.emit("customer_feedback_changed");
        return newFeedback;
    }
}

// Singleton instance
export const demoStore = new DemoStore();
