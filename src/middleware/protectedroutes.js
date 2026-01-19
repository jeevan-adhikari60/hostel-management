
import AppError from "../utlis/appError.js";
import asyncHandler from "../utlis/catchAsync.js";
import jwt from 'jsonwebtoken';

export const protectedRoutes = asyncHandler(async (req, res, next) => {
  try {

    const authHeader = req.headers?.authorization;
    let authToken;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      authToken = authHeader.split(" ")[1];
    } else if (req.headers.cookie) {
      const tokenCookie = req.headers.cookie
        .split(";")
        .find(c => c.trim().startsWith("authToken="));
      if (tokenCookie) {
        authToken = tokenCookie.split("=")[1];
      }
    }

    if (!authToken) {
      return res.status(401).send("Unauthorized: No token provided.");
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    req.user = decoded;
    console.log("✅ req.user", req.user);

    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return next(new AppError("An error occurred during token verification.", 401));
  }
});
