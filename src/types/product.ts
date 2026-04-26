export interface ProductImage {
  _id?: string;
  url: string;
  public_id: string;
}

export interface Review {
  _id: string;
  user: string;
  name?: string;
  rating: number;
  comment: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  image: {
    public_id: string;
    url: string;
  };
}

export interface Brand {
  _id: string;
  name: string;
  logo: {
    public_id: string;
    url: string;
  };
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  sellingPrice: number;
  actualPrice?: number;
  maximumRetailPrice: number;
  ratings: {
    average: number;
    count: number;
  };
  images: ProductImage[];
  thumbnail?: ProductImage;
  videos?: ProductImage[];
  warranty: string;
  category: string | Category;
  brand?: string | Brand;
  stock: number;
  discount: number;
  numOfReviews: number;
  reviews: Review[];
  user: string;
  offers: string[];
  isActive: boolean;
  specifications: Array<{
    title: string;
    items: Array<{
      key: string;
      value: string;
    }>;
  }>;
  highlights: string[];
  colors: Array<{
    name: string;
    image?: string;
  }>;
  sizes: string[];
  seo?: {
    title?: string;
    description?: string;
    keywords?: string | string[];
  };

  createdAt: string;

  updatedAt: string;
}

export interface ProductCardProps extends Product {
  viewMode?: 'grid' | 'list';
}


export interface ProductSliderProps {
  heading?: string;
  products: Product[];
}

export interface ViewedProduct {
  _id: string;
  product: string;
  image: string;
  name: string;
  rating: number;
  numOfReviews: number;
  sellingPrice: number;
  maximumRetailPrice: number;
  discount: number;
}

export interface ProductState {
  loading: boolean;
  products: Product[];
  product: Product | null;
  error: string | null;
  message: string | null;
  recentlyViewed?: Product[];
  productsCount: number;
  resultPerPage: number;
  filteredProductsCount: number;
  brands?: Brand[];
  categories?: Category[];
}

export interface ProductPageProps {
  searchParams: {
    category?: string;
    keyword?: string;
    page?: string;
    price?: string;
    ratings?: string;
  };
}

export interface ProductDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}



