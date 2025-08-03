import Product from "../models/product.model.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({});
        res.status(200).json({ products });
    } catch (error) {
        console.log("Error in getAllProducts", error.message);
        next(error);
    }
};
