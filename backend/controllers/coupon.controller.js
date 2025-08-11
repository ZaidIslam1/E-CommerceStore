import Coupon from "../models/coupon.model.js";

export const getCoupon = async (req, res, next) => {
    try {
        const coupon = await Coupon.find({ userId: req.user._id, isActive: true }).lean();
        res.status(200).json(coupon || null);
    } catch (error) {
        console.error("Error in getCoupon", error.message);
        next(error);
    }
};

export const validateCoupon = async (req, res, next) => {
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({
            code: code,
            userId: req.user._id,
            isActive: true,
        }).lean();
        if (!coupon) {
            return res.status(404).json({ message: "Coupon not found or inactive" });
        }
        const currentDate = new Date();
        if (coupon.expirationDate < currentDate) {
            return res.status(400).json({ message: "Coupon has expired" });
        }
        res.status(200).json({
            message: "Coupon is valid",
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
        });
    } catch (error) {
        console.error("Error in validateCoupon", error.message);
        next(error);
    }
};
