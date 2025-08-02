export const signup = async (req, res) => {
    try {
        res.send("signup controller");
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
