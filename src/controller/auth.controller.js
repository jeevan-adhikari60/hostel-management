import User from "../model/user.model.js";
import AppError from "../utlis/appError.js";
import asyncHandler from "../utlis/catchAsync.js";
import bcrypt from "bcryptjs";

import { getDataUri } from "../utlis/dataUri.js";
import cloudinary from "cloudinary";

import {createToken} from "../utlis/createtoken.js"
import generateOtp from "../utlis/generateOtp.js";
import {sendMail} from "../utlis/email.js"



/* ================= REGISTER ================= */
export const registerUser = asyncHandler(async (req, res, next) => {
    const {
        username,
        email,
        address,
        password,
        confirmPassword,
        user_type,
        phone_number: phoneNumber
    } = req.body;

    if (!username || !email || !password || !confirmPassword || !user_type || !address || !phoneNumber) {
        return next(new AppError('All fields are required', 400));
    }

    if (password !== confirmPassword) {
        return next(new AppError('Password and confirm password must match', 400));
    }

    const allowedRoles = ['student', 'admin'];
    if (!allowedRoles.includes(user_type)) {
        return next(new AppError(
            'Invalid user type. Allowed values: student, admin',
            400
        ));
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        return res.status(400).json({
            status: "failed",
            message: "User already exists",
        });
    }

    let imageUrl = null;
    if (req.file) {
        const fileUri = getDataUri(req.file);
        const upload = await cloudinary.uploader.upload(fileUri.content);
        imageUrl = upload.secure_url;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        password: hashedPassword,
        user_type,
        address,
        phone_number: phoneNumber,
        profile_picture: imageUrl
    });

    const token = await createToken({
        userId: user.id,
        email: user.email,
        user_type: user.user_type,
        username: user.username
    });

    res.cookie("authToken", token, { httpOnly: true });

    user.password = undefined;

    res.status(201).json({
        status: "success",
        data: {
            user,
            authToken: token
        }
    });
});


/* ================= LOGIN ================= */
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return next(new AppError('Invalid email or password', 400));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return next(new AppError('Invalid email or password', 400));
    }

    const token = await createToken({
        userId: user.id,
        email: user.email,
        user_type: user.user_type,
        username: user.username
    });

    res.cookie("authToken", token, { httpOnly: true });

    res.status(200).json({
        status: "success",
        data: {
            user,
            authToken: token
        }
    });
});

/* ================= LOGOUT ================= */
export const logOut = asyncHandler(async (req, res) => {
    res.cookie("authToken", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    });

    res.status(200).json({
        status: "success",
        message: "Logged out successfully"
    });
});

/* ================= UPDATE PROFILE ================= */
export const updateMe = asyncHandler(async (req, res, next) => {
    const updates = req.body;
    const keys = Object.keys(updates);

    if (keys.length === 0) {
        return next(new AppError('Please provide data to update', 400));
    }

    if (keys.includes("password") || keys.includes("user_type")) {
        return next(new AppError('Cannot update password or role here', 400));
    }

    const user = await User.findByPk(req.user.userId);
    if (!user) {
        return next(new AppError('User not found', 404));
    }

    await user.update(updates);

    res.status(200).json({
        status: "success",
        message: "Profile updated",
        data: user
    });
});

/* ================= GET OWN PROFILE ================= */
export const OwnDetail = asyncHandler(async (req, res, next) => {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
        return next(new AppError('User not found', 404));
    }

    res.status(200).json({
        status: "success",
        data: user
    });
});

/* ================= FORGOT PASSWORD ================= */
export const handleForgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    

    if (!email) {
        return res.status(400).json({ message: "Please provide email" });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
        return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOtp();

    await sendMail({
        email: user.email,
        subject: "Reset Password OTP",
        message: `Your OTP is ${otp}`
    });

    user.otp = otp;
    user.otpGeneratedTime = Date.now().toString();
    await user.save();

    res.status(200).json({ message: "OTP sent to email" });
});

/* ================= VERIFY OTP ================= */
export const verifyOtp = asyncHandler(async (req, res) => {
    
    const { otp,email } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "OTP or email missing" });
    }

    const user = await User.findOne({ where: { email, otp } });
    if (!user) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    const diff = Date.now() - parseInt(user.otpGeneratedTime);
    if (diff > 10 * 60 * 1000) {
        return res.status(400).json({ message: "OTP expired" });
    }

   
    res.status(200).json({ message: "OTP verified" });
});

/* ================= RESET PASSWORD ================= */
export const resetPassword = asyncHandler(async (req, res) => {
    const { password, confirmPassword } = req.body;
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Session expired" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.findOne({ where: { email, otp } });
    if (!user) {
        return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(password, 12);
    user.otp = null;
    user.otpGeneratedTime = null;

    await user.save();
    

    res.status(200).json({ message: "Password reset successful" });
});
