import { configureStore } from '@reduxjs/toolkit';
import cartReducer from './reducer/cartReducer';
import { userData } from './reducer/userReducer';
import productReducer from './reducer/productReducer';

import { apiSlice } from './api/apiSlice';

export const store = configureStore({
  reducer: {
    user: userData,
    cart: cartReducer,
    product: productReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }).concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export { server } from "./constants";
