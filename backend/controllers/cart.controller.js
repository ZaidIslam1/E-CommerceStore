import Product from "../models/product.model.js";

export const getCartProducts = async (req, res, next) => {
    try {
        const validCartItems = req.user.cartItems.filter((item) => item.product);
        const productIds = validCartItems.map((item) => item.product);

        if (productIds.length === 0) {
            return res.status(200).json({ cartItems: [] });
        }

        const products = await Product.find({ _id: { $in: productIds } });

        if (!products || products.length === 0) {
            return res.status(200).json({ cartItems: [] });
        }

        const cartItems = products.map((product) => {
            const item = validCartItems.find(
                (cartItem) => cartItem.product.toString() === product._id.toString()
            );
            return { ...product.toJSON(), quantity: item.quantity };
        });

        res.json({ cartItems });
    } catch (error) {
        console.error("Error in getCartProducts", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const addToCart = async (req, res, next) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ error: "Product ID is required" });
        }

        const user = req.user;

        user.cartItems = user.cartItems.filter((item) => item.product);

        const existingProduct = user.cartItems.find(
            (item) => item.product && item.product.toString() === productId
        );

        if (existingProduct) {
            existingProduct.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();

        res.status(200).json({
            success: true,
            cartItems: user.cartItems,
            message: "Product added to cart",
        });
    } catch (error) {
        console.error("Error in addToCart:", error.message);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
};

export const updateQuantity = async (req, res, next) => {
    try {
        const { productId } = req.params;
        const { quantity } = req.body;

        if (!productId || quantity < 0) {
            return res.status(400).json({ error: "Invalid product ID or quantity" });
        }

        const user = req.user;
        const cartItem = user.cartItems.find(
            (item) => item.product && item.product.toString() === productId
        );

        if (!cartItem) {
            return res.status(404).json({ error: "Product not found in cart" });
        }

        if (quantity === 0) {
            // Remove item from cart
            user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
        } else {
            cartItem.quantity = quantity;
        }

        await user.save();
        res.status(200).json({ success: true, cartItems: user.cartItems });
    } catch (error) {
        console.error("Error in updateQuantity", error.message);
        res.status(500).json({ error: error.message });
    }
};

export const removeAllQuantity = async (req, res, next) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter((item) => item.product.toString() !== productId);
        }

        await user.save();
        res.status(200).json({ success: true, cartItems: user.cartItems });
    } catch (error) {
        console.error("Error in removeAllQuantity", error.message);
        res.status(500).json({ error: error.message });
    }
};
