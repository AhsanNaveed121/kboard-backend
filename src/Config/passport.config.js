import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../Models/User.model.js";
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
      },


    async (accessToken, refreshToken, profile, done) => {
      try {

        const existingUser = await User.findOne({ providerId: profile.id });

        if (existingUser) {
          return done(null, existingUser);
        }
        const email = profile.emails?.[0]?.value;
        const existingEmailUser = await User.findOne({ email });

        if (existingEmailUser) {
          existingEmailUser.provider = "google";
          existingEmailUser.providerId = profile.id;
          if (!existingEmailUser.profilePicTag) {
            existingEmailUser.profilePicTag = profile.photos?.[0]?.value || null;
          }
          await existingEmailUser.save();
          return done(null, existingEmailUser);
        }

        //  NEW USER
        const newUser = await User.create({
          fullName: profile.displayName,
          email,
          provider: "google",
          providerId: profile.id,
          profilePicTag: profile.photos?.[0]?.value || null,
        });

        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);
} else {
  console.warn("Google OAuth credentials missing - GoogleStrategy skipped.");
}

export default passport;
