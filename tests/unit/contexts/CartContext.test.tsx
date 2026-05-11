import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CartProvider, useCart } from '@/contexts/CartContext';

function CartFixture() {
  const { items, addItem, removeItem, updateQuantity, clearCart, getTotalPrice } = useCart();

  return (
    <div>
      <div data-testid="count">{items.length}</div>
      <div data-testid="total">{getTotalPrice()}</div>
      <button onClick={() => addItem({ id: 1, title: 'Book A', price: '12.50' })}>add-a</button>
      <button onClick={() => addItem({ id: 2, title: 'Book B', price: 7 })}>add-b</button>
      <button onClick={() => updateQuantity(1, 3)}>set-a-3</button>
      <button onClick={() => removeItem(1)}>remove-a</button>
      <button onClick={clearCart}>clear</button>
      <div data-testid="quantity-a">{items.find((item) => item.id === 1)?.quantity ?? 0}</div>
    </div>
  );
}

describe('CartContext', () => {
  it('manages cart items and totals', async () => {
    const user = userEvent.setup();

    render(
      <CartProvider>
        <CartFixture />
      </CartProvider>
    );

    expect(screen.getByTestId('count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'add-a' }));
    await user.click(screen.getByRole('button', { name: 'add-a' }));
    await user.click(screen.getByRole('button', { name: 'add-b' }));

    expect(screen.getByTestId('count')).toHaveTextContent('2');
    expect(screen.getByTestId('quantity-a')).toHaveTextContent('2');
    expect(screen.getByTestId('total')).toHaveTextContent('32');

    await user.click(screen.getByRole('button', { name: 'set-a-3' }));
    expect(screen.getByTestId('quantity-a')).toHaveTextContent('3');
    expect(screen.getByTestId('total')).toHaveTextContent('44.5');

    await user.click(screen.getByRole('button', { name: 'remove-a' }));
    expect(screen.getByTestId('count')).toHaveTextContent('1');

    await user.click(screen.getByRole('button', { name: 'clear' }));
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(screen.getByTestId('total')).toHaveTextContent('0');
  });

  it('throws outside the provider', () => {
    const ProblemChild = () => {
      useCart();
      return null;
    };

    expect(() => render(<ProblemChild />)).toThrow('useCart must be used within a CartProvider');
  });
});