import { Router } from "express";
import {verifyJWT} from "../middlewares/verifyJWT.js";
import { addExpense, deleteExpense, getExpense } from "../controllers/Expense.controller.js";
const router = Router();


router.use(verifyJWT);
router.post('/',addExpense)
router.get("/",getExpense);
router.delete("/:id",deleteExpense);

export default router