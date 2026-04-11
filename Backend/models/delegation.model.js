import mongoose, { Schema } from "mongoose";

/**
 * Delegation model for impersonation / delegate access.
 * principal  = the executive whose account is being delegated
 * delegate   = the assistant who is granted access
 *
 * When a delegate submits an expense, Expense.owner  = principal._id
 *                                      Expense.submitted_by = delegate._id
 * This preserves strict audit trails.
 */
const DelegationSchema = new Schema(
  {
    principal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    delegate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Optional expiry for time-boxed delegation
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Each pair must be unique
DelegationSchema.index({ principal: 1, delegate: 1 }, { unique: true });

export const Delegation = mongoose.model("Delegation", DelegationSchema);
