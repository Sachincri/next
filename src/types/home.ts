export interface SeoState {
    title: string;
    metaDescription: string;
    slug: string;
    ogImage: string | { url: string; public_id: string };
}

export interface CarouselItem {
    image: string | { url: string; public_id: string };
    title: string;
    subtitle: string;
    redirectLink: string;
}

export interface CarouselState {
    items: CarouselItem[];
}

export interface Banner {
    image: string | { url: string; public_id: string };
    title: string;
    redirectLink: string;
}

export type SectionType = "products" | "banner1" | "banner2" | "banner3" | "quad_grid";

export interface QuadItem {
    image: string | { url: string; public_id: string };
    title: string;
    redirectLink: string;
}

export interface QuadCard {
    title: string;
    items: QuadItem[];
    redirectLink: string;
    redirectText: string;
}

export interface QuadSection extends BaseSection {
    type: "quad_grid";
    quads: QuadCard[];
}

export interface BaseSection {
    id: number;
    order: number;
    type: SectionType;
    bgGradient?: string; // e.g. "from-blue-500 to-purple-600"
    bgColor?: string;
}

export interface ProductsSection extends BaseSection {
    type: "products";
    products: {
        heading: string;
        items: CarouselItem[];
    };
}


export interface BannerSection extends BaseSection {
    type: "banner1" | "banner2" | "banner3";
    banners: Banner[];
}

export interface IHomePageCMS {
    _id?: string;
    headerLogo?: string | { url: string; public_id: string };
    seo: SeoState;
    carousel: CarouselState;
    sections: (ProductsSection | BannerSection | QuadSection)[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}