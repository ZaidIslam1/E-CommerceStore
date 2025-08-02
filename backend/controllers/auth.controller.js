import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis.js";
import bcrypt from "bcryptjs";

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "7d",
    });

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken, next) => {
    try {
        await redis.set(`refreshToken: ${userId}`, refreshToken, "EX", 60 * 60 * 24 * 7); // Store for 7 days
    } catch (error) {
        console.error("Redis error in storeRefreshToken:", error);
        next(error);
    }
};

const setCookies = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        maxAge: 15 * 60 * 1000, // 15 minutes
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000, // 15 minutes
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
};

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const user = await User.create({ name, email, password });

        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken, next);

        setCookies(res, accessToken, refreshToken);
        res.status(201).json({ success: true, user, message: "User created successfully" });
    } catch (error) {
        console.error("Error in signup", error.message);
        next(error);
    }
};
export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }
        const user = await User.findOne({ email });
        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);
            await storeRefreshToken(user._id, refreshToken);
            setCookies(res, accessToken, refreshToken);
        } else {
            return res.status(404).json({ error: "Invalid email or password" });
        }

        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error("Error in login", error.message);
        next(error);
    }
};
export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            await redis.del(`refreshToken: ${decoded.userId}`);
        }
        res.clearCookie("refreshToken");
        res.clearCookie("accessToken");
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("Error in logout", error.message);

        next(error);
    }
};

export const refreshToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedToken = await redis.get(`refreshToken: ${decoded.userId}`);

        if (refreshToken !== storedToken) {
            res.status(401).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: "15m",
        });

        setCookies(res, accessToken, refreshToken);

        res.status(200).json({ message: "Token Refreshed successfully" });
    } catch (error) {
        console.error("Error in refreshToken", error.message);
        next(error);
    }
};
