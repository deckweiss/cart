# Cart for SvelteKit
This is a shopping cart implementation for SvelteKit applications at Deckweiss.

## Installation
### Step 1: Install package
```sh
pnpm i @deckweiss/cart
```

### Step 2: Add hook
```typescript
// src/hooks.server.ts
import { handle } from '@deckweiss/cart'

export { handle }
```

### Step 3: Initialize useCart()
```typescript
// +layout.server.ts
export const load: LayoutServerLoad = function (event) {
    return { cart: event.locals.cart.cart };
};
```

```svelte
// +layout.svelte
<script lang="ts">
    import { setCartContext } from '@deckweiss/cart';

    let { data, children } = $props();

    setCartContext(data.cart);
</script>

{@render children()}
```

### Step 4: Use cart
```svelte
<script lang="ts">
import useCart from '@deckweiss/cart'
let cart = useCart()
</script>

<button on:click={() => cart.addProduct('id1', 1)}>Add product 1</button>
<button on:click={() => cart.addProduct('id2', 1)}>Add product 2</button>
<button on:click={() => cart.clear()}>Clear cart</button>

{#each cart.cart.products as product}
    <div>
        <h3>{product.id}</h3>
        <p>Amount: {product.amount}</p>
        <button on:click={() => cart.removeProduct(product.id)}>Remove product</button>
    </div>
{:else}
    <p>Cart is empty</p>
{/each}
```

## Custom metadata with TypeScript
The types `CartMetaData` and `CartProductMetaData` support to be extended/augmented via TypeScript. This means, your editor will recognize the custom types and give you intellisense.

```typescript
// src/app.d.ts
declare module '@deckweiss/cart' {
    interface CartMetaData {
        userId?: string
	    note?: string
	    discountCode?: string
    }

    interface CartProductMetaData {
        type?: 'food' | 'tool' | 'book'
    }
}
