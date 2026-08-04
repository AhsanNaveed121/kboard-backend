/*
 |   only job here: generate our own JWT and hand it to the frontend.
 */

const googleCallback = (req, res) => {
  const accessToken = req.user.generateAccessToken();
  const frontendURL = process.env.FRONTEND_URL;
  res.redirect(`${frontendURL}/oauth-success?token=${accessToken}`);
};

export { googleCallback };
