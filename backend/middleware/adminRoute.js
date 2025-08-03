export const adminRoute = async (req, res, next) => {
    try {
        if (req.user && req.user.role === "admin") {
            next();
        } else {
            res.status(403).json({ message: "Access Denied - Admin Only" });
        }
    } catch (error) {
        console.log("Error in adminRoute", error.message);
        next(error);
    }
};
