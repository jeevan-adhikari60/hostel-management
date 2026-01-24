import multer from "multer";

const storage = multer.memoryStorage(); // Use memory storage to access the buffer
export const singleUpload = multer({ storage }).single('profile_picture');
export const roomImage = multer({ storage }).single('roomImage');
