import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../model/userModel.js";

/*
 OTP STORE STRUCTURE

 otpStore[email] = {
   code: "123456",
   type: "SIGNUP" | "LOGIN",
   verified: false,
   expiresAt: Date
 }
*/

let otpStore = {};

/* ================= MAIL TRANSPORTER ================= */
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

/* ================= GENERATE OTP ================= */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* ================= SEND OTP (SIGNUP) ================= */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.json({ success: false, message: "Email required" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email format" });

    const generatedOtp = generateOtp();

    otpStore[email] = {
      code: generatedOtp,
      type: "SIGNUP",
      verified: false,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
    };

    console.log("Signup OTP:", generatedOtp);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Signup OTP Verification",
      text: `Your OTP Code is: ${generatedOtp}. It will expire in 5 minutes.`,
    });

    res.json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ================= VERIFY OTP (SIGNUP) ================= */
export const verifyOtp = (req, res) => {
  const { email, otp } = req.body;

  const stored = otpStore[email];

  if (!stored || stored.type !== "SIGNUP")
    return res.json({ success: false, message: "OTP not requested" });

  if (stored.expiresAt < Date.now()) {
    delete otpStore[email];
    return res.json({ success: false, message: "OTP expired" });
  }

  if (stored.code !== otp)
    return res.json({ success: false, message: "Invalid OTP" });

  otpStore[email].verified = true;

  res.json({ success: true, message: "OTP Verified" });
};

/* ================= REGISTER ================= */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role)
      return res.json({ success: false, message: "Missing Details" });

    if (!validator.isEmail(email))
      return res.json({ success: false, message: "Invalid email" });

    if (password.length < 8)
      return res.json({
        success: false,
        message: "Password must be 8+ characters",
      });

    if (
      !otpStore[email] ||
      !otpStore[email].verified ||
      otpStore[email].type !== "SIGNUP"
    )
      return res.json({
        success: false,
        message: "OTP verification required",
      });

    const exists = await userModel.findOne({ email });
    if (exists)
      return res.json({
        success: false,
        message: "User already exists",
      });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email,
      password: hashedPassword,
      role, // still stored for dashboards, etc
    });

    delete otpStore[email];

    const token = jwt.sign(
      { id: user._id, email: user.email }, // role removed from token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= LOGIN STEP 1 (PASSWORD CHECK + SEND OTP) ================= */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.json({ success: false, message: "Missing Details" });

    const user = await userModel.findOne({ email: email.trim() }); // role removed
    if (!user)
      return res.json({ success: false, message: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.json({
        success: false,
        message: "Invalid credentials",
      });

    const generatedOtp = generateOtp();

    otpStore[email] = {
      code: generatedOtp,
      type: "LOGIN",
      verified: false,
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    console.log("Login OTP:", generatedOtp);

    await transporter.sendMail({
      from: process.env.EMAIL,
      to: email,
      subject: "Login OTP Verification",
      text: `Your Login OTP is: ${generatedOtp}. It will expire in 5 minutes.`,
    });

    res.json({
      success: true,
      step: "OTP_SENT",
      message: "Login OTP sent",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= LOGIN STEP 2 (VERIFY LOGIN OTP) ================= */
export const verifyLoginOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const stored = otpStore[email];

    if (!stored || stored.type !== "LOGIN")
      return res.json({ success: false, message: "OTP not requested" });

    if (stored.expiresAt < Date.now()) {
      delete otpStore[email];
      return res.json({ success: false, message: "OTP expired" });
    }

    if (stored.code !== otp)
      return res.json({ success: false, message: "Invalid OTP" });

    const user = await userModel.findOne({ email: email.trim() }); // role removed
    if (!user)
      return res.json({ success: false, message: "User not found" });

    delete otpStore[email];

    const token = jwt.sign(
      { id: user._id, email: user.email }, // role removed from token
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ================= GOOGLE AUTH REDIRECT ================= */
export const googleAuthSuccess = async (req, res) => {
  try {
    const user = req.user;

    if (!user)
      return res.redirect(`${process.env.FRONTEND_URL}/login`);

    const token = jwt.sign(
      { id: user._id, email: user.email }, // role removed
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.redirect(
      `${process.env.FRONTEND_URL}/dashboard?token=${token}` // role removed from URL
    );
  } catch (err) {
    res.redirect(`${process.env.FRONTEND_URL}/login`);
  }
};
