import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  createBudget,
  getBudgets,
  getBudgetById,
  chargeBudget,
  refundBudget,
  addMembers,
} from "../controllers/budget.controller.js";

const router = Router();
router.use(verifyJWT);

router.post("/", createBudget);
router.get("/", getBudgets);
router.get("/:id", getBudgetById);
router.post("/:id/charge", chargeBudget);
router.post("/:id/refund", refundBudget);
router.patch("/:id/members", addMembers);

export default router;
