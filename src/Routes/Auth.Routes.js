import { Router } from "express";
import passport from "../Config/passport.config.js";
import { googleCallback } from "../Controllers/Auth.Controller.js";

const router = Router();

/*
 |  ROUTE 1: GET /auth/google
 |  --------------------------
 |  The user clicks "Login with Google" on the frontend.
 |  The frontend does: window.location.href = "http://localhost:8000/auth/google"
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false, // we use JWTs, not sessions
  })
);

/*
 |  ROUTE 2: GET /auth/google/callback
 |  ------------------------------------
 |  After the user logs in on Google, Google redirects the browser here.
 |  passport.authenticate() runs first as middleware:
 |    1. It exchanges the code Google sent for a real access token
 |    2. Calls Google's API to get the user's profile
 |    3. Runs our find-or-create strategy (passport.config.js)
 |    4. Puts the user on req.user
 |    5. Calls next() → our googleCallback controller runs
 |
 |  If anything fails (user denied access, token error, etc.),
 |  Passport redirects to failureRedirect instead of calling next().
 */
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=oauth_failed`,
  }),
  googleCallback
);

export default router;
