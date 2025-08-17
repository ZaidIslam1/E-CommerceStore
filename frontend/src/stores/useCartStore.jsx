import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useCartStore = create((set, get) => ({
    loading: false,
    error: null,
    cartItems: [],
    total: 0,
    subtotal: 0,
    coupon: null,

    addToCart: async (product) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/cart/add", {
                productId: product._id,
            });
            set((prevState) => {
                const existingCartItems = prevState.cartItems.find(
                    (item) => item.product._id === product._id
                );
                const newCartItems = existingCartItems
                    ? prevState.cartItems.map((item) =>
                          item.product._id === product._id
                              ? { ...item, quantity: item.quantity + 1 }
                              : item
                      )
                    : [...prevState.cartItems, { product, quantity: 1 }];
                return {
                    cartItems: newCartItems,
                    total: response.data.total,
                    subtotal: response.data.subtotal,
                    loading: false,
                    error: null,
                };
            });
            get().calculateTotals();
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ loading: false });
        }
    },

    getCartItems: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/cart");
            set({ cartItems: response.data.cartItems, loading: false, error: null });
            get().calculateTotals();
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ loading: false });
        }
    },

    calculateTotals: () => {
        const { cartItems, coupon } = get();
        const subtotal = cartItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );
        let total = subtotal;
        if (coupon) {
            total -= (subtotal * coupon.discount) / 100;
        }
        set({ subtotal, total });
    },
}));
