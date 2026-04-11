import { Comment } from "../models/comment.model.js";
import { Expense } from "../models/expense.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * GET /api/v1/comments/:expenseId
 * Fetch all comments for a given expense (paginated, oldest first).
 */
const getComments = async (req, res, next) => {
  try {
    const { expenseId } = req.params;

    // Verify expense exists and belongs to the requesting user
    // (or the user is a delegate of the owner)
    const expense = await Expense.findById(expenseId);
    if (!expense) throw new ApiError(404, "Expense not found");

    const canAccess =
      expense.owner.toString() === req.user._id.toString() ||
      (req.delegatingFor &&
        expense.owner.toString() === req.delegatingFor.toString());

    if (!canAccess) throw new ApiError(403, "Access denied");

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const skip = (page - 1) * limit;

    const comments = await Comment.find({ expense: expenseId })
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("author", "username name");

    res.status(200).json(new ApiResponse(200, comments, "Comments fetched"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/comments/:expenseId
 * Add a comment via REST (alternative to WebSocket for non-realtime clients).
 */
const addComment = async (req, res, next) => {
  try {
    const { expenseId } = req.params;
    const { text } = req.body;

    if (!text?.trim()) throw new ApiError(400, "Comment text is required");

    const expense = await Expense.findById(expenseId);
    if (!expense) throw new ApiError(404, "Expense not found");

    const canAccess =
      expense.owner.toString() === req.user._id.toString() ||
      (req.delegatingFor &&
        expense.owner.toString() === req.delegatingFor.toString());

    if (!canAccess) throw new ApiError(403, "Access denied");

    const comment = await Comment.create({
      expense: expenseId,
      author: req.user._id,
      text: text.trim(),
    });

    const populated = await comment.populate("author", "username name");

    // Broadcast via Socket.io if available
    if (req.app.get("io")) {
      req.app
        .get("io")
        .to(`expense:${expenseId}`)
        .emit("new-comment", { comment: populated });
    }

    res.status(201).json(new ApiResponse(201, populated, "Comment added"));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/comments/:commentId
 * Delete own comment.
 */
const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findOneAndDelete({
      _id: commentId,
      author: req.user._id,
    });

    if (!comment) throw new ApiError(404, "Comment not found");

    res.status(200).json(new ApiResponse(200, {}, "Comment deleted"));
  } catch (err) {
    next(err);
  }
};

export { getComments, addComment, deleteComment };
