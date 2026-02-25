import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { Shipping } from '../Shipping';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { userData as userReducer } from '@/redux/reducer/userReducer';
import cartReducer, { addShippingInfo } from '@/redux/reducer/cartReducer';

// Mock Modules
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('../../layout/Header', () => ({ Header: () => <div data-testid="header">Header</div> }));
vi.mock('../../layout/Footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('../CheckoutSteps', () => ({ CheckoutSteps: () => <div data-testid="checkout-steps">Checkout Steps</div> }));

// Mock Dispatch
const mockDispatch = vi.fn();
vi.mock('@/redux/hooks', async () => {
    const actual = await vi.importActual('@/redux/hooks');
    return {
        ...actual,
        useAppDispatch: () => mockDispatch,
    };
});

// Helper to render with store
const renderWithProvider = (
    component: React.ReactNode,
    initialState: any = {}
) => {
    const store = configureStore({
        reducer: {
            user: userReducer,
            cart: cartReducer,
        },
        preloadedState: initialState,
    });
    return render(<Provider store={store}>{component}</Provider>);
};

describe('Shipping Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders shipping form correctly', () => {
        renderWithProvider(<Shipping />);

        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-steps')).toBeInTheDocument();
        expect(screen.getByText('Add/Update Shipping Details')).toBeInTheDocument();
        expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Street Address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/State/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Pincode/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    });

    it('pre-fills form with user data', () => {
        const initialState = {
            user: {
                user: { name: 'Test User', email: 'test@example.com' },
                isAuthenticated: true,
            },
        };
        renderWithProvider(<Shipping />, initialState);

        expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
        expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });

    it('submits form with valid data', async () => {
        renderWithProvider(<Shipping />);

        fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/Street Address/i), { target: { value: '123 Main St' } });
        fireEvent.change(screen.getByLabelText(/City/i), { target: { value: 'New York' } });
        fireEvent.change(screen.getByLabelText(/State/i), { target: { value: 'NY' } });
        fireEvent.change(screen.getByLabelText(/Country/i), { target: { value: 'USA' } });
        fireEvent.change(screen.getByLabelText(/Pincode/i), { target: { value: '10001' } });
        fireEvent.change(screen.getByLabelText(/Phone Number/i), { target: { value: '1234567890' } });

        const submitBtn = screen.getByRole('button', { name: /Continue to Summary/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith(expect.objectContaining({
                payload: expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com',
                    address: '123 Main St',
                    city: 'New York',
                    state: 'NY',
                    country: 'USA',
                    pinCode: 10001,
                    phoneNo: 1234567890,
                }),
                type: 'cart/addShippingInfo'
            }));
            expect(mockPush).toHaveBeenCalledWith('/order-summary');
        });
    });

    it('validates required fields', async () => {
        renderWithProvider(<Shipping />);

        const submitBtn = screen.getByRole('button', { name: /Continue to Summary/i });
        fireEvent.click(submitBtn);

        await waitFor(() => {
            // Check for validation messages or that dispatch wasn't called
            // Since we don't know exact validation message text easily without running, 
            // we check dispatch not called.
            expect(mockDispatch).not.toHaveBeenCalled();
        });
    });
});
