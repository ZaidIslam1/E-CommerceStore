import { ArrowRight, CheckCircle, HandHeart, Gift, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/useCartStore";
import axiosInstance from "../lib/axios";
import Confetti from "react-confetti";
import { toast } from "react-hot-toast";

const PurchaseSuccessPage = () => {
    const [isProcessing, setIsProcessing] = useState(true);
    const { clearCart } = useCartStore();
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);
    const [nextOrderCoupon, setNextOrderCoupon] = useState(null);
    const [copied, setCopied] = useState(false);
    const [hasProcessed, setHasProcessed] = useState(false); // Prevent multiple calls

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Coupon code copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy coupon code");
        }
    };

    useEffect(() => {
        const handleCheckoutSuccess = async (sessionId) => {
            // Check if this session was already processed (using localStorage)
            const processedKey = `processed_${sessionId}`;
            if (localStorage.getItem(processedKey) || hasProcessed) {
                setIsProcessing(false);
                return;
            }

            // Mark as processing immediately
            setHasProcessed(true);
            localStorage.setItem(processedKey, "true");

            try {
                const response = await axiosInstance.post("/payment/checkout-success", {
                    sessionId,
                });
                setOrderId(response.data.orderId);
                if (response.data.nextOrderCoupon) {
                    setNextOrderCoupon(response.data.nextOrderCoupon);
                }
                clearCart();
            } catch (error) {
                setError(error.response?.data?.message || "Something went wrong");
                localStorage.removeItem(processedKey);
            } finally {
                setIsProcessing(false);
            }
        };
        const sessionId = new URLSearchParams(window.location.search).get("session_id");
        if (sessionId && !hasProcessed) {
            handleCheckoutSuccess(sessionId);
        } else if (!sessionId) {
            setIsProcessing(false);
            setError("No session ID found in the URL");
        }
    }, [clearCart, hasProcessed]); // Add dependencies

    if (isProcessing) return "Processing...";

    if (error) return `Error: ${error}`;

    return (
        <div className="h-screen flex items-center justify-center px-4">
            <Confetti
                width={window.innerWidth}
                height={window.innerHeight}
                gravity={0.1}
                style={{ zIndex: 99 }}
                numberOfPieces={700}
                recycle={false}
            />

            <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl overflow-hidden relative z-10">
                <div className="p-6 sm:p-8">
                    <div className="flex justify-center">
                        <CheckCircle className="text-emerald-400 w-16 h-16 mb-4" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-center text-emerald-400 mb-2">
                        Purchase Successful!
                    </h1>

                    <p className="text-gray-300 text-center mb-2">
                        Thank you for your order. {"We're"} processing it now.
                    </p>
                    <p className="text-emerald-400 text-center text-sm mb-6">
                        Check your email for order details and updates.
                    </p>
                    <div className="bg-gray-700 rounded-lg p-4 mb-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-400">Order number</span>
                            <span className="text-sm font-semibold text-emerald-400">
                                {orderId}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-400">Estimated delivery</span>
                            <span className="text-sm font-semibold text-emerald-400">
                                3-5 business days
                            </span>
                        </div>
                    </div>

                    {nextOrderCoupon && (
                        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg p-4 mb-6 border-2 border-emerald-400">
                            <div className="flex items-center justify-center mb-2">
                                <Gift className="text-white w-6 h-6 mr-2" />
                                <h3 className="text-lg font-bold text-white">🎉 Bonus Reward!</h3>
                            </div>
                            <p className="text-emerald-100 text-center text-sm mb-3">
                                Congratulations! Your purchase was over $200. Here's a special
                                coupon for your next order:
                            </p>
                            <div className="bg-white rounded-lg p-3 text-center">
                                <div className="flex items-center justify-center gap-2 mb-1">
                                    <div className="text-emerald-700 font-bold text-lg">
                                        {nextOrderCoupon.code}
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(nextOrderCoupon.code)}
                                        className="p-1 hover:bg-emerald-100 rounded transition-colors duration-200"
                                        title="Copy coupon code"
                                    >
                                        {copied ? (
                                            <Check className="w-4 h-4 text-emerald-600" />
                                        ) : (
                                            <Copy className="w-4 h-4 text-emerald-600" />
                                        )}
                                    </button>
                                </div>
                                <div className="text-emerald-600 text-sm font-semibold">
                                    {nextOrderCoupon.discountPercentage}% OFF
                                </div>
                                <div className="text-gray-500 text-xs mt-1">
                                    Expires:{" "}
                                    {new Date(nextOrderCoupon.expirationDate).toLocaleDateString()}
                                </div>
                            </div>
                            <p className="text-emerald-100 text-center text-xs mt-2">
                                Click the copy button to save this code for your next purchase!
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4
             rounded-lg transition duration-300 flex items-center justify-center"
                        >
                            <HandHeart className="mr-2" size={18} />
                            Thanks for trusting us!
                        </button>
                        <Link
                            to={"/"}
                            className="w-full bg-gray-700 hover:bg-gray-600 text-emerald-400 font-bold py-2 px-4 
            rounded-lg transition duration-300 flex items-center justify-center"
                        >
                            Continue Shopping
                            <ArrowRight className="ml-2" size={18} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default PurchaseSuccessPage;
