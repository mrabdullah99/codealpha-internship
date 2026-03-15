import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  list: [],
};
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    setProducts: (state, action) => {
      state.list = action.payload;
    },
  },
});
export const { setProducts } = productSlice.actions;
export default productSlice.reducer;
