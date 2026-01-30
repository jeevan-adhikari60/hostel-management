import Room from "../model/room.model.js";
import asyncHandler from "../utlis/catchAsync.js";
import AppError from "../utlis/appError.js";
import { getDataUri } from "../utlis/dataUri.js";
import cloudinary from "../utlis/cloudinary.js";

/* CREATE ROOM WITH IMAGE UPLOAD */
export const createRoom = asyncHandler(async (req, res, next) => {
  const { RoomNumber, Capacity, Status, Type, Description, Price, FloorNumber } = req.body;

  if (!RoomNumber || !Capacity || !Type || !Price || !FloorNumber) {
    return next(new AppError("All fields are required", 400));
  }

  if (Capacity <= 0) {
    return next(new AppError("Capacity must be greater than zero", 400));
  }

  const validStatus = ["Available", "Occupied"];
  if (Status && !validStatus.includes(Status)) {
    return next(new AppError("Invalid status", 400));
  }
  const existingRoom = await Room.findOne({ where: { RoomNumber } });
  if (existingRoom) {
    return next(new AppError("Room with this number already exists", 400));
  }

  let imageUrl = null;

  // Handle file upload
  if (req.file) {
    try {
      const fileUri = getDataUri(req.file);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      imageUrl = cloudResponse.secure_url;
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      return next(new AppError("Room image upload failed", 500));
    }
  }

  const room = await Room.create({
    RoomNumber,
    Capacity,
    Status: Status || "Available",
    Type,
    Description,
    Price,
    FloorNumber,
    RoomImage: imageUrl,
  });

  res.status(201).json({
    status: "success",
    message: "Room created successfully",
    data: room,
  });
});

/* GET ROOM BY ID */
export const getRoomById = asyncHandler(async (req, res, next) => {
  const room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: room,
  });
});

/* GET ALL ROOMS */
export const getAllRoom = asyncHandler(async (req, res, next) => {
  const rooms = await Room.findAll();

  res.status(200).json({
    status: "success",
    results: rooms.length,
    data: rooms,
  });
});

/* UPDATE ROOM */
export  const updateRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  await room.update(req.body);

  res.status(200).json({
    status: "success",
    message: "Room updated successfully",
    data: room,
  });
});

/* DELETE ROOM */
export const deleteRoom = asyncHandler(async (req, res, next) => {
  const room = await Room.findByPk(req.params.id);

  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  await room.destroy();

  res.status(204).json({
    status: "success",
    message: "Room deleted successfully",
    data: null,
  });
});
