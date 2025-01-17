import { getContext, setContext } from 'svelte';
import { COOKIE_NAME } from './constants.js';
import type { Cart, CartData, CartMetaData, CartProductMetaData } from './types.js';
import { browser } from '$app/environment';
import { parse } from 'cookie';

let clientCart: Cart;
const contextKey = '$$_cart';

export function setCartContext(cart: CartData) {
    // context only required on server side
    if (!browser) {
        setContext(contextKey, new ServerCart(cart));
    }
}

export function useCart(): Cart {
    if (browser) {
        if (!clientCart) {
            const cookies = parse(document.cookie);
            const cartCookie = cookies ? cookies[COOKIE_NAME] : null;
            clientCart = ClientCart.fromSerialized(cartCookie || '');
        }
        return clientCart;
    } else {
        const cartFromContext = getContext<ServerCart>(contextKey);
        if (!cartFromContext) {
            throw new Error(
                '@deckweiss/cart: initialise SSR cart via calling `setCartContext()` in +layout.svelte'
            );
        }
        return cartFromContext;
    }
}

export class ServerCart implements Cart {
    private data = $state<CartData>(this.getDefaultCart());

    constructor(content: CartData | undefined = undefined) {
        if (content) {
            this.data = content;
        }
    }

    get cart() {
        return this.data;
    }

    addProduct(
        id: string,
        amount: number,
        metaData?: CartProductMetaData,
        constraints?: { maxQuantity: number }
    ) {
        console.warn(
            'Method [addProduct] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    setProduct(id: string, amount: number, metaData?: CartProductMetaData) {
        console.warn(
            'Method [setProduct] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    setMetaData<T extends keyof CartMetaData>(key: T, value: CartMetaData[T]) {
        console.warn(
            'Method [setMetaData] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    setProductMetaData<T extends keyof CartProductMetaData>(
        id: string,
        key: T,
        value: CartProductMetaData[T]
    ) {
        console.warn(
            'Method [setProductMetaData] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    removeProduct(id: string) {
        console.warn(
            'Method [removeProduct] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    removeAllProducts() {
        console.warn(
            'Method [removeAllProducts] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    clear() {
        console.warn(
            'Method [clear] not supported. Cart manipulation is currently not supported server side.'
        );
    }

    static fromSerialized(serialized: string): ServerCart {
        try {
            return new ServerCart(JSON.parse(serialized));
        } catch (e) {
            return new ServerCart();
        }
    }

    private getDefaultCart(): CartData {
        return {
            metaData: {},
            products: []
        };
    }
}

class ClientCart implements Cart {
    private data = $state<CartData>(this.getDefaultCart());

    constructor(content: CartData | undefined = undefined) {
        if (content) {
            this.data = content;
        }
    }

    get cart() {
        return this.data;
    }

    addProduct(
        id: string,
        amount: number,
        metaData?: CartProductMetaData,
        constraints?: { maxQuantity: number }
    ) {
        const productInCart = this.data.products.find((p) => p.id === id);
        const currentAddedAmount = productInCart?.amount ?? 0;
        const hasMaxQuantityConstraint = typeof constraints?.maxQuantity === 'number';

        if (!hasMaxQuantityConstraint || currentAddedAmount + amount <= constraints.maxQuantity) {
            this.setProduct(id, currentAddedAmount + amount, metaData);
        }
    }

    setProduct(id: string, amount: number, metaData?: CartProductMetaData) {
        const newProductIndex = this.data.products.findIndex((p) => p.id === id);
        if (newProductIndex >= 0) {
            this.data.products[newProductIndex].amount = amount;
        } else {
            this.data.products.push({ id, amount, metaData });
        }
        this.persistCart();
    }

    setMetaData<T extends keyof CartMetaData>(key: T, value: CartMetaData[T]) {
        this.data.metaData[key] = value;
        this.persistCart();
    }

    setProductMetaData<T extends keyof CartProductMetaData>(
        id: string,
        key: T,
        value: CartProductMetaData[T]
    ) {
        const productIndex = this.data.products.findIndex((p) => p.id === id);
        if (productIndex >= 0) {
            this.data.products[productIndex].metaData = {
                ...this.data.products[productIndex].metaData,
                [key]: value
            };
        }
    }

    removeProduct(id: string) {
        const productIndex = this.data.products.findIndex((p) => p.id === id);
        if (productIndex >= 0) {
            this.data.products.splice(productIndex, 1);
            this.persistCart();
        }
    }

    removeAllProducts() {
        this.data.products = [];
        this.persistCart();
    }

    clear() {
        this.data = this.getDefaultCart();
        this.persistCart();
    }

    static fromSerialized(serialized: string): ClientCart {
        try {
            return new ClientCart(JSON.parse(serialized));
        } catch (e) {
            return new ClientCart();
        }
    }

    private getDefaultCart(): CartData {
        return {
            metaData: {},
            products: []
        };
    }

    private persistCart(): void {
        // do not store empty carts
        if (
            this.data &&
            (this.data.products.length > 0 || Object.keys(this.data.metaData).length > 0)
        ) {
            document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(this.data))};path=/`;
        } else {
            document.cookie = `${COOKIE_NAME}=;expires=Wed, 14 Jun 2017 07:00:00 GMT;path=/`;
        }
    }
}
