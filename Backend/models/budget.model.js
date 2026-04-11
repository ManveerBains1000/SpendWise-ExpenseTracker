import mongoose, { Schema } from "mongoose";

/**
 * Budget model with optimistic concurrency control.
 * Mongoose's built-in __v (versionKey) is used for optimistic locking
 * via the `optimisticConcurrency: true` schema option (Mongoose 7+).
 * On a concurrent save conflict, Mongoose throws a VersionError which
 * the controller catches and retries.
 */
const BudgetSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    spentAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    // The user who created / owns the budget
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // All members who can submit expenses against this budget
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    // Enables optimistic concurrency: Mongoose checks __v before saving,
    // throwing VersionError if another process modified the doc first.
    optimisticConcurrency: true,
  }
);

// Virtual: remaining budget
BudgetSchema.virtual("remainingAmount").get(function () {
  return this.totalAmount - this.spentAmount;
});

BudgetSchema.set("toJSON", { virtuals: true });
BudgetSchema.set("toObject", { virtuals: true });

export const Budget = mongoose.model("Budget", BudgetSchema);
