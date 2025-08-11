import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../config/stripe.js";

const findValidCoupon = async (couponCode, userId) => {
    const coupon = await Coupon.findOne({ code: couponCode, isActive: true });

    if (!coupon || coupon.expiresAt < new Date()) {
        return null;
    }
    if (coupon.userId && coupon.userId !== userId) {
        return null;
    }
    return coupon;
};

export const checkoutSuccess = async (req, res, next) => {
    try {
        const sessionId = req.body;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            if (session.metadata.couponCode) {
                await Coupon.findOneAndUpdate(
                    { code: session.metadata.couponCode, userId: req.user._id },
                    { isActive: false }
                );
            }

            const products = JSON.parse(session.metadata.products);
            const newOrder = new Order({
                userId: session.metadata.userId,
                products: products.map((p) => ({
                    product: p.id,
                    quantity: p.quantity,
                    price: p.price,
                })),
                totalAmount: session.amount_total / 100, // Convert cents to dollars
                couponCode: session.metadata.couponCode || null,
                stripeSessionId: session.id,
            });

            await order.save();
            return res.status(200).json({
                success: true,
                message: "Order placed successfully",
                orderId: newOrder._id,
            });
        }

        res.status(200).json({ message: "Payment successful", session });
    } catch (error) {
        console.log("Error in checkoutSuccess", error.message);
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
            };
        });

        let coupon = null;
        if (couponCode) {
            coupon = await findValidCoupon(couponCode, req.user._id);
            if (coupon) {
                const discountAmount = Math.round((totalAmount * coupon.discountPercentage) / 100);
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
                products: JSON.stringify(
                    products.map((p) => ({
                        id: p._id,
                        quantity: p.quantity,
                        price: p.price,
                    }))
                ),
            },
        });

        if (totalAmount >= 20000) {
            await createCoupon(req.user._id);
        }
        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
    } catch (error) {
        console.log("Error in createCheckoutSession", error.message);
        next(error);
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
