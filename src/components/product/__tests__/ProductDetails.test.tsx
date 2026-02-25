import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('@/redux/hooks', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: vi.fn(),
}));

import { useAppSelector } from '@/redux/hooks';

// Mock API
const { mockGetProductDetails, mockAddToRecentlyViewed, mockAddToCart } = vi.hoisted(() => ({
    mockGetProductDetails: vi.fn(),
    mockAddToRecentlyViewed: vi.fn(),
    mockAddToCart: vi.fn().mockImplementation(() => ({ unwrap: () => Promise.resolve({ message: "Item added" }) })),
}));

vi.mock('@/redux/api/productApi', () => ({
    useGetProductDetailsQuery: () => ({
        data: mockGetProductDetails(),
        isLoading: false,
        error: null,
    }),
    useAddProductReviewMutation: () => [vi.fn()],
    useAddToRecentlyViewedMutation: () => [mockAddToRecentlyViewed],
    useGetProductsQuery: () => ({ data: { products: [] }, isLoading: false }),
    useGetRecentlyViewedQuery: () => ({ data: [], isLoading: false }),
    useSubmitReviewMutation: () => [vi.fn(), {}],
}));

// Mock Cart Api
vi.mock('@/redux/api/cartApi', () => ({
    useAddToCartMutation: () => [mockAddToCart, { isLoading: false }],
}));

// Mock Router
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: vi.fn(),
    }),
    useParams: () => ({ id: 'p1' }),
    usePathname: () => '/product/p1',
}));

// Mock simple components
vi.mock('../ImageMagnifier', () => ({ default: () => <div data-testid="image-magnifier">Image</div> }));
vi.mock('../ReviewModal', () => ({ default: () => <div data-testid="review-modal">Review Modal</div> }));
vi.mock('../Crousal', () => ({ default: () => <div data-testid="carousel">Carousel</div> }));
vi.mock('../ProductsPage', () => ({ default: () => <div data-testid="products-page">Products Page</div> }));
vi.mock('../../layout/Header', () => ({ Header: () => <div data-testid="header">Header</div> }));
vi.mock('../../layout/CategoryNav', () => ({ default: () => <div data-testid="category-nav">CategoryNav</div> }));
vi.mock('../../layout/Breadcrumb', () => ({ default: () => <div data-testid="breadcrumb">Breadcrumb</div> }));
vi.mock('../AISuggestions', () => ({ default: () => <div data-testid="ai-suggestions">AI Suggestions</div> }));
vi.mock('../ProductSlider', () => ({ ProductSlider: () => <div data-testid="product-slider">Product Slider</div> }));


describe('ProductDetails Component', () => {
    const mockProduct = {
        _id: 'p1',
        name: 'Test Product',
        description: 'Test Description',
        sellingPrice: 100,
        maximumRetailPrice: 150,
        images: [{ public_id: '1', url: '/img1.jpg' }],
        category: 'Test Category',
        stock: 10,
        ratings: { average: 4.5, count: 10 },
        numOfReviews: 10,
        reviews: [],
        sizes: ['S', 'M', 'L'],
        offers: [],
        highlights: ['H1', 'H2'],
        specifications: [{ title: 'Spec1', items: [{ key: 'K1', value: 'V1' }] }],
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockGetProductDetails.mockImplementation(() => {
            // console.log('mockGetProductDetails called');
            return mockProduct;
        });
        (useAppSelector as any).mockReturnValue({
            isAuthenticated: true,
            user: { _id: 'u1' },
            recentlyViewed: [] // Satisfy state.product selector
        });
        mockAddToRecentlyViewed.mockReturnValue({ unwrap: vi.fn().mockResolvedValue({}) }); // Correctly mock mutation result
    });

    it('renders product details', () => {
        const { container } = render(<ProductDetails />);
        console.log(container.innerHTML); // Debug output
        expect(screen.getByText('Test Product')).toBeInTheDocument();
        expect(screen.getByText('₹100')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('handles size selection', () => {
        render(<ProductDetails />);
        // console.log('Size test HTML:', document.body.innerHTML);
        screen.debug(undefined, 20000); // Print full DOM
        const sizeBtn = screen.getByText('M');
        fireEvent.click(sizeBtn);
        expect(sizeBtn).toHaveClass('border-blue-600');
    });

    it('handles add to cart', async () => {
        render(<ProductDetails />);
        // Mock add to cart action
        // Since it uses a thunk or direct dispatch, we need to check dispatch
        // The component imports `addToCart` from cartReducer probably?
        // We might need to mock that action creator if we want to check specifics, 
        // OR just check if dispatch was called efficiently.

        // Use a more specific selector
        const addToCartBtns = screen.getAllByRole('button', { name: /add to cart/i, hidden: true });

        // Using the first one (desktop or mobile)
        fireEvent.click(addToCartBtns[0]);

        // It might validate size selection first.
        // Let's select size first
        const sizeBtn = screen.getByText('M');
        fireEvent.click(sizeBtn);

        fireEvent.click(addToCartBtns[0]);

        // Since user is authenticated (mocked in beforeEach), calling addToCartServer (mutation)
        expect(mockAddToCart).toHaveBeenCalledWith({
            productId: 'p1',
            quantity: 1,
            variant: { size: 'M', color: undefined }
        });
    });
});
