import type { Handle } from '@sveltejs/kit';
import { derived, get, writable } from 'svelte/store';
import { parse } from 'cookie';
import type { Cart, CartMetaData, CartProductMetaData } from './types.js';

export function initializeClientCart() {
    const cookies = parse(document.cookie);
    const cartCookie = cookies.hasOwnProperty(COOKIE_NAME) ? cookies[COOKIE_NAME] : null;
    if (cartCookie) {
        const cart = JSON.parse(decodeURIComponent(cartCookie));
        if (cart) {
            const safeCart: Cart = Object.assign(getDefaultCart(), cart);
            _cart.set(safeCart);
        }
    }
}

export const handle: Handle = function ({ event, resolve }) {
    const cartCookie = event.cookies.get(COOKIE_NAME);
    if (cartCookie) {
        const cart = JSON.parse(decodeURIComponent(cartCookie));
        if (cart) {
            _cart.set(cart);
        }
    }
    return resolve(event);
};

const getDefaultCart = (): Cart => ({
    metaData: {},
    products: []
});
const COOKIE_NAME = 'cart';
const _cart = writable<Cart>(getDefaultCart());
export const cart = derived(_cart, (c) => c);

export function clearCart() {
    _cart.set(getDefaultCart());
    persistCart();
}
export function setCartMetaData<T extends keyof CartMetaData>(key: T, value: CartMetaData[T]) {
    const cartContent = get(cart);
    if (cartContent) {
        _cart.set({
            metaData: {
                ...cartContent.metaData,
                [key]: value
            },
            products: cartContent.products
        });
        persistCart();
    }
}
export function setProduct(id: string, amount: number, metaData?: CartProductMetaData) {
    const cartContent = get(cart);
    const newProductIndex = cartContent.products.findIndex((p) => p.id === id);
    if (newProductIndex >= 0) {
        cartContent.products[newProductIndex].amount = amount;
    } else {
        cartContent.products.push({ id, amount, metaData });
    }
    _cart.set(cartContent);
    persistCart();
}
export function addOrAppendToProduct(
    id: string,
    amount: number,
    constraints?: { maxQuantity: number }
) {
    const productInCart = get(cart)?.products.find((p) => p.id === id);
    const currentAddedAmount = productInCart?.amount ?? 0;
    const hasMaxQuantityConstraint = typeof constraints?.maxQuantity === 'number';

    if (!hasMaxQuantityConstraint || currentAddedAmount + amount <= constraints.maxQuantity) {
        setProduct(id, currentAddedAmount + amount);
    }
}
export function removeProduct(id: string) {
    const cartContent = get(cart);
    const productIndex = cartContent.products.findIndex((p) => p.id === id);
    if (productIndex >= 0) {
        cartContent.products.splice(productIndex, 1);
        _cart.set(cartContent);
    }
}
export function removeAllProducts() {
    const cartContent = get(cart);
    cartContent.products = [];
    _cart.set(cartContent);    
}

function persistCart() {
    const cartContent = get(_cart);
    // do not store empty carts
    if (
        cartContent &&
        (cartContent.products.length > 0 || Object.keys(cartContent.metaData).length > 0)
    ) {
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(cartContent))};path=/`;
    } else {
        document.cookie = `${COOKIE_NAME}=;expires=Wed, 14 Jun 2017 07:00:00 GMT;path=/`;
    }
}
