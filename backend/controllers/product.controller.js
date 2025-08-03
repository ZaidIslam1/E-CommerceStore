import Product from "../models/product.model.js";
import { redis } from "../config/redis.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ products });
    } catch (error) {
        console.log("Error in getAllProducts", error.message);
        next(error);
    }
};

export const getFeatured = async (req, res, next) => {
    try {
        let featured = await redis.get("featured_products");
        if (featured) {
            return res.json(JSON.parse(featured));
        }

        featured = await Product.find({ isFeatured: true }).lean();
        if (!featured) {
            return res.status(404).json({ message: "No featured products found" });
        }

        await redis.set("featured_products", JSON.stringify(featured));
        res.status(200).json({ featured });
    } catch (error) {
        console.log("Error in getFeatured", error.message);
        next(error);
    }
};
