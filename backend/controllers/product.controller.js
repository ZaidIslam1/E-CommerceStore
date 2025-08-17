import Product from "../models/product.model.js";
import { redis } from "../config/redis.js";
import cloudinary from "../config/cloudinary.js";

export const getAllProducts = async (req, res, next) => {
    try {
        const products = await Product.find({}).sort({ name: 1 });
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

export const createProduct = async (req, res, next) => {
    try {
        const { name, description, price, category, image } = req.body;

        if (!name || !description || !price || !category || !image) {
            return res.status(400).json({
                message: "Must provide product name, description, price, category, and image",
            });
        }

        const response = await cloudinary.uploader.upload(image);
        const product = await Product.create({
            name,
            description,
            price,
            image: response.secure_url,
            category,
        });

        res.status(201).json({
            success: true,
            product,
            message: "Product created successfully",
        });
    } catch (error) {
        console.error("Error in createProduct", error.message);
        next(error);
    }
};

export const deleteProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.params;
        const productToDelete = await Product.findById(productId);
        if (!productToDelete) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (productToDelete.image) {
            await cloudinary.uploader.destroy(productToDelete.image.split("/").pop().split(".")[0]);
        }

        await Product.findByIdAndDelete(productId);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error in deleteProduct", error.message);
        next(error);
    }
};

export const getRecommendedProducts = async (req, res, next) => {
    try {
        const recommended = await Product.aggregate([
            {
                $sample: { size: 3 },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    price: 1,
                    image: 1,
                },
            },
        ]);
        res.status(200).json({ recommended });
    } catch (error) {
        console.error("Error in getRecommendedProducts", error.message);
        next(error);
    }
};

export const getProductsByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const products = await Product.find({ category }).lean();
        if (!products) {
            return res.status(404).json({ message: "No products found in this category" });
        }
        res.status(200).json({ products });
    } catch (error) {
        console.error("Error in getProductsByCategory", error.message);
        next(error);
    }
};

export const toggleFeaturedProduct = async (req, res, next) => {
    try {
        const { id: productId } = req.params;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        await product.save();

        // Update the featured products in Redis
        await updateFeaturedProductsInRedis();

        res.status(200).json({
            success: true,
            product,
            message: `Product ${product.isFeatured ? "featured" : "unfeatured"} successfully`,
        });
    } catch (error) {
        console.error("Error in toggleFeaturedProduct", error.message);
        next(error);
    }
};

const updateFeaturedProductsInRedis = async () => {
    try {
        const featured = await Product.find({ isFeatured: true }).lean();
        if (featured.length > 0) {
            await redis.set("featured_products", JSON.stringify(featured));
        } else {
            await redis.del("featured_products");
        }
    } catch (error) {
        console.error("Error updating featured products in Redis", error.message);
    }
};
