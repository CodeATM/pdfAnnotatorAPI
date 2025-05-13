import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User, { IUser } from "../../module/V1/models/userModel";

const callbackURL =
  process.env.NODE_ENV === "prod"
    ? process.env.PROD_GOOGLE_CALLBACK
    : process.env.DEV_GOOGLE_CALLBACK;

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENTID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log(profile);
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(new Error("No email found in profile"), null);
        }

        let user: IUser | null = await User.findOne({ email });

        if (!user) {
          const firstName = profile.name?.givenName || "";
          const lastName = profile.name?.familyName || "";

          user = await User.create({
            firstName,
            lastName,
            email,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
