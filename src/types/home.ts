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

export interface VideoReel {
    video: string | { url: string; public_id: string };
    thumbnail?: string | { url: string; public_id: string };
    title?: string;
    subtitle?: string;
    redirectLink?: string;
    productId?: string;
    duration?: number;
    oembedUrl?: string;
    oembedHtml?: string;
    isOEmbed?: boolean;
}

export type SectionType = "products" | "banner1" | "banner2" | "banner3" | "quad_grid" | "single_product_carousel" | "video_reels";

export interface QuadItem {
    _id?: string;
    image: string | { url: string; public_id: string };
    title: string;
    redirectLink: string;
}

export interface QuadCard {
    _id?: string;
    title: string;
    items: QuadItem[];
    redirectLink: string;
    redirectText: string;
    layout?: 'grid' | 'single' | 'carousel';
}

export interface QuadSection extends BaseSection {
    type: "quad_grid";
    quads: QuadCard[];
}

export interface SingleProductSection extends BaseSection {
    type: "single_product_carousel";
    products: {
        heading: string;
        items: CarouselItem[];
    };
}

export interface BaseSection {
    id: number;
    order: number;
    type: SectionType;
    bgGradient?: string; // e.g. "from-blue-500 to-purple-600"
    bgColor?: string;
    mobileColumns?: 1 | 2;
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

export interface VideoReelSection extends BaseSection {
    type: "video_reels";
    videoReels: VideoReel[];
}

export interface IHomePageCMS {
    _id?: string;
    headerLogo?: string | { url: string; public_id: string };
    storeName?: string;
    seo: SeoState;
    carousel: CarouselState;
    sections: (ProductsSection | BannerSection | QuadSection | SingleProductSection | VideoReelSection)[];
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}