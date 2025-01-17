export interface CartData {
    metaData: CartMetaData;
    products: CartProduct[];
}

export interface CartMetaData {}

export interface CartProduct {
    id: string;
    amount: number;
    metaData?: CartProductMetaData;
}

export interface CartProductMetaData {}

export interface Cart {
    cart: CartData;
    clear: () => void;
    setMetaData: <T extends keyof CartMetaData>(key: T, value: CartMetaData[T]) => void;
    setProductMetaData: <T extends keyof CartProductMetaData>(
        id: string,
        key: T,
        value: CartProductMetaData[T]
    ) => void;
    setProduct: (id: string, amount: number, metaData?: CartProductMetaData) => void;
    addProduct: (id: string, amount: number, metaData?: CartProductMetaData) => void;
    removeProduct: (id: string) => void;
    removeAllProducts: () => void;
}

declare global {
    namespace App {
        interface Locals {
            cart: Cart;
        }
    }
}
