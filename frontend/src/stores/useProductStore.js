import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProductStore = create((set, get) => ({
    loading: false,
    error: null,
    products: [],
    setProducts: (products) => set({ products }),

    createProduct: async (productData) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/products/create", productData);
            set((prevState) => ({
                products: [...prevState.products, response.data.product],
                loading: false,
                error: null,
            }));
            toast.success("Product created successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ loading: false });
        }
    },

    fetchAllProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/products");
            set({ products: response.data.products, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    fetchProductsByCategory: async (category) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get(`/products/category/${category}`);
            set({ products: response.data.products, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    fetchFeaturedProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/products/featured");
            set({ products: response.data.featured, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    getRecommendedProducts: async () => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.get("/products/recommendations");
            set({ products: response.data.recommended, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    toggleFeaturedProduct: async (productId) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.patch(`/products/${productId}`);
            set((prevState) => ({
                products: prevState.products.map((product) =>
                    product._id === productId
                        ? { ...product, isFeatured: response.data.product.isFeatured }
                        : product
                ),
                loading: false,
                error: null,
            }));
            toast.success("Product updated successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },

    deleteProduct: async (productId) => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.delete(`/products/${productId}`);
            set((prevState) => ({
                products: prevState.products.filter((product) => product._id !== productId),
                loading: false,
                error: null,
            }));
            toast.success("Product deleted successfully");
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        }
    },
}));
