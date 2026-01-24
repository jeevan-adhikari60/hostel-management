import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import userRoute from "./routes/userroute.js";
import { sequelize } from "./database.js";
import roomRoute from "./routes/room.routes.js";
dotenv.config();


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync({ alter: true });
    console.log("✅ Models synchronized with database");
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error);
  }
};

connectDB();

// sequelize.sync({ alter: true });



app.get("/", (req, res) => {
  res.status(200).json({
    message: "Server is running",
    name: "hostel management system",
  });
});

app.use("/api/auth", userRoute);
app.use("/api/room", roomRoute);


app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
