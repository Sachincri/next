import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Cart from '../Cart';
import { CartItem } from '@/types/cart';

// Mock RTK Query

// Mock RTK Query
const { mockSyncCart, mockGetCart, mockGetAppSettings, mockValidateCoupon } = vi.hoisted(() => ({
    mockSyncCart: vi.fn(),
    mockGetCart: vi.fn(),
    mockGetAppSettings: vi.fn(),
    mockValidateCoupon: vi.fn(),
}));

vi.mock('@/redux/api/cartApi', () => ({
    useGetCartQuery: mockGetCart,
    useSyncCartMutation: () => [mockSyncCart],
    useGetCartSummaryQuery: vi.fn(),
    useUpdateCartItemMutation: () => [vi.fn()],
    useRemoveFromCartMutation: () => [vi.fn()],
}));

// Mock Admin Api
vi.mock('@/redux/api/adminApi', () => ({
    useGetAppSettingsQuery: mockGetAppSettings,
    useValidateCouponMutation: () => [mockValidateCoupon, { isLoading: false }],
}));

// Mock Next Navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

// Mock Header to avoid authApi dependency
vi.mock('../../layout/Header', () => ({ Header: () => <div data-testid="header">Header</div> }));

import { useAppSelector } from '@/redux/hooks';
import { useGetCartQuery, useSyncCartMutation } from '@/redux/api/cartApi';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

// Create a mock store
const createMockStore = (initialState: any) => {
    return configureStore({
        reducer: {
            user: (state = initialState.user || {}, action) => state,
            cart: (state = initialState.cart || {}, action) => state,
        },
        preloadedState: initialState
    });
};

describe('Cart Component', () => {
    const mockCartItems: CartItem[] = [
        {
            product: 'p1',
            name: 'Product 1',
            price: 100,
            quantity: 2,
            image: '/p1.jpg',
            stock: 10,
        },
        {
            product: 'p2',
            name: 'Product 2',
            price: 200,
            quantity: 1,
            image: '/p2.jpg',
            stock: 5,
        }
    ];

    const mockUser = {
        _id: 'user1',
        name: 'John Doe',
        addresses: [
            {
                isDefault: true,
                name: 'John Doe',
                address: '123 Main St',
                city: 'City',
                state: 'State',
                pincode: '123456',
                mobile: '1234567890'
            }
        ]
    };

    // Helper to render with Provider
    const renderWithProvider = (component: React.ReactNode, initialState: any = {}) => {
        const store = createMockStore(initialState);
        return render(<Provider store={store}>{component}</Provider>);
    };

    beforeEach(() => {
        vi.clearAllMocks();

        mockGetCart.mockReturnValue({
            data: mockCartItems,
            isLoading: false,
        });

        (mockSyncCart).mockReturnValue({
            unwrap: vi.fn().mockResolvedValue({})
        });
        mockGetAppSettings.mockReturnValue({ data: { deliveryCharge: 50, taxRate: 10 } });
        mockValidateCoupon.mockImplementation(() => [vi.fn(), { isLoading: false }]);
    });

    it('renders empty cart state', () => {
        mockGetCart.mockReturnValue({
            data: [],
            isLoading: false,
        });

        const initialState = {
            user: { isAuthenticated: true, user: mockUser },
            cart: { cartItems: [] }
        };

        renderWithProvider(<Cart />, initialState);

        expect(screen.getByText(/Your cart is empty!/i)).toBeInTheDocument();
        expect(screen.getByText(/Shop Now/i)).toBeInTheDocument();
    });

    it('renders cart items correctly', () => {
        mockGetCart.mockReturnValue({
            data: mockCartItems,
            isLoading: false,
        });
        const initialState = {
            user: { isAuthenticated: true, user: mockUser },
            cart: { cartItems: mockCartItems }
        };
        renderWithProvider(<Cart />, initialState);

        expect(screen.getByText('Product 1')).toBeInTheDocument();
        expect(screen.getByText('Product 2')).toBeInTheDocument();
        expect(screen.getByText(/My Cart \(3\)/i)).toBeInTheDocument(); // 2+1 items
    });

    it('displays delivery address', () => {
        const initialState = {
            user: { isAuthenticated: true, user: mockUser },
            cart: { cartItems: mockCartItems }
        };
        renderWithProvider(<Cart />, initialState);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText(/123 Main St/i)).toBeInTheDocument();
    });

    it('navigates to checkout on button click', () => {
        const initialState = {
            user: { isAuthenticated: true, user: mockUser },
            cart: { cartItems: mockCartItems }
        };
        renderWithProvider(<Cart />, initialState);
        const placeOrderBtn = screen.getByText(/Place Order/i);
        fireEvent.click(placeOrderBtn);
        expect(mockPush).toHaveBeenCalledWith('/order-summary');
    });

    it('navigates to shipping if no default address', () => {
        const userNoAddr = { ...mockUser, addresses: [] };
        const initialState = {
            user: { isAuthenticated: true, user: userNoAddr },
            cart: { cartItems: mockCartItems }
        };

        renderWithProvider(<Cart />, initialState);
        const placeOrderBtn = screen.getByText(/Place Order/i);
        fireEvent.click(placeOrderBtn);
        expect(mockPush).toHaveBeenCalledWith('/shipping');
    });
});
