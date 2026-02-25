
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PriceSummary from '../PriceSummary';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock Redux hooks and API
vi.mock('@/redux/hooks', () => ({
    useAppSelector: vi.fn(),
    useAppDispatch: vi.fn(),
}));

vi.mock('@/redux/api/adminApi', () => ({
    useGetAppSettingsQuery: vi.fn(),
    useValidateCouponMutation: vi.fn(),
}));

import { useAppSelector } from '@/redux/hooks';
import { useGetAppSettingsQuery, useValidateCouponMutation } from '@/redux/api/adminApi';

describe('PriceSummary Component', () => {
    const mockCartItems = [
        {
            _id: '1',
            product: 'p1',
            name: 'Product 1',
            image: '/placeholder.jpg',
            quantity: 2,
            price: 100,
            originalPrice: 120,
            selectedSize: 'M',
            selectedColor: 'Blue'
        },
        {
            _id: '2',
            product: 'p2',
            name: 'Product 2',
            image: '/placeholder.jpg',
            quantity: 1,
            price: 200,
            originalPrice: 250,
            selectedSize: 'L',
            selectedColor: 'Red'
        }
    ];

    const mockUser = {
        points: 100
    };

    const mockSettings = {
        freeDeliveryThreshold: 500,
        deliveryCharges: 40,
        maxCoinUsagePercentage: 20
    };

    const mockValidateCoupon = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useAppSelector as any).mockReturnValue({ user: mockUser, isAuthenticated: true });
        (useGetAppSettingsQuery as any).mockReturnValue({ data: mockSettings });
        (useValidateCouponMutation as any).mockReturnValue([mockValidateCoupon, { isLoading: false }]);
    });

    it('renders summary correctly with delivery charges', () => {
        // Subtotal: (100*2) + (200*1) = 400
        // Delivery: 40 (threshold 500)
        // Total: 440
        // Coins used: min(100, 20% of 100 = 20, 440) -> 20. But logic says min(coins, maxCoinsAllowed).
        // maxCoinsFromBalance = 100 * 20% = 20.
        // orderTotalBeforeCoins = 400 + 40 = 440.
        // maxCoinsAllowed = min(20, 440) = 20.
        // useCoins (default true) -> min(100, 20) = 20.
        // Displayed Total: 440 - 20 = 420.

        render(<PriceSummary cartItems={mockCartItems} />);

        expect(screen.getByText('Price Details')).toBeInTheDocument();
        expect(screen.getByText('₹490')).toBeInTheDocument(); // MRP: (120*2) + (250*1) = 490
        expect(screen.getByText('-₹90')).toBeInTheDocument(); // Savings: 490 - 400 = 90
        expect(screen.getByText('₹40')).toBeInTheDocument(); // Delivery
        expect(screen.getByText('₹420')).toBeInTheDocument(); // Total
    });

    it('shows free delivery when threshold reached', () => {
        const highValueItems = [
            {
                _id: '1',
                product: 'p1',
                name: 'Expensive Product',
                image: '/placeholder.jpg',
                quantity: 1,
                price: 600,
                originalPrice: 700,
            }
        ];

        render(<PriceSummary cartItems={highValueItems} />);

        expect(screen.getByText('Free')).toBeInTheDocument();
        expect(screen.queryByText('₹40')).not.toBeInTheDocument(); // No delivery charge
    });

    it('displays free delivery tip when applicable', () => {
        // Subtotal 400, Threshold 500
        render(<PriceSummary cartItems={mockCartItems} />);

        // Tip: 500 - 400 = 100
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText(/more for free delivery/i)).toBeInTheDocument();
    });

    it('toggles coin usage correctly', async () => {
        render(<PriceSummary cartItems={mockCartItems} />);

        const switchElement = screen.getByRole('switch');
        expect(switchElement).toBeChecked(); // Default true

        // Initial Total: 420 (calculated earlier)
        expect(screen.getByText('₹420')).toBeInTheDocument();

        // Toggle off
        fireEvent.click(switchElement);

        // Without coins: 400 + 40 = 440
        expect(screen.getByText('₹440')).toBeInTheDocument();
    });

    it('validates and applies coupon', async () => {
        const mockCoupon = { code: 'SAVE10', discountAmount: 50 };
        mockValidateCoupon.mockReturnValue({
            unwrap: vi.fn().mockResolvedValue(mockCoupon) // properly mock unwrap as a spy if needed, or just a function returning a promise
        });
        const setAppliedCoupon = vi.fn();

        render(<PriceSummary cartItems={mockCartItems} setAppliedCoupon={setAppliedCoupon} />);

        const input = screen.getByPlaceholderText('Enter Code');
        const button = screen.getByRole('button', { name: /apply/i });

        fireEvent.change(input, { target: { value: 'SAVE10' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockValidateCoupon).toHaveBeenCalledWith({ code: 'SAVE10', amount: 400 });
        });

        await waitFor(() => {
            expect(setAppliedCoupon).toHaveBeenCalledWith(mockCoupon);
        });
    });

    it('handles invalid coupon', async () => {
        mockValidateCoupon.mockResolvedValue({ unwrap: () => Promise.reject({ data: { message: 'Invalid coupon' } }) });
        const setAppliedCoupon = vi.fn();

        render(<PriceSummary cartItems={mockCartItems} setAppliedCoupon={setAppliedCoupon} />);

        const input = screen.getByPlaceholderText('Enter Code');
        const button = screen.getByRole('button', { name: /apply/i });

        fireEvent.change(input, { target: { value: 'INVALID' } });
        fireEvent.click(button);

        await waitFor(() => {
            expect(setAppliedCoupon).toHaveBeenCalledWith(null);
            // Toast would be called here, but we aren't mocking toast strictly to assert call, 
            // though we could if we exported the mocked toast.
        });
    });
});
