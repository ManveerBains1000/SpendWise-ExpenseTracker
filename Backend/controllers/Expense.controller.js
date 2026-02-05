import { ApiError } from "../utils/ApiError.js";
import {Expense} from '../models/expense.model.js'
import { ApiResponse } from "../utils/ApiResponse.js";
const addExpense = async (req, res, next) => {
  try {
    const { description, amount, category, recurring, recurrence, startDate } = req.body;

    if (!description || amount === undefined) {
      throw new ApiError(400, "Description and amount are required");
    }

    const newExpense = await Expense.create({
      description,
      amount,
      category,
      owner: req.user._id,
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
        const expenses = await Expense
        .find({ owner: req.user._id })
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
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
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


export {
    addExpense,
    getExpense,
    deleteExpense,
    getSummary,
};