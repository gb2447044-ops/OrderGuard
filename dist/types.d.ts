export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "completed" | "cancelled" | "refunded";
export interface Customer {
    id?: string;
    name: string;
    email: string;
}
export interface OrderItem {
    productId?: string;
    name: string;
    quantity: number;
    unitPrice: number;
}
export interface Order {
    id: string;
    customer: Customer;
    currency: string;
    status: OrderStatus;
    items: OrderItem[];
    subtotal: number;
    discount: number;
    tax: number;
    shipping: number;
    total: number;
    createdAt?: string;
}
//# sourceMappingURL=types.d.ts.map