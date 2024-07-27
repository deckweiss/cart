export interface Cart {
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
