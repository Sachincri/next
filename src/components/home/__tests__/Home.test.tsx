import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '../Home';

// Mock Redux API
const { mockUseGetHomePageDataQuery } = vi.hoisted(() => ({
    mockUseGetHomePageDataQuery: vi.fn(),
}));

vi.mock('@/redux/api/homeApi', () => ({
    useGetHomePageDataQuery: mockUseGetHomePageDataQuery,
}));

// Mock Components
vi.mock('../../layout/Header', () => ({ Header: () => <div data-testid="header">Header</div> }));
vi.mock('../../layout/Footer', () => ({ Footer: () => <div data-testid="footer">Footer</div> }));
vi.mock('../CustomCarousel', () => ({ default: () => <div data-testid="carousel">Carousel</div> }));
vi.mock('../BannerSection', () => ({ default: () => <div data-testid="banner-section">Banner Section</div> }));
vi.mock('../HomeProducts', () => ({ HomeProducts: () => <div data-testid="home-products">Home Products</div> }));
vi.mock('../QuadGrid', () => ({ default: () => <div data-testid="quad-grid">Quad Grid</div> }));
vi.mock('../HomeInfiniteScroll', () => ({ HomeInfiniteScroll: () => <div data-testid="infinite-scroll">Infinite Scroll</div> }));

describe('Home Page', () => {
    const mockData = {
        carousel: { items: [{ _id: '1', image: 'img1.jpg', redirectLink: '/link1' }] },
        sections: [
            { order: 1, type: 'banner1', banners: [{ image: 'b1.jpg' }] },
            { order: 2, type: 'products', products: { heading: 'Featured', items: [] } },
            { order: 3, type: 'quad_grid', quads: [] },
            { order: 4, type: 'infiniteScroll' }
        ]
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockUseGetHomePageDataQuery.mockReturnValue({
            data: mockData,
            isLoading: false,
            error: null,
        });
    });

    it('renders header and footer', () => {
        render(<Home />);
        expect(screen.getByTestId('header')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders carousel', () => {
        render(<Home />);
        expect(screen.getByTestId('carousel')).toBeInTheDocument();
    });

    it('renders sections based on data', () => {
        render(<Home />);
        expect(screen.getByTestId('banner-section')).toBeInTheDocument();
        expect(screen.getByTestId('home-products')).toBeInTheDocument();
        expect(screen.getByTestId('quad-grid')).toBeInTheDocument();
        expect(screen.getByTestId('infinite-scroll')).toBeInTheDocument();
    });

    it('renders loading state', () => {
        mockUseGetHomePageDataQuery.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });

        render(<Home />);
        // Assuming your Home component renders a loader or nothing when loading.
        // If it renders a loader, expect checking for it.
        // For now, let's just ensure it doesn't crash and potentially check for a loading indicator if known.
        // If the component returns null on loading (or a specific loader), we can check queries.
        // Let's assume it might render a spinner or "Loading..." text if implemented, 
        // or just nothing of the main content.

        expect(screen.queryByTestId('carousel')).not.toBeInTheDocument();
        expect(screen.queryByTestId('banner-section')).not.toBeInTheDocument();
    });
});
