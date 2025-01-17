<script lang="ts">
    import { browser } from '$app/environment';
    import { useCart } from '@deckweiss/cart';

    let cart = useCart();
    if (!browser) {
        $inspect(cart.cart);
    }
</script>

<h1>Cart</h1>

<button onclick={() => cart.addProduct('product1', 1)}>Add product 1</button>
<button onclick={() => cart.addProduct('product2', 1)}>Add product 2</button>
<button onclick={() => cart.clear()}>Clear</button>

{#each cart.cart.products as p}
    <div>
        <p>{p.id}, {p.amount}</p>
        <button onclick={() => cart.removeProduct(p.id)}>remove</button>
    </div>
{/each}
