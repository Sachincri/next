
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ProductState, Product } from "@/types";

// Safe: do NOT call localStorage during module initialisation — this runs on the server too.
// Rehydration from localStorage happens inside the reducer actions (client-only) or via a
// dedicated useEffect in components.
const initialState: ProductState = {
  loading: false,
  products: [],
  product: null,
  error: null,
  message: null,
  recentlyViewed: [],   // Always start empty; client rehydrates via addToRecentlyViewedLocal
  productsCount: 0,
  resultPerPage: 12,
  filteredProductsCount: 0,
  brands: [],
  categories: [],
};


const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    /** Called once in a client-side useEffect to restore recently viewed from localStorage. */
    rehydrateFromStorage: (state) => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("recentlyViewed");
          if (stored) state.recentlyViewed = JSON.parse(stored);
        } catch {
          // Malformed JSON — ignore, keep empty array
        }
      }
    },
    allProductRequest: (state) => {
      state.loading = true;
    },
    allProductSuccess: (
      state,
      action: PayloadAction<{
        products: Product[];
        productsCount: number;
        resultPerPage: number;
        filteredProductsCount: number;
      }>
    ) => {
      state.loading = false;
      state.products = action.payload.products;
      state.productsCount = action.payload.productsCount;
      state.resultPerPage = action.payload.resultPerPage;
      state.filteredProductsCount = action.payload.filteredProductsCount;
      state.error = null;
    },
    allProductFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    productDetailsRequest: (state) => {
      state.loading = true;
    },
    productDetailsSuccess: (state, action: PayloadAction<Product>) => {
      state.loading = false;
      state.product = action.payload;
      state.error = null;
    },
    productDetailsFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    recentlyViewedRequest: (state) => {
      state.loading = true;
    },
    recentlyViewedSuccess: (state, action: PayloadAction<Product[]>) => {
      state.loading = false;
      state.recentlyViewed = action.payload;
      state.error = null;
      localStorage.setItem("recentlyViewed", JSON.stringify(state.recentlyViewed));
    },
    recentlyViewedFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    addToRecentlyViewedSuccess: (state, action: PayloadAction<string>) => {
      state.message = action.payload;
    },
    addToRecentlyViewedLocal: (state, action: PayloadAction<Product>) => {
      const product = action.payload;
      if (!state.recentlyViewed) state.recentlyViewed = [];

      // Remove if exists to move it to the top
      state.recentlyViewed = state.recentlyViewed.filter((i) => i._id !== product._id);

      // Add to front
      state.recentlyViewed.unshift(product);

      // Keep only 10
      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed = state.recentlyViewed.slice(0, 10);
      }

      localStorage.setItem("recentlyViewed", JSON.stringify(state.recentlyViewed));
    },
    addToRecentlyViewedFail: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },

    newReviewRequest: (state) => {
      state.loading = true;
    },
    newReviewSuccess: (state) => {
      state.loading = false;
      state.message = "Review submitted successfully";
    },
    newReviewFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    deleteReviewRequest: (state) => {
      state.loading = true;
    },
    deleteReviewSuccess: (state) => {
      state.loading = false;
      state.message = "Review submitted successfully";
    },
    deleteReviewFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    allReviewRequest: (state) => {
      state.loading = true;
    },
    allReviewSuccess: (state /*, action: PayloadAction<any[]>*/) => {
      state.loading = false;
      // If you want to keep reviews, uncomment & type it in ProductState
      // state.reviews = action.payload;
    },
    allReviewFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    allBrandsRequest: (state) => {
      state.loading = true;
    },
    allBrandsSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.brands = action.payload;
    },
    allBrandsFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    allCategoriesRequest: (state) => {
      state.loading = true;
    },
    allCategoriesSuccess: (state, action: PayloadAction<any[]>) => {
      state.loading = false;
      state.categories = action.payload;
    },
    allCategoriesFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
  },
});

export const {
  rehydrateFromStorage,
  allProductRequest,
  allProductSuccess,
  allProductFail,
  productDetailsRequest,
  productDetailsSuccess,
  productDetailsFail,
  recentlyViewedRequest,
  recentlyViewedSuccess,
  recentlyViewedFail,
  addToRecentlyViewedSuccess,
  addToRecentlyViewedLocal,
  addToRecentlyViewedFail,
  newReviewRequest,
  newReviewSuccess,
  newReviewFail,
  deleteReviewRequest,
  deleteReviewSuccess,
  deleteReviewFail,
  allReviewSuccess,
  allReviewFail,
  allReviewRequest,
  allBrandsRequest,
  allBrandsSuccess,
  allBrandsFail,
  allCategoriesRequest,
  allCategoriesSuccess,
  allCategoriesFail,
  clearError,
  clearMessage,
} = productSlice.actions;

export default productSlice.reducer;
