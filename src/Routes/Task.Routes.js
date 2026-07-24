import { Router } from "express";
import { verifyJWT } from "../Middlewares/Auth.Middleware.js";
import { createTask, getTasksByBoard, updateTask, deleteTask } from "../Controllers/Task.Controller.js";

const router = Router();

// Protect all routes
router.use(verifyJWT);

// Create task
router.route("/").post(createTask);

// Get tasks by board ID
router.route("/board/:boardId").get(getTasksByBoard);

// Update/Delete task by task ID
router.route("/:id").patch(updateTask).delete(deleteTask);

export default router;
