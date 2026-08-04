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
  (req, res, next) => {
    const { frontend_url } = req.query;
    const state = frontend_url ? Buffer.from(frontend_url).toString("base64") : "";
    passport.authenticate("google", {
      scope: ["profile", "email"],
      session: false,
      state: state
    })(req, res, next);
  }
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
  (req, res, next) => {
    const state = req.query.state;
    let frontendURL = "";
    
    if (state && state !== "undefined") {
      try {
        frontendURL = Buffer.from(state, "base64").toString("utf-8");
      } catch (err) {
        frontendURL = "";
      }
    }
    
    // Validate that it's a real HTTP/HTTPS URL and not a string "undefined"
    if (!frontendURL || frontendURL === "undefined" || !frontendURL.startsWith("http")) {
      frontendURL = process.env.FRONTEND_URL || "";
    }
    if (!frontendURL || frontendURL === "undefined" || !frontendURL.startsWith("http")) {
      frontendURL = "https://kboard-frontend-ruby.vercel.app";
    }
    
    passport.authenticate("google", {
      session: false,
      failureRedirect: `${frontendURL.replace(/\/$/, "")}/login?error=oauth_failed`,
    })(req, res, next);
  },
  googleCallback
);

export default router;
