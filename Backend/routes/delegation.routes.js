import { Router } from "express";
import { verifyJWT } from "../middlewares/verifyJWT.js";
import {
  grantDelegate,
  revokeDelegate,
  getMyDelegates,
  getDelegatingFor,
  switchContext,
} from "../controllers/delegation.controller.js";

const router = Router();
router.use(verifyJWT);

router.post("/", grantDelegate);
router.delete("/:delegationId", revokeDelegate);
router.get("/my-delegates", getMyDelegates);
router.get("/delegating-for", getDelegatingFor);
router.post("/switch-context", switchContext);

export default router;
