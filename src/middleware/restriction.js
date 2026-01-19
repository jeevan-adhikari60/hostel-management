import AppError from "../utlis/appError.js";

export const restrictTo = (role) => (req, res, next) => {
    if (role === req.user.user_type) {
        return res.status(403).json({
            status: "403 Forbidden",
            message: "you have not access to perform this action"
        })
    }
    next();
};