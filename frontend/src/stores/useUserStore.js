import { create } from "zustand";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useCartStore } from "./useCartStore";

export const useUserStore = create((set, get) => ({
    user: null,
    loading: false,
    error: null,
    checkingAuth: true,

    signup: async ({ name, email, password, confirmPassword }) => {
        set({ loading: true, error: null });
        try {
            if (password !== confirmPassword) {
                return toast.error("Passwords do not match");
            }
            const response = await axiosInstance.post("/auth/signup", { name, email, password });
            set({ user: response.data.user, loading: false, error: null });
        } catch (error) {
            set({ error: error.response?.data?.message || "An error occurred", loading: false });
            toast.error(error.response?.data?.message || "An error occurred");
        } finally {
            set({ loading: false });
        }
    },
    login: async (email, password) => {
        set({ loading: true, error: null });
        try {
            const response = await axiosInstance.post("/auth/login", { email, password });
            set({ user: response.data.user, loading: false, error: null });
            const { getCartItems } = useCartStore.getState();
            await getCartItems();
        } catch (error) {
            set({ error: error.response.data.error, loading: false });
            toast.error(error.response.data.error);
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        set({ loading: true, error: null });
        try {
            await axiosInstance.post("/auth/logout");
            set({ user: null, loading: false, error: null });
            toast.success("Logged out successfully");
        } catch (error) {
            set({ error: error.response.data.message, loading: false });
            toast.error(error.response.data.message);
        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        set({ checkingAuth: true });
        try {
            const response = await axiosInstance.get("/auth/profile");
            set({ user: response.data.user, checkingAuth: false });
        } catch (error) {
            set({ user: null, checkingAuth: false });
        } finally {
            set({ checkingAuth: false });
        }
    },
}));
