import { Router } from "express";
import {
  createColumn,
  createDefaultColumns,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
} from "../Controllers/Column.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createColumn);
router.route("/bulk-create").post(createDefaultColumns);
router.route("/board/:boardId").get(getColumnsByBoard);
router.route("/:id").patch(updateColumn).delete(deleteColumn);

export default router;
