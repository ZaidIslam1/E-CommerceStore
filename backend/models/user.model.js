import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            min_length: [6, "Password must be at least 6 characters long"],
            required: [true, "Password is required"],
        },
        cartItems: [
            {
                quantity: { type: Number, default: 1 },
                product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
            },
        ],
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
    },

    {
        timestamps: true,
    }
);

const User = mongoose.model("User", userSchema);
export default User;