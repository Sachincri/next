import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartState, CartItem, ShippingInfo, CartSummary } from "@/types/cart";
import { cartApi } from "../api/cartApi";

const isClient = typeof window !== "undefined";

const initialState: CartState = {
  cartItems: isClient ? JSON.parse(localStorage.getItem("cartItems") || "[]") : [],
  shippingInfo: isClient
    ? JSON.parse(localStorage.getItem("shippingInfo") || JSON.stringify({
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      country: "",
      phoneNo: "",
      pinCode: 0,
    }))
    : {
      firstName: "",
      lastName: "",
      address: "",
      city: "",
      state: "",
      country: "",
      phoneNo: "",
      pinCode: 0,
    },
  cartSummary: null,
  loading: false,
  error: null,
  message: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartRequest: (state) => {
      state.loading = true;
    },
    addToCartSuccess: (state, action: PayloadAction<CartItem>) => {
      state.loading = false;
      const item = action.payload;
      const isItemExist = state.cartItems.find((i) => i.product === item.product);

      if (isItemExist) {
        state.cartItems = state.cartItems.map((i) =>
          i.product === isItemExist.product ? item : i
        );
      } else {
        state.cartItems.push(item);
      }
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    addToCartFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cartItems = state.cartItems.filter(
        (i) => i.product !== action.payload
      );
      localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
    },
    addShippingInfo: (state, action: PayloadAction<ShippingInfo>) => {
      state.shippingInfo = action.payload;
      localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
    },
    emptyState: (state) => {
      state.cartItems = [];
      state.shippingInfo = {
        firstName: "",
        lastName: "",
        address: "",
        city: "",
        state: "",
        country: "",
        phoneNo: "",
        pinCode: 0,
      };
      localStorage.removeItem("cartItems");
      localStorage.removeItem("shippingInfo");
    },
    clearError: (state) => {
      state.error = null;
    },
    clearMessage: (state) => {
      state.message = null;
    },
    // New Backend Actions
    getCartRequest: (state) => {
      state.loading = true;
    },
    getCartSuccess: (state, action: PayloadAction<CartItem[]>) => {
      state.loading = false;
      state.cartItems = action.payload;
    },
    getCartFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    getCartSummarySuccess: (state, action: PayloadAction<CartSummary>) => {
      state.cartSummary = action.payload;
    },
    syncCartRequest: (state) => {
      state.loading = true;
    },
    syncCartSuccess: (state, action: PayloadAction<{ cartItems: CartItem[], message: string }>) => {
      state.loading = false;
      state.cartItems = action.payload.cartItems;
      state.message = action.payload.message;
    },
    syncCartFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateCartItemRequest: (state) => {
      state.loading = true;
    },
    updateCartItemSuccess: (state, action: PayloadAction<{ item: CartItem, message: string }>) => {
      state.loading = false;
      const updatedItem = action.payload.item;
      state.cartItems = state.cartItems.map((i) =>
        i.product === updatedItem.product ? updatedItem : i
      );
      state.message = action.payload.message;
    },
    updateCartItemFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    removeFromCartRequest: (state) => {
      state.loading = true;
    },
    removeFromCartSuccess: (state, action: PayloadAction<{ productId: string, message: string }>) => {
      state.loading = false;
      state.cartItems = state.cartItems.filter((i) => i.product !== action.payload.productId);
      state.message = action.payload.message;
    },
    removeFromCartFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearCartRequest: (state) => {
      state.loading = true;
    },
    clearCartSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.cartItems = [];
      state.message = action.payload;
    },
    clearCartFail: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  addToCartRequest,
  addToCartSuccess,
  addToCartFail,
  removeFromCart,
  addShippingInfo,
  emptyState,
  clearError,
  clearMessage,
  getCartRequest,
  getCartSuccess,
  getCartFail,
  getCartSummarySuccess,
  syncCartRequest,
  syncCartSuccess,
  syncCartFail,
  updateCartItemRequest,
  updateCartItemSuccess,
  updateCartItemFail,
  removeFromCartRequest,
  removeFromCartSuccess,
  removeFromCartFail,
  clearCartRequest,
  clearCartSuccess,
  clearCartFail,
} = cartSlice.actions;

export default cartSlice.reducer;
