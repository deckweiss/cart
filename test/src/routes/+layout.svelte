<script lang="ts">
    import { setCartContext } from '@deckweiss/cart';

    let { data, children } = $props();

    setCartContext(data.cart);
</script>

{@render children()}
