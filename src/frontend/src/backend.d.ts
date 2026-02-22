import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CartItem {
    productId: bigint;
    quantity: bigint;
}
export type PaymentMethod = {
    __kind__: "upi";
    upi: string;
} | {
    __kind__: "cashOnDelivery";
    cashOnDelivery: null;
};
export interface Product {
    id: bigint;
    reviews: Array<string>;
    name: string;
    description: string;
    category: string;
    price: number;
}
export interface backendInterface {
    addProduct(name: string, category: string, price: number, description: string): Promise<bigint>;
    addReview(productId: bigint, review: string): Promise<void>;
    addToCart(productId: bigint, quantity: bigint): Promise<void>;
    calculateTotal(): Promise<number>;
    checkout(paymentMethod: PaymentMethod): Promise<string>;
    searchProducts(searchTerm: string): Promise<Array<Product>>;
    viewCart(): Promise<Array<CartItem>>;
}
