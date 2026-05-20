import { useCartStore } from '@/stores/cartStore';

describe('Cart store — happy path', () => {
  beforeEach(() => {
    // Reset store and localStorage between tests
    useCartStore.getState().clearCart();
    localStorage.clear();
  });

  it('adds item to cart and updates quantity', () => {
    const item = { id: 101, title: 'Test Book', price: 9.99 } as any;

    useCartStore.getState().addItem(item);
    let state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(1);

    // Add same item again -> quantity increases
    useCartStore.getState().addItem(item);
    state = useCartStore.getState();
    expect(state.cart.length).toBe(1);
    expect(state.cart[0].quantity).toBe(2);

    // Update quantity directly
    useCartStore.getState().updateQuantity(101, 5);
    state = useCartStore.getState();
    expect(state.cart[0].quantity).toBe(5);
  });
});
