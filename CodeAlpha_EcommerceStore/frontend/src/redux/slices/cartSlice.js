import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../../api/axiosConfig";

export const fetchCartFromDB = createAsyncThunk(
  "cart/fetchCartFromDB",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const cartObj = {};
      res.data.cart.forEach((item) => {
        cartObj[item.product._id] = item.quantity;
      });

      return cartObj;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

export const addToCartDB = createAsyncThunk(
  "cart/addToCartDB",
  async ({ productId, quantity = 1 }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/cart/add",
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const cartObj = {};
      res.data.cart.forEach((item) => {
        cartObj[item.product._id] = item.quantity;
      });
      return cartObj;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

export const updateCartQuantityDB = createAsyncThunk(
  "cart/updateCartQuantityDB",
  async ({ productId, quantity }, { rejectWithValue, dispatch }) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(
        "/cart/update",
        { productId, quantity },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const cartObj = {};
      res.data.cart.forEach((item) => {
        cartObj[item.product._id] = item.quantity;
      });
      return cartObj;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  },
);

const initialState = {
  cartItems: {},
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCartLocal: (state, action) => {
      const id = action.payload;
      state.cartItems[id] = (state.cartItems[id] || 0) + 1;
    },

    updateCartQuantity: (state, action) => {
      const { itemId, quantity } = action.payload;
      if (quantity === 0) {
        delete state.cartItems[itemId];
      } else {
        state.cartItems[itemId] = quantity;
      }
    },
    clearCart: (state) => {
      state.cartItems = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartFromDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCartFromDB.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(fetchCartFromDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addToCartDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartDB.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(addToCartDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateCartQuantityDB.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartQuantityDB.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
      })
      .addCase(updateCartQuantityDB.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const getCartCount = (state) =>
  Object.values(state.cart.cartItems).reduce((sum, qty) => sum + qty, 0);

export const { addToCartLocal, updateCartQuantity, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
