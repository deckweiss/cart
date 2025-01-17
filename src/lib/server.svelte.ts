import type { Handle } from '@sveltejs/kit';
import { COOKIE_NAME } from './constants.js';
import { ServerCart } from './cart.svelte.js';

export const handle: Handle = function (input) {
    input.event.locals.cart = ServerCart.fromSerialized(input.event.cookies.get(COOKIE_NAME) || '');
    return input.resolve(input.event);
};
