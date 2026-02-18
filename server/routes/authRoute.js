import express from "express";
import { sendOtp, verifyOtp, registerUser, loginUser ,verifyLoginOtp } from "../controllers/authController.js";
import passport from "passport";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-login-otp", verifyLoginOtp);
// Google OAuth
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google"), (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}?token=${req.user}`);
});

export default router;
