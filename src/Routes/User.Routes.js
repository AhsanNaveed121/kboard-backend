import { Router } from "express";
import {
  RegisterUser,
  LoginUser,
  getCurrentUser,
  updateAccountDetails,
  changeCurrentPassword,
  getAllUsers,
  updateUserRole,
  searchUsers,
  deleteUser,
} from "../Controllers/User.Controller.js";
import { verifyJWT, verifyAdmin } from "../Middlewares/Auth.Middleware.js";
import { loginRateLimiter } from "../Middlewares/RateLimiter.Middleware.js";
import { validateRegisterInput, validateLoginInput } from "../Middlewares/Validation.Middleware.js";

import { upload } from "../Middlewares/Multer.Middleware.js";

const router = Router();

router.route("/register").post(upload.fields([{ name: "profilePicTag", maxCount: 1 }]), validateRegisterInput, RegisterUser);
router.route("/login").post(loginRateLimiter, validateLoginInput, LoginUser);

// Protected routes
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").patch(verifyJWT, changeCurrentPassword);
router.route("/search").get(verifyJWT, searchUsers);
router.route("/").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/admin/users").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/:userId/role").patch(verifyJWT, verifyAdmin, updateUserRole);
router.route("/admin/:userId/role").patch(verifyJWT, verifyAdmin, updateUserRole);
router.route("/:userId").delete(verifyJWT, verifyAdmin, deleteUser);
router.route("/admin/:userId").delete(verifyJWT, verifyAdmin, deleteUser);

export default router;
