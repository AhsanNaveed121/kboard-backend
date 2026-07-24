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
    deleteUser
} from "../Controllers/User.Controller.js";
import { upload } from "../Middlewares/Multer.Middleware.js";
import { verifyJWT, verifyAdmin } from "../Middlewares/Auth.Middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
        {
            name: "profilePicTag",
            maxCount: 1
        }
    ]),
    RegisterUser
);

router.route("/login").post(
    upload.none(), // parses multipart/form-data bodies with no file fields
    LoginUser
);

router.route("/search").get(verifyJWT, searchUsers);

// Protected routes (require JWT token)
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);

// Admin routes
router.route("/admin/users").get(verifyJWT, verifyAdmin, getAllUsers);
router.route("/admin/:userId/role").patch(verifyJWT, verifyAdmin, updateUserRole);
router.route("/admin/:userId").delete(verifyJWT, verifyAdmin, deleteUser);

export default router;
