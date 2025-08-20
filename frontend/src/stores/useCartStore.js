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
    isCouponApplied: false,

    addToCart: async (product) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/cart/add", {
                productId: product._id,
            });

            set((prevState) => {
                const existingItem = prevState.cartItems.find((item) => item._id === product._id);

                let newCartItems;
                if (existingItem) {
                    newCartItems = prevState.cartItems.map((item) =>
                        item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
                    );
                } else {
                    newCartItems = [...prevState.cartItems, { ...product, quantity: 1 }];
                }

                return {
                    cartItems: newCartItems,
                    loading: false,
                    error: null,
                };
            });

            get().calculateTotals();
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to add to cart",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to add to cart");
        }
    },

    removeFromCart: async (productId) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.delete("/cart", {
                data: { productId },
            });

            set((prevState) => ({
                cartItems: prevState.cartItems.filter((item) => item._id !== productId),
                loading: false,
                error: null,
            }));

            get().calculateTotals();
            toast.success("Product removed from cart");
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to remove from cart",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to remove from cart");
        }
    },

    updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
            get().removeFromCart(productId);
            return;
        }

        set({ loading: true, error: null });
        try {
            await axiosInstance.put(`/cart/${productId}`, { quantity });

            set((prevState) => ({
                cartItems: prevState.cartItems.map((item) =>
                    item._id === productId ? { ...item, quantity } : item
                ),
                loading: false,
                error: null,
            }));

            get().calculateTotals();
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to update quantity",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to update quantity");
        }
    },

    getCartItems: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/cart");

            const cartItems = response.data.cartItems || [];

            set({
                cartItems: cartItems,
                loading: false,
                error: null,
            });

            get().calculateTotals();
        } catch (error) {
            set({
                cartItems: [],
                error: null,
                loading: false,
            });
        }
    },

    calculateTotals: () => {
        const { cartItems, coupon } = get();
        const subtotal = cartItems.reduce((sum, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = parseInt(item.quantity) || 0;
            return sum + price * quantity;
        }, 0);
        let total = subtotal;
        if (coupon) {
            const discountAmount = (subtotal * parseFloat(coupon.discountPercentage || 0)) / 100;
            total = subtotal - discountAmount;
        }
        set({ subtotal, total });
    },

    clearCart: async () => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.delete("/cart/clear");

            set({
                cartItems: [],
                total: 0,
                subtotal: 0,
                coupon: null,
                isCouponApplied: false,
                loading: false,
                error: null,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to clear cart",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to clear cart");
        }
    },

    applyCoupon: async (couponCode) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post(`/coupon/validate`, {
                code: couponCode,
            });
            const coupon = response.data;
            set({
                coupon,
                isCouponApplied: true,
                loading: false,
                error: null,
            });
            get().calculateTotals();
            toast.success("Coupon applied successfully!");
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to apply coupon",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to apply coupon");
        }
    },

    removeCoupon: () => {
        set({
            coupon: null,
            isCouponApplied: false,
        });
        get().calculateTotals();
        toast.success("Coupon removed successfully!");
    },

    getCoupon: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/coupon");
            const coupon = response.data;
            set({
                coupon,
                loading: false,
                error: null,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Failed to fetch coupon",
                loading: false,
            });
            toast.error(error.response?.data?.message || "Failed to fetch coupon");
        }
    },
}));
