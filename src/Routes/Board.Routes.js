import { Router } from "express";
import {
    CreateBoard,
    GetBoard,
    GetBoardById,
    UpdateBoard,
    DeleteBoard,
    addBoardMember,
    removeBoardMember
} from "../Controllers/Board.Controller.js";
import { verifyJWT, verifyBoardAccess, verifyBoardOwner } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/").post(verifyJWT, CreateBoard).get(verifyJWT, GetBoard);
router.route("/create-board").post(verifyJWT, CreateBoard);
router.route("/get-boards").get(verifyJWT, GetBoard);

router.route("/:id")
    .get(verifyJWT, verifyBoardAccess, GetBoardById)
    .patch(verifyJWT, verifyBoardOwner, UpdateBoard)
    .delete(verifyJWT, verifyBoardOwner, DeleteBoard);

router.route("/:id/members")
    .post(verifyJWT, verifyBoardOwner, addBoardMember);

router.route("/:id/members/:userId")
    .delete(verifyJWT, verifyBoardOwner, removeBoardMember);

export default router;
