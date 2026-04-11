import { ApiError } from "../utils/ApiError.js";
import {Expense} from '../models/expense.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
import { predictExpenseCategory } from "../utils/aiService.js";
const addExpense = async (req, res, next) => {
  try {
    const { description, amount, category, recurring, recurrence, startDate } = req.body;

    if (!description || amount === undefined) {
      throw new ApiError(400, "Description and amount are required");
    }

    // If acting as a delegate, expense is owned by the principal
    const ownerId = req.delegatingFor || req.user._id;
    const submittedById = req.delegatingFor ? req.user._id : null;

    const newExpense = await Expense.create({
      description,
      amount,
      category,
      owner: ownerId,
      submitted_by: submittedById,
      recurring: recurring || false,
      recurrence: recurrence || 'monthly',
      startDate: startDate ? new Date(startDate) : undefined,
    });

    res.status(201).json(
      new ApiResponse(201, newExpense, "Expense added successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getExpense = async (req,res,next) => {
    try{
        // When a delegate is acting on behalf of a principal, show the principal's expenses
        const ownerId = req.delegatingFor || req.user._id;
        const expenses = await Expense
        .find({ owner: ownerId })
        .populate("submitted_by", "username name")
        .populate("budget", "name department")
        .sort({ date: -1 });
        res.status(200).json(
            new ApiResponse(200,expenses,"Expenses fetched successfully")
        );

    } catch (err) {
        next(err);
    }
}

const deleteExpense = async (req, res, next) => {
  try {
    const ownerId = req.delegatingFor || req.user._id;
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      owner: ownerId,
    });

    if (!expense) {
      throw new ApiError(404, "Expense not found");
    }

    res.status(200).json(
      new ApiResponse(200, {}, "Expense deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};

const getSummary = async (req, res, next) => {
  try {
    const expenses = await Expense.find({ owner: req.user._id });

    let totalExpense = 0;
    expenses.forEach(exp => totalExpense += exp.amount);

    res.status(200).json(
      new ApiResponse(200, { totalExpense }, "Summary fetched")
    );
  } catch (error) {
    next(error);
  }
};

const predictCategory = async (req, res, next) => {
  try {
    const { description } = req.body;

    if (!description || !description.trim()) {
      throw new ApiError(400, "Description is required");
    }

    // Call AI service to predict category
    const predictedCategory = await predictExpenseCategory(description);

    res.status(200).json(
      new ApiResponse(200, { category: predictedCategory }, "Category predicted successfully")
    );
  } catch (error) {
    next(error);
  }
};


export {
    addExpense,
    getExpense,
    deleteExpense,
    getSummary,
    predictCategory,
};