import Product from "../models/product.model.js";

export const getCartProducts = async (req, res, next) => {
    try {
        const products = Product.find({ _id: { $in: req.user.cartItems } });

        if (!products) {
            return res.status(404).json({ message: "No products found in cart" });
        }
        const cartItems = products.map((product) => {
            const item = req.user.cartItems.find(
                (cartItem) => cartItem.productId.toString() === product._id.toString()
            );
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.json(cartItems);
    } catch (error) {
        console.error("Error in getCartProducts", error.message);
        next(error);
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.body;
        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }
        const user = req.user;
        const existingProduct = user.cartItems.find(
            (item) => item.productId.toString() === productId
        );
        if (existingProduct) {
            existingProduct.quantity += 1;
            existingProduct.updatedAt = new Date();
            await user.save();
            return res.status(200).json({ success: true, message: "Product quantity updated" });
        } else {
            user.cartItems.push({ productId, quantity: 1 });
        }

        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.error("Error in addToCart", error.message);
        next(error);
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;
        if (!productId || quantity < 1) {
            return res.status(400).json({ error: "Invalid product ID or quantity" });
        }
        const user = req.user;
        const cartItem = user.cartItems.find((item) => item.productId.toString() === productId);
        if (!cartItem) {
            return res.status(404).json({ error: "Product not found in cart" });
        }
        if (quantity < 1) {
            user.cartItems = user.cartItems.filter(
                (item) => item.productId.toString() !== productId
            );
            await user.save();
            return res.status(200).json(user.cartItems);
        }
        cartItem.quantity = quantity;
        cartItem.updatedAt = new Date();
        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.error("Error in updateQuantity", error.message);
        next(error);
    }
};

export const removeAllQuantity = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;
        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(
                (item) => item.productId.toString() !== productId
            );
        }
        await user.save();
        res.status(200).json(user.cartItems);
    } catch (error) {
        console.error("Error in removeAllQuantity", error.message);
        next(error);
    }
};
