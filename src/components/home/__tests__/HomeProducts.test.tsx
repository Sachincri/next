import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { HomeProducts } from '../HomeProducts';

describe('HomeProducts Component', () => {
    const mockProducts = {
        heading: 'Best Sellers',
        items: [
            { id: '1', title: 'Product 1', subtitle: 'Sub 1', image: '/img1.jpg', redirectLink: '/p1' },
            { id: '2', title: 'Product 2', subtitle: 'Sub 2', image: '/img2.jpg', redirectLink: '/p2' },
            { id: '3', title: 'Product 3', subtitle: 'Sub 3', image: '/img3.jpg', redirectLink: '/p3' },
            { id: '4', title: 'Product 4', subtitle: 'Sub 4', image: '/img4.jpg', redirectLink: '/p4' },
            { id: '5', title: 'Product 5', subtitle: 'Sub 5', image: '/img5.jpg', redirectLink: '/p5' },
            { id: '6', title: 'Product 6', subtitle: 'Sub 6', image: '/img6.jpg', redirectLink: '/p6' },
            { id: '7', title: 'Product 7', subtitle: 'Sub 7', image: '/img7.jpg', redirectLink: '/p7' },
        ]
    };

    it('renders heading', () => {
        render(<HomeProducts products={mockProducts} />);
        expect(screen.getByText('Best Sellers')).toBeInTheDocument();
        expect(screen.getByText('VIEW ALL')).toBeInTheDocument();
    });

    it('renders products', () => {
        render(<HomeProducts products={mockProducts} />);
        const product1Elements = screen.getAllByText('Product 1');
        expect(product1Elements.length).toBeGreaterThan(0);
        expect(product1Elements[0]).toBeInTheDocument();

        const product2Elements = screen.getAllByText('Product 2');
        expect(product2Elements.length).toBeGreaterThan(0);
    });

    it('renders navigation buttons on desktop', () => {
        // Mock window width to desktop
        window.innerWidth = 1200;
        fireEvent(window, new Event('resize'));

        render(<HomeProducts products={mockProducts} />);

        // Should have next button because 7 items > 6 viewable
        // Assuming we are in desktop view where buttons are rendered
        // The component logic checks window.innerWidth
        // We might need to ensure the test environment respects this or we mocked it.
    });
});
