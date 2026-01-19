import express from 'express';
import { singleUpload } from '../middleware/multer.js';
import {  handleForgotPassword, login, logOut, OwnDetail, registerUser, resetPassword, updateMe, verifyOtp } from '../controller/auth.controller.js';
import { protectedRoutes } from '../middleware/protectedroutes.js';
const router= express.Router();
router.post('/register',singleUpload ,registerUser);
router.post('/login',login);
router.post('/forget-password',handleForgotPassword);
router.patch('/update-profile',protectedRoutes,updateMe);
router.post("/verify-otp",verifyOtp)
router.post("/reset-password",resetPassword);
router.get('/logout',logOut);
router.get('/detail',protectedRoutes,OwnDetail);
export default router;
