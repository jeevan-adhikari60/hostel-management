import express from "express";
import { 
  createMeal, 
  updateMeal, 
  deleteMeal, 
  getAllMeals, 
  getMealsByDay, 
  getWeeklySchedule 
} from "../controller/diningController.js";
import { protectedRoutes } from '../middleware/protectedroutes.js';
import { restrictTo } from "../middleware/restriction.js";

const router = express.Router({ mergeParams: true });
// nologin required routes
router.route("/meals").get(getAllMeals);
router.route("/meals/weekly-schedule").get(getWeeklySchedule);
router.route("/meals/:day").get(getMealsByDay);

router.use(protectedRoutes); 
//now login required routes

router.route("/meals").post(createMeal);//student and admin can create meal
router.route("/meals/:day/:mealType")
  .put(restrictTo("student"), updateMeal)//only admin can update and delete meal
  .delete(restrictTo("student"), deleteMeal);

export default router;
