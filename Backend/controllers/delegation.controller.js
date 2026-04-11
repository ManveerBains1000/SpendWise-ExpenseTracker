import { Delegation } from "../models/delegation.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * POST /api/v1/delegations
 * Grant delegate access to another user.
 * Body: { delegateUsername }
 *
 * The caller becomes the "principal" (executive).
 */
const grantDelegate = async (req, res, next) => {
  try {
    const { delegateUsername } = req.body;
    if (!delegateUsername) throw new ApiError(400, "delegateUsername is required");

    const delegateUser = await User.findOne({
      username: delegateUsername.toLowerCase(),
    });
    if (!delegateUser) throw new ApiError(404, "User not found");

    if (delegateUser._id.toString() === req.user._id.toString()) {
      throw new ApiError(400, "Cannot delegate to yourself");
    }

    // Upsert: reactivate if it was revoked before
    const delegation = await Delegation.findOneAndUpdate(
      { principal: req.user._id, delegate: delegateUser._id },
      { isActive: true, expiresAt: req.body.expiresAt || null },
      { upsert: true, new: true }
    );

    const populated = await delegation.populate([
      { path: "principal", select: "username name" },
      { path: "delegate", select: "username name" },
    ]);

    res.status(201).json(new ApiResponse(201, populated, "Delegate access granted"));
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/delegations/:delegationId
 * Revoke a delegation (principal only).
 */
const revokeDelegate = async (req, res, next) => {
  try {
    const delegation = await Delegation.findOneAndUpdate(
      { _id: req.params.delegationId, principal: req.user._id },
      { isActive: false },
      { new: true }
    );

    if (!delegation) throw new ApiError(404, "Delegation not found");

    res.status(200).json(new ApiResponse(200, {}, "Delegation revoked"));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/delegations/my-delegates
 * List active delegates granted BY the current user (principal view).
 */
const getMyDelegates = async (req, res, next) => {
  try {
    const delegations = await Delegation.find({
      principal: req.user._id,
      isActive: true,
    }).populate("delegate", "username name email");

    res.status(200).json(new ApiResponse(200, delegations, "Delegates fetched"));
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/v1/delegations/delegating-for
 * List principals the current user can act on behalf of (delegate view).
 */
const getDelegatingFor = async (req, res, next) => {
  try {
    const now = new Date();
    const delegations = await Delegation.find({
      delegate: req.user._id,
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).populate("principal", "username name email");

    res.status(200).json(new ApiResponse(200, delegations, "Principals fetched"));
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/delegations/switch-context
 * Switch the active delegate context.
 * Body: { principalId }  – pass null to revert to own context.
 *
 * This is a stateless pattern: the client sends X-Delegate-For header
 * on subsequent requests; no server-side session is modified.
 * This endpoint merely validates the relationship and returns a confirmation.
 */
const switchContext = async (req, res, next) => {
  try {
    const { principalId } = req.body;

    if (!principalId) {
      return res
        .status(200)
        .json(new ApiResponse(200, { context: "self" }, "Reverted to own context"));
    }

    const now = new Date();
    const delegation = await Delegation.findOne({
      principal: principalId,
      delegate: req.user._id,
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
    }).populate("principal", "username name email");

    if (!delegation) throw new ApiError(403, "No active delegation for this principal");

    res.status(200).json(
      new ApiResponse(200, { context: "delegate", principal: delegation.principal }, "Context switched")
    );
  } catch (err) {
    next(err);
  }
};

export { grantDelegate, revokeDelegate, getMyDelegates, getDelegatingFor, switchContext };
