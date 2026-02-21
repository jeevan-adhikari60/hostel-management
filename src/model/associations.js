import Room from "./room.model.js";
import Booking from "./bookingModel.js";

import User from "./user.model.js";

/* ================= ROOM ↔ BOOKING ================= */

Room.hasMany(Booking, {
    foreignKey: "roomId",
    as: "bookings"
});

Booking.belongsTo(Room, {
    foreignKey: "roomId",
    as: "room"
});

/* ================= USER ↔ BOOKING ================= */

User.hasMany(Booking, {
    foreignKey: "userId",
    as: "bookings"
});

Booking.belongsTo(User, {
    foreignKey: "userId",
    as: "user"
});


export default { Room, Booking, User };