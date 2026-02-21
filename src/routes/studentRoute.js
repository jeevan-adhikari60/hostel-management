import express from 'express';
import {  getUsersWithRooms } from '../controller/auth.controller.js';
const router = express.Router();
import { restrictTo } from '../middleware/restriction.js';
import { protectedRoutes } from '../middleware/protectedroutes.js';
router.get('/' , protectedRoutes, restrictTo('student') ,getUsersWithRooms); 
export default router;