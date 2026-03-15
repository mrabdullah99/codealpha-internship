import { configureStore } from "@reduxjs/toolkit";
import productSlice from "./slices/productSlice";
import cartReducer from "./slices/cartSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    products: productSlice,
    cart: cartReducer,
    app: (state = { currency: "$" }) => state,
    auth: authReducer,
  },
});
