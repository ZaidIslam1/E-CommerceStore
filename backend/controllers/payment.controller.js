import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../config/stripe.js";

const findValidCoupon = async (couponCode, userId) => {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon) {
        return null;
    }

    if (coupon.expirationDate < new Date()) {
        return null;
    }

    if (coupon.userId && coupon.userId.toString() !== userId.toString()) {
        return null;
    }

    return coupon;
};

export const checkoutSuccess = async (req, res, next) => {
    try {
        const { sessionId } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "Session ID is required" });
        }

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        let nextOrderCoupon = null;

        if (session.payment_status === "paid") {
            const userId = session.metadata.userId;

            // Check if order already exists for this session (using session.id for consistency)
            const existingOrder = await Order.findOne({ stripeSessionId: session.id });

            if (existingOrder) {
                return res.status(200).json({
                    success: true,
                    message: "Order already processed",
                    orderId: existingOrder._id,
                    nextOrderCoupon: null, // Don't create new coupon for existing orders
                });
            }

            const products = JSON.parse(session.metadata.products);
            const originalTotal =
                parseFloat(session.metadata.originalTotal) || session.amount_total / 100;
            const discountAmount = parseFloat(session.metadata.discountAmount) || 0;
            const finalTotal = session.amount_total / 100; // Always use what Stripe says customer paid

            // Use upsert to prevent race conditions - create order only if it doesn't exist
            try {
                // First, try to find existing order
                let existingOrder = await Order.findOne({ stripeSessionId: session.id });

                if (existingOrder) {
                    return res.status(200).json({
                        success: true,
                        message: "Order already processed",
                        orderId: existingOrder._id,
                        nextOrderCoupon: null, // No coupon for existing orders
                    });
                }

                // If no existing order, create new one
                const orderData = {
                    user: userId,
                    products: products.map((p) => ({
                        product: p.id,
                        quantity: p.quantity,
                        price: p.price,
                    })),
                    totalAmount: parseFloat(finalTotal.toFixed(2)), // Ensure 2 decimal places
                    couponCode: session.metadata.couponCode || null,
                    stripeSessionId: session.id,
                };

                const newOrder = new Order(orderData);
                await newOrder.save();

                // ONLY AFTER successful order creation, deactivate the coupon
                if (session.metadata.couponCode) {
                    await Coupon.findOneAndUpdate(
                        { code: session.metadata.couponCode, userId: userId, isActive: true },
                        { isActive: false }
                    );
                }

                // Only create reward coupon for new orders that qualify
                if (originalTotal >= 200) {
                    nextOrderCoupon = await createCoupon(userId); // default 10%
                }

                return res.status(200).json({
                    success: true,
                    message: "Order placed successfully",
                    orderId: newOrder._id,
                    nextOrderCoupon: nextOrderCoupon,
                });
            } catch (saveError) {
                // Handle race condition - if duplicate key error, find the existing order
                if (saveError.code === 11000 && saveError.keyPattern?.stripeSessionId) {
                    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
                    if (existingOrder) {
                        return res.status(200).json({
                            success: true,
                            message: "Order already processed",
                            orderId: existingOrder._id,
                            nextOrderCoupon: null, // No coupon for race condition cases
                        });
                    }
                }
                throw saveError;
            }
        } else {
            return res.status(400).json({
                success: false,
                message: `Payment not completed. Status: ${session.payment_status}`,
                paymentStatus: session.payment_status,
            });
        }
    } catch (error) {
        next(error);
    }
};

export const createCheckoutSession = async (req, res, next) => {
    try {
        const { products, couponCode } = req.body;
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;
        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // Convert to cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: [product.image],
                    },
                    unit_amount: amount, // Stripe expects amount in cents
                },
                quantity: product.quantity || 1,
            };
        });

        const originalTotal = totalAmount; // Store original before discount
        let discountAmount = 0;
        let coupon = null;
        if (couponCode) {
            coupon = await findValidCoupon(couponCode, req.user._id);
            if (!coupon) {
                return res.status(400).json({ error: "Invalid or expired coupon code" });
            }
            if (coupon) {
                discountAmount = Math.round((totalAmount * coupon.discountPercentage) / 100);
                totalAmount -= discountAmount;
            }
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
            discounts: coupon
                ? [
                      {
                          coupon: await createStripeCoupon(coupon.discountPercentage),
                      },
                  ]
                : [],
            metadata: {
                userId: req.user._id.toString(),
                couponCode: couponCode || "",
                originalTotal: (originalTotal / 100).toString(), // Store original total before discount
                discountAmount: (discountAmount / 100).toString(),
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        res.status(500).json({ error: "Failed to create checkout session" });
    }
};

async function createStripeCoupon(discountPercentage) {
    const coupon = await stripe.coupons.create({
        percent_off: discountPercentage,
        duration: "once",
    });

    return coupon.id;
}

async function createCoupon(userId) {
    const coupon = await Coupon.create({
        code: `GIFT${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        discountPercentage: 10,
        userId: userId,
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    });
    return coupon;
}
