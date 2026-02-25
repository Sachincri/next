import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CartItemCard } from '../CartItemCard';
import { CartItem } from '@/types/cart';

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('@/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: vi.fn(),
}));

// Mock API mutations
const mockUpdateCartItem = vi.fn();
const mockRemoveFromCart = vi.fn();

vi.mock('@/redux/api/cartApi', () => ({
    useUpdateCartItemMutation: () => [mockUpdateCartItem],
    useRemoveFromCartMutation: () => [mockRemoveFromCart],
}));

import { useAppSelector } from '@/redux/hooks';

describe('CartItemCard Component', () => {
    const mockItem: CartItem = {
        product: 'p1',
        name: 'Test Product',
        price: 100,
        quantity: 1,
        image: '/test.jpg',
        stock: 5,
        size: 'M',
        color: 'Blue'
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as any).mockReturnValue({ isAuthenticated: true });
        mockUpdateCartItem.mockResolvedValue({});
        mockRemoveFromCart.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({ message: 'Removed' })
        });
    });

    it('renders item details correctly', () => {
        render(<CartItemCard item={mockItem} />);

        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText('Size: M')).toBeInTheDocument();
        expect(screen.getByText('Color: Blue')).toBeInTheDocument();
    });

    it('calls updateQuantity on + button click', async () => {
        render(<CartItemCard item={mockItem} />);

        // The + button is the second button in the group usually, or we can look by icon or class
        // Easier to assume standard button order: - then +
        // Let's find by svg or role
        // The buttons have specific logic. We need to trigger the click on the + button.
        // The + button increases quantity.

        // Finding buttons by looking for icons might be tricky if they are implicit.
        // Let's rely on the fact their logic is exposed.
        // We can find by role 'button' but there are multiple.

        // We can get all buttons
        const buttons = screen.getAllByRole('button');
        // Filter for quantity controls if needed, or by testing library queries
        // - button (index 0 usually in that div), + button (index 1)

        // Let's use a more robust selector if possible. classes?
        // Code: <Plus className="w-3 h-3" /> inside a button.

        // We can just query by the quantity display and go to siblings.
        const quantityDisplay = screen.getByText('1');
        const plusBtn = quantityDisplay.nextElementSibling as HTMLElement;

        fireEvent.click(plusBtn);

        await waitFor(() => {
            expect(mockUpdateCartItem).toHaveBeenCalledWith({ itemId: 'p1', quantity: 2 });
        });
    });

    it('calls removeFromCart on remove button click', async () => {
        render(<CartItemCard item={mockItem} />);

        const removeBtn = screen.getByText(/REMOVE/i);
        fireEvent.click(removeBtn);

        await waitFor(() => {
            expect(mockRemoveFromCart).toHaveBeenCalledWith('p1');
        });
    });

    it('dispatches local actions when not authenticated', async () => {
        (useAppSelector as any).mockReturnValue({ isAuthenticated: false });

        render(<CartItemCard item={mockItem} />);

        const removeBtn = screen.getByText(/REMOVE/i);
        fireEvent.click(removeBtn);

        await waitFor(() => {
            // Local remove action
            // The action creator returns an object { type: ..., payload: ... }
            // We can check if dispatch was called with an object containing the ID
            expect(mockDispatch).toHaveBeenCalled();
            const callArg = mockDispatch.mock.calls[0][0];
            expect(callArg).toEqual(expect.objectContaining({ payload: 'p1' }));
        });
    });
});
