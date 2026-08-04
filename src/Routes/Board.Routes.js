import { Router } from "express";
import {
  CreateBoard,
  GetBoard,
  GetBoardById,
  UpdateBoard,
  DeleteBoard,
  addBoardMember,
  removeBoardMember,
  leaveBoard,
} from "../Controllers/Board.Controller.js";
import { verifyJWT, verifyBoardAccess, verifyBoardOwner } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT);

// Specific named routes first (to avoid matching /:id parameter)
router.route("/create-board").post(CreateBoard);
router.route("/get-boards").get(GetBoard);
router.route("/admin/all").get(GetBoard);

// Root routes
router.route("/").post(CreateBoard).get(GetBoard);

// Parameterized ID routes (must be placed AFTER specific route paths)
router.route("/:id")
  .get(verifyBoardAccess, GetBoardById)
  .patch(verifyBoardOwner, UpdateBoard)
  .delete(verifyBoardOwner, DeleteBoard);

router.route("/:id/leave").post(verifyBoardAccess, leaveBoard);
router.route("/:id/members").post(verifyBoardOwner, addBoardMember);
router.route("/:id/members/:userId").delete(verifyBoardOwner, removeBoardMember);

export default router;
