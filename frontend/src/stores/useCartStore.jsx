import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    loading: false,
    error: null,
    cartItems: [],
    totalAmount: 0,
    totalItems: 0,

    addToCart: async (product) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/cart/add", {
                productId: product._id,
            });
            console.log("Product added to cart:", response.data.cartItems);
            set({ cartItems: response.data.cartItems, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ loading: false });
        }
    },
}));
