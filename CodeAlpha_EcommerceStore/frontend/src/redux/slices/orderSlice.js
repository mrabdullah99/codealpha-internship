import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const createOrder = createAsyncThunk(
  "orders/create",
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;
      const { data } = await axios.post("/api/orders", orderData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      return data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  },
);

const orderSlice = createSlice({
  name: "orders",
  initialState: { order: {}, loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default orderSlice.reducer;
