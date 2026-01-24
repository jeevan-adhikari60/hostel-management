import express from "express";
import {
  createRoom,
  deleteRoom,
  getAllRoom,
  getRoomById,
  updateRoom,
} from "../controller/room.controller.js";
import { protectedRoutes } from "../middleware/protectedroutes.js";
import { restrictTo } from "../middleware/restriction.js";
import { roomImage } from "../middleware/multer.js";

const router = express.Router();

router.route("/")
  .get(getAllRoom);

router.route("/:id")
  .get(getRoomById);

router.use(protectedRoutes);

router.route("/")
  .post(
   roomImage, restrictTo("student"), createRoom);

router.route("/:id")
  .patch(restrictTo("student"), updateRoom)
  .delete(restrictTo("student"), deleteRoom);

export default router;
