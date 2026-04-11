import mongoose from "mongoose";
import { Budget } from "../models/budget.model.js";
import { Expense } from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { emitBudgetUpdate } from "../utils/socketHandler.js";

const MAX_RETRY = 5; // max optimistic-lock retry attempts

/**
 * POST /api/v1/budgets
 * Create a new shared department budget.
 */
const createBudget = async (req, res, next) => {
  try {
    const { name, department, totalAmount, members } = req.body;

    if (!name || !department || totalAmount === undefined) {
      throw new ApiError(400, "name, department, and totalAmount are required");
    }

    const budget = await Budget.create({
      name,
      department,
      totalAmount,
      owner: req.user._id,
      members: members || [],
    });

    res.status(201).json(new ApiResponse(201, budget, "Budget created"));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/budgets
 * Fetch all budgets the user owns OR is a member of.
 */
const getBudgets = async (req, res, next) => {
  try {
    const budgets = await Budget.find({
      $or: [{ owner: req.user._id }, { members: req.user._id }],
    })
      .populate("owner", "username name")
      .populate("members", "username name");

    res.status(200).json(new ApiResponse(200, budgets, "Budgets fetched"));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/budgets/:id
 */
const getBudgetById = async (req, res, next) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate("owner", "username name")
      .populate("members", "username name");

    if (!budget) throw new ApiError(404, "Budget not found");

    const isMember =
      budget.owner._id.toString() === req.user._id.toString() ||
      budget.members.some((m) => m._id.toString() === req.user._id.toString());

    if (!isMember) throw new ApiError(403, "Access denied");

    res.status(200).json(new ApiResponse(200, budget, "Budget fetched"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/budgets/:id/charge
 * Atomically charge an amount against a shared budget using
 * optimistic concurrency control (Mongoose versionKey / __v).
 *
 * Race condition protection:
 *   1. Read the budget document (includes __v).
 *   2. Validate the amount fits within the remaining balance.
 *   3. Call doc.save() – Mongoose injects "__v: <old>" into the WHERE
 *      clause. If another request already incremented __v, Mongoose
 *      throws a VersionError.
 *   4. Retry up to MAX_RETRY times with exponential back-off.
 */
const chargeBudget = async (req, res, next) => {
  let attempt = 0;

  while (attempt < MAX_RETRY) {
    try {
      const { amount, expenseId } = req.body;

      if (!amount || amount <= 0) {
        throw new ApiError(400, "A positive amount is required");
      }

      const budget = await Budget.findById(req.params.id);
      if (!budget) throw new ApiError(404, "Budget not found");

      const isMember =
        budget.owner.toString() === req.user._id.toString() ||
        budget.members.some((m) => m.toString() === req.user._id.toString());

      if (!isMember) throw new ApiError(403, "Access denied");

      if (budget.spentAmount + amount > budget.totalAmount) {
        throw new ApiError(
          409,
          `Insufficient budget. Remaining: ₹${budget.totalAmount - budget.spentAmount}`
        );
      }

      budget.spentAmount += amount;

      // Link expense to budget if provided
      if (expenseId) {
        await Expense.findByIdAndUpdate(expenseId, { budget: budget._id });
      }

      // save() will fail with VersionError if concurrent modification happened
      const saved = await budget.save();

      // Broadcast live balance to all budget-room subscribers
      const io = req.app.get("io");
      if (io) emitBudgetUpdate(io, saved);

      return res.status(200).json(new ApiResponse(200, saved, "Budget charged successfully"));
    } catch (err) {
      // Optimistic lock conflict → retry
      if (err.name === "VersionError") {
        attempt++;
        // Short exponential back-off: 50ms, 100ms, 200ms …
        await new Promise((r) => setTimeout(r, 50 * 2 ** attempt));
        continue;
      }
      return next(err);
    }
  }

  next(new ApiError(409, "Could not process budget charge due to high concurrency. Please retry."));
};

/**
 * POST /api/v1/budgets/:id/refund
 * Reverse a previous charge (e.g., expense deleted).
 */
const refundBudget = async (req, res, next) => {
  let attempt = 0;

  while (attempt < MAX_RETRY) {
    try {
      const { amount } = req.body;
      if (!amount || amount <= 0) throw new ApiError(400, "A positive amount is required");

      const budget = await Budget.findById(req.params.id);
      if (!budget) throw new ApiError(404, "Budget not found");

      budget.spentAmount = Math.max(0, budget.spentAmount - amount);
      const saved = await budget.save();

      const io = req.app.get("io");
      if (io) emitBudgetUpdate(io, saved);

      return res.status(200).json(new ApiResponse(200, saved, "Budget refunded"));
    } catch (err) {
      if (err.name === "VersionError") {
        attempt++;
        await new Promise((r) => setTimeout(r, 50 * 2 ** attempt));
        continue;
      }
      return next(err);
    }
  }

  next(new ApiError(409, "Refund failed due to concurrency. Please retry."));
};

/**
 * PATCH /api/v1/budgets/:id/members
 * Add members to a budget (owner only).
 */
const addMembers = async (req, res, next) => {
  try {
    const { memberIds } = req.body;
    if (!memberIds?.length) throw new ApiError(400, "memberIds array is required");

    const budget = await Budget.findOne({ _id: req.params.id, owner: req.user._id });
    if (!budget) throw new ApiError(404, "Budget not found or not authorized");

    // Deduplicate
    const existing = new Set(budget.members.map((m) => m.toString()));
    for (const id of memberIds) {
      if (!existing.has(id)) budget.members.push(new mongoose.Types.ObjectId(id));
    }

    const saved = await budget.save();
    const populated = await saved.populate("members", "username name");

    res.status(200).json(new ApiResponse(200, populated, "Members added"));
  } catch (err) {
    next(err);
  }
};

export { createBudget, getBudgets, getBudgetById, chargeBudget, refundBudget, addMembers };
