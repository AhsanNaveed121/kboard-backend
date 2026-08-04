/*
 |   only job here: generate our own JWT and hand it to the frontend.
 */

const googleCallback = (req, res) => {
  const accessToken = req.user.generateAccessToken();
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
  
  res.redirect(`${frontendURL.replace(/\/$/, "")}/oauth-success?token=${accessToken}`);
};

export { googleCallback };
