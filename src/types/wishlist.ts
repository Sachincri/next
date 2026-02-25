import { Product } from "./product";

export interface Wishlist {
    _id: string;
    user: string;
    products: Product[];
    createdAt: string;
    updatedAt: string;
}
