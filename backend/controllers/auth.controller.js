import User from "../models/user.model.js";

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ success: false, message: "User already exists" });
        }
        const user = await User.create({ name, email, password });
        res.status(201).json({ success: true, user, message: "User created successfully" });
    } catch (error) {
        next(error);
    }
};
export const login = async (req, res) => {
    try {
        res.send("login controller");
    } catch (error) {
        next(error);
    }
};
export const logout = async (req, res) => {
    try {
        res.send("logout controller");
    } catch (error) {
        next(error);
    }
};
