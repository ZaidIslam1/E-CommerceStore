import { motion } from "framer-motion";
import { useCartStore } from "../stores/useCartStore";
import { Link } from "react-router-dom";
import { MoveRight } from "lucide-react";
import axiosInstance from "../lib/axios";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

const OrderSummary = () => {
    const { total, subtotal, coupon, isCouponApplied, cartItems } = useCartStore();
    const [stripe, setStripe] = useState(null);
    const [stripeLoading, setStripeLoading] = useState(true);

    const savings = subtotal - total;
    const formattedSubtotal = subtotal.toFixed(2);
    const formattedTotal = total.toFixed(2);
    const formattedSavings = savings.toFixed(2);

    useEffect(() => {
        const loadStripeAsync = async () => {
            try {
                // Dynamic import to avoid module loading issues
                const { loadStripe } = await import("@stripe/stripe-js");
                const stripeInstance = await loadStripe(
                    "pk_test_51RuSmg0iGbxZoUEDUDOYgCuMw8mhtBuengwpnBKdtA5KrB7swWlNDZQzarzw8lXae6xG5kYdpUn2wwKmmN2YWOni00N1xMuoaB"
                );
                setStripe(stripeInstance);
            } catch (error) {
                console.error("Failed to load Stripe:", error);
                toast.error("Payment system unavailable");
            } finally {
                setStripeLoading(false);
            }
        };

        loadStripeAsync();
    }, []);

    const handleStripePayment = async () => {
        if (stripeLoading) {
            toast.error("Payment system is still loading. Please wait.");
            return;
        }

        if (!stripe) {
            toast.error("Payment system unavailable. Please try again later.");
            return;
        }

        try {
            const response = await axiosInstance.post("/payment/create-checkout-session", {
                products: cartItems,
                coupon: coupon ? coupon.code : null,
            });

            const session = response.data;
            const result = await stripe.redirectToCheckout({ sessionId: session.id });

            if (result.error) {
                toast.error(result.error.message);
            }
            console.log("session here", response.data);
        } catch (error) {
            console.error("Stripe payment error:", error);
            toast.error("Failed to initiate payment");
        }
    };
    return (
        <motion.div
            className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-4 shadow-sm sm:p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <p className="text-xl font-semibold text-emerald-400">Order summary</p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <dl className="flex items-center justify-between gap-4">
                        <dt className="text-base font-normal text-gray-300">Original price</dt>
                        <dd className="text-base font-medium text-white">${formattedSubtotal}</dd>
                    </dl>

                    {savings > 0 && (
                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-300">Savings</dt>
                            <dd className="text-base font-medium text-emerald-400">
                                -${formattedSavings}
                            </dd>
                        </dl>
                    )}

                    {coupon && isCouponApplied && (
                        <dl className="flex items-center justify-between gap-4">
                            <dt className="text-base font-normal text-gray-300">
                                Coupon ({coupon.code})
                            </dt>
                            <dd className="text-base font-medium text-emerald-400">
                                -{coupon.discountPercentage}%
                            </dd>
                        </dl>
                    )}
                    <dl className="flex items-center justify-between gap-4 border-t border-gray-600 pt-2">
                        <dt className="text-base font-bold text-white">Total</dt>
                        <dd className="text-base font-bold text-emerald-400">${formattedTotal}</dd>
                    </dl>
                </div>

                <motion.button
                    className={`flex w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-medium text-white focus:outline-none focus:ring-4 focus:ring-emerald-300 ${
                        stripeLoading || !stripe
                            ? "bg-gray-600 cursor-not-allowed"
                            : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                    whileHover={!stripeLoading && stripe ? { scale: 1.05 } : {}}
                    whileTap={!stripeLoading && stripe ? { scale: 0.95 } : {}}
                    onClick={handleStripePayment}
                    disabled={stripeLoading || !stripe}
                >
                    {stripeLoading ? "Loading Payment..." : "Proceed to Checkout"}
                </motion.button>

                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm font-normal text-gray-400">or</span>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 text-sm font-medium text-emerald-400 underline hover:text-emerald-300 hover:no-underline"
                    >
                        Continue Shopping
                        <MoveRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};
export default OrderSummary;
