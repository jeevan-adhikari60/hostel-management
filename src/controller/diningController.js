import { DiningSchedule } from "../model/diningModel.js";
import { Op } from "sequelize";
import AppError from "../utlis/appError.js";
import asyncHandler from "../utlis/catchAsync.js";

/**
 * Create a new meal in the dining schedule
 * @route POST /api/dining/meals
 * @access Admin only
 */
export const createMeal = asyncHandler(async (req, res, next) => {
  const { day, mealType, items, startTime, endTime } = req.body;

  if (!day || !mealType || !items || !startTime || !endTime) {
    return next(new AppError("All fields are required (day, mealType, items, startTime, endTime)!", 400));
  }

  // Check if this day and meal type combination already exists
  const existingMeal = await DiningSchedule.findOne({
    where: {
      day: day.toLowerCase(),
      mealType: mealType.toLowerCase()
    }
  });

  if (existingMeal) {
    return next(new AppError(`Meal for ${day} ${mealType} already exists. Use update instead.`, 400));
  }

  const meal = await DiningSchedule.create({
    day: day.toLowerCase(),
    mealType: mealType.toLowerCase(),
    items,
    startTime,
    endTime
  });

  res.status(201).json({
    status: 'success',
    data: meal
  });
});

/**
 * Get all meals
 * @route GET /api/dining/meals
 * @access Public
 */
export const getAllMeals = asyncHandler(async (req, res, next) => {
  const meals = await DiningSchedule.findAll({
    order: [
      ['day', 'ASC'], 
      ['mealType', 'ASC']
    ]
  });
  
  res.status(200).json({
    status: 'success',
    results: meals.length,
    data: meals
  });
});

/**
 * Get meals by day
 * @route GET /api/dining/meals/:day
 * @access Public
 */
export const getMealsByDay = asyncHandler(async (req, res, next) => {
  const { day } = req.params;
  
  const meals = await DiningSchedule.findAll({
    where: { day: day.toLowerCase() },
    order: [['mealType', 'ASC']]
  });
  
  if (meals.length === 0) {
    return next(new AppError(`No meals found for ${day}.`, 404));
  }
  
  res.status(200).json({
    status: 'success',
    results: meals.length,
    data: meals
  });
});

/**
 * Update a meal by day and mealType
 * @route PUT /api/dining/meals/:day/:mealType
 * @access Admin only
 */
export const updateMeal = asyncHandler(async (req, res, next) => {
  const { day, mealType } = req.params;
  
  const meal = await DiningSchedule.findOne({
    where: {
      day: day.toLowerCase(),
      mealType: mealType.toLowerCase()
    }
  });
  
  if (!meal) {
    return next(new AppError(`Meal not found for ${day} ${mealType}.`, 404));
  }
  
  const updatedMeal = await meal.update(req.body);
  
  res.status(200).json({
    status: 'success',
    data: updatedMeal
  });
});

/**
 * Delete a meal by day and mealType
 * @route DELETE /api/dining/meals/:day/:mealType
 * @access Admin only
 */
export const deleteMeal = asyncHandler(async (req, res, next) => {
  const { day, mealType } = req.params;
  
  const result = await DiningSchedule.destroy({
    where: {
      day: day.toLowerCase(),
      mealType: mealType.toLowerCase()
    }
  });
  
  if (result === 0) {
    return next(new AppError(`Meal not found for ${day} ${mealType}.`, 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: `Meal for ${day} ${mealType} was deleted successfully!`
  });
});

/**
 * Get complete weekly schedule
 * @route GET /api/dining/weekly-schedule
 * @access Public
 */
export const getWeeklySchedule = asyncHandler(async (req, res, next) => {
  const allMeals = await DiningSchedule.findAll({
    order: [
      ['day', 'ASC'], 
      ['mealType', 'ASC']
    ]
  });
  

  const weeklySchedule = {
    monday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    tuesday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    wednesday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    thursday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    friday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    saturday: { breakfast: null, lunch: null, snacks: null, dinner: null },
    sunday: { breakfast: null, lunch: null, snacks: null, dinner: null }
  };
  

  allMeals.forEach(meal => {
    weeklySchedule[meal.day][meal.mealType] = meal;
  });
  
  res.status(200).json({
    status: 'success',
    data: weeklySchedule
  });
});


export default {
  createMeal,
  getAllMeals,
  getMealsByDay,
  updateMeal,
  deleteMeal,
  getWeeklySchedule
};