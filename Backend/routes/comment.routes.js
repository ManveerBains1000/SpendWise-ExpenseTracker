import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import { getComments, addComment, deleteComment } from "../controllers/comment.controller.js";

const router = Router();
router.use(verifyJWT);

router.get("/:expenseId", getComments);
router.post("/:expenseId", addComment);
router.delete("/:commentId", deleteComment);

export default router;
