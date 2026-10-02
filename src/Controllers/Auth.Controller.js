/*
 |   only job here: generate our own JWT and hand it to the frontend.
 */

const googleCallback = async (req, res) => {
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

  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${frontendURL.replace(/\/$/, "")}/login?error=oauth_failed`);
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const options = {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .redirect(`${frontendURL.replace(/\/$/, "")}/oauth-success?token=${accessToken}`);
  } catch (error) {
    console.error("Error in googleCallback:", error);
    return res.redirect(`${frontendURL.replace(/\/$/, "")}/login?error=oauth_failed`);
  }
};

export { googleCallback };
