import { Router } from "express";
import {
  createTask,
  getTasksByBoard,
  updateTask,
  deleteTask,
} from "../Controllers/Task.Controller.js";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/").post(createTask);
router.route("/board/:boardId").get(getTasksByBoard);
router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
