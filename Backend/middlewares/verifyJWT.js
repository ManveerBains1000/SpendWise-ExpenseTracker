import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { Delegation } from "../models/delegation.model.js";
import { ApiError } from "../utils/ApiError.js";

/**
 * verifyJWT middleware
 *
 * Standard auth: validates the JWT in cookie or Authorization header and
 * attaches the user to req.user.
 *
 * Delegation context:
 *   If the client sends the header  X-Delegate-For: <principalId>
 *   the middleware verifies an active delegation exists for the pair
 *   (principal=principalId, delegate=req.user) and sets
 *   req.delegatingFor = principalId  so controllers can use it.
 *
 * This keeps the security model stateless: no session mutation needed.
 */
export const verifyJWT = async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decoded._id).select("-password -refreshToken");
    if (!user) throw new ApiError(401, "Invalid access token");

    req.user = user;

    // ── Delegation context ────────────────────────────────────────────────────
    const principalId = req.header("X-Delegate-For");
    if (principalId) {
      const now = new Date();
      const delegation = await Delegation.findOne({
        principal: principalId,
        delegate: user._id,
        isActive: true,
        $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }],
      });

      if (!delegation) {
        throw new ApiError(403, "No active delegation for the requested principal");
      }

      req.delegatingFor = delegation.principal; // ObjectId of the executive
    }

    next();
  } catch (error) {
    if (error instanceof ApiError) return next(error);
    next(new ApiError(401, "Invalid or expired token"));
  }
};
