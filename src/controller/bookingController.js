import { Op } from "sequelize";
import Booking from "../model/bookingModel.js";
import Room from "../model/room.model.js";
import AppError from "../utlis/appError.js";
import asyncHandler from "../utlis/catchAsync.js";
import { sendMail } from "../utlis/email.js";

/* =========================
   CREATE BOOKING (STUDENT)
========================= */
export const createBooking = asyncHandler(async (req, res, next) => {
  const roomId = req.params.roomId;
  const user = req.user;
  const { startDate } = req.body;

  if (!user) {
    return next(new AppError("User not authenticated", 401));
  }

  const room = await Room.findByPk(roomId);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  // Prevent multiple active bookings by same user
  const existingBooking = await Booking.findOne({
    where: {
      userId: user.userId,
      status: { [Op.notIn]: ["cancelled", "completed"] },
    },
  });

  if (existingBooking) {
    return next(
      new AppError(
        "You already have an active booking and cannot book another room",
        400
      )
    );
  }

  // Count confirmed bookings for room
  const confirmedBookings = await Booking.count({
    where: {
      roomId,
      status: "confirmed",
    },
  });

  if (confirmedBookings >= room.Capacity) {
    room.Status = "Occupied";
    await room.save();
    return next(new AppError("Room is fully booked", 400));
  }

  const parsedStartDate = startDate ? new Date(startDate) : new Date();
  const endDate = new Date(parsedStartDate);
  endDate.setDate(parsedStartDate.getDate() + 30);

  const booking = await Booking.create({
    userId: user.userId,
    roomId,
    total_amount: room.Price,
    status: "pending",
    startDate: parsedStartDate,
    endDate,
  });

  // Email notification
  await sendMail({
    email: user.email,
    subject: "Room Booking Created",
    message: `
A new room booking has been created.

Room ID: ${roomId}
Check-in Date: ${parsedStartDate.toLocaleDateString()}
Check-out Date: ${endDate.toLocaleDateString()}

Please review the booking in the admin panel.
`,
  });

  res.status(201).json({
    status: "success",
    data: booking,
  });
});

/* =========================
   GET ALL BOOKINGS (ADMIN)
========================= */
export const getBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.findAll();

  res.status(200).json({
    status: "success",
    data: bookings,
  });
});

/* =========================
   GET BOOKING BY ID
========================= */
export const getAllBookings = asyncHandler(async (req, res, next) => {
  const booking = await Booking.findByPk(req.params.id);

  if (!booking) {
    return next(new AppError("No booking found", 404));
  }

  res.status(200).json({
    status: "success",
    data: booking,
  });
});

/* =========================
   UPDATE BOOKING (ADMIN ONLY)
========================= */
export const updateBooking = asyncHandler(async (req, res, next) => {

  // 🔒 ADMIN ONLY
  if (req.user.user_type !== "admin") {
    return next(new AppError("Only admin can update bookings", 403));
  }

  const booking = await Booking.findByPk(req.params.id);
  if (!booking) {
    return next(new AppError("No booking found", 404));
  }

  const room = await Room.findByPk(booking.roomId);
  if (!room) {
    return next(new AppError("Room not found", 404));
  }

  const { status, cancellation_reason } = req.body;

  // Count confirmed bookings before update
  let confirmedBookings = await Booking.count({
    where: {
      roomId: booking.roomId,
      status: "confirmed",
    },
  });

  /* ----- STATUS HANDLING ----- */

  if (status === "confirmed") {
    if (confirmedBookings >= room.Capacity) {
      return next(new AppError("Room is fully booked", 400));
    }
    booking.status = "confirmed";
  }

  if (status === "cancelled") {
    booking.status = "cancelled";
    booking.cancellation_reason =
      cancellation_reason || "No reason provided";
    booking.cancellation_date = new Date();
  }

  if (status === "completed") {
    booking.status = "completed";
    booking.check_out_complete = true;
  }

  await booking.save();

  // Update room status after booking update
  confirmedBookings = await Booking.count({
    where: {
      roomId: booking.roomId,
      status: "confirmed",
    },
  });

  room.Status =
    confirmedBookings >= room.Capacity ? "Occupied" : "Available";

  await room.save();

  res.status(200).json({
    status: "success",
    data: booking,
  });
});
