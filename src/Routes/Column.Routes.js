import { Router } from "express";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";
import {
  createColumn,
  createDefaultColumns,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
} from "../Controllers/Column.Controller.js";
const router = Router();
router.use(verifyJWT);
router.route("/").post(createColumn);
router.route("/board/:boardId").post(createColumn).get(getColumnsByBoard);
router.route("/bulk-create").post(createDefaultColumns);
router.route("/board/:boardId/bulk").post(createDefaultColumns);
router.route("/:id").patch(updateColumn).delete(deleteColumn);
export default router;
