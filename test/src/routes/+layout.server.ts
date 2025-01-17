import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = function (event) {
    return { cart: event.locals.cart.cart };
};
