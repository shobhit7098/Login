import React, { useContext, useState } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiCheckCircle } from "react-icons/fi";
import { FaGoogle } from "react-icons/fa";

const Login = () => {
  const { backendUrl, setToken } = useContext(AppContext);
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "client",
  });

  /* ================= SEND OTP (Signup) ================= */
  const sendOtpHandler = async () => {
    if (!form.email) return toast.error("Enter email first!");
console.log(form.email);

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-otp`,
        { email: form.email }
      );
    console.log("Backend Response:", data);
      if (data.success) {
        toast.success("OTP Sent Successfully");
        setOtpSent(true);
        setOtpVerified(false);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY OTP (Signup) ================= */
  const verifyOtpHandler = async () => {
    if (!otp) return toast.error("Enter OTP!");

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email: form.email, otp }
      );

      if (data.success) {
        toast.success("OTP Verified Successfully");
        setOtpVerified(true);
        setOtpSent(false);
        setOtp("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY LOGIN OTP ================= */
  const verifyLoginOtpHandler = async () => {
    if (!otp) return toast.error("Enter OTP!");

    setLoading(true);

    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-login-otp`,
        { email: form.email, otp }
      );
       console.log("Backend Response:", data);
      if (!data.success) {
        setLoading(false);
        return toast.error(data.message);
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      setOtpSent(false);
      setOtp("");
      setLoading(false);

      toast.success("Login Successful!");
      navigate("/home");

    } catch {
      setLoading(false);
      toast.error("OTP Verification Failed");
    }
  };

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /* ===== SIGNUP ===== */
      if (mode === "signup") {
        if (!otpVerified) {
          setLoading(false);
          return toast.error("Please verify OTP first!");
        }

        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          form
        );

        if (!data.success) {
          setLoading(false);
          return toast.error(data.message);
        }

        localStorage.setItem("token", data.token);
        setToken(data.token);

        toast.success("Registration Successful!");
        navigate("/home");
      }

      /* ===== LOGIN ===== */
      if (mode === "login") {
        const { data } = await axios.post(
          `${backendUrl}/api/auth/login`,
          {
            email: form.email,
            password: form.password,
            role: form.role,
          }
        );
 console.log("Backend Response:", data);
        if (!data.success) {
          setLoading(false);
          return toast.error(data.message);
        }

        // OTP Step
        if (data.step === "OTP_SENT") {
          toast.success("Login OTP sent to email");
          setOtpSent(true);
          setOtp("");
          setLoading(false);
          return;
        }

        // Direct login (optional)
        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          navigate("/home");
        }
      }

    } catch {
      toast.error("Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  const googleLoginHandler = () => {
    window.location.href = `${backendUrl}/api/auth/google`;
  };

  const switchMode = () => {
    setMode(mode === "signup" ? "login" : "signup");
    setOtpSent(false);
    setOtpVerified(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-700 via-blue-600 to-cyan-500 p-4">
      <motion.form
        onSubmit={submitHandler}
        className="w-full max-w-[380px] bg-white/20 backdrop-blur-xl border border-white/30 p-6 rounded-2xl shadow-xl text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-3">
          {mode === "signup" ? "Create Account" : "Login"}
        </h2>

        {/* NAME */}
        <AnimatePresence>
          {mode === "signup" && (
            <div className="relative mb-3">
              <FiUser className="absolute top-2.5 left-3 text-white/70 text-sm" />
              <input
                required
                placeholder="Full Name"
                className="w-full pl-9 py-2 bg-white/20 border border-white/40 rounded-lg outline-none text-sm"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>
          )}
        </AnimatePresence>

        {/* EMAIL */}
        <div className="relative mb-3">
          <FiMail className="absolute top-2.5 left-3 text-white/70 text-sm" />
          {otpVerified && mode === "signup" && (
            <FiCheckCircle className="absolute top-2.5 right-3 text-green-300 text-sm" />
          )}
          <input
            required
            type="email"
            placeholder="Enter Email"
            className="w-full pl-9 pr-8 py-2 bg-white/20 border border-white/40 rounded-lg outline-none text-sm"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />
        </div>

        {/* LOGIN OTP UI */}
        {mode === "login" && otpSent && (
          <div className="mb-3">
            <input
              type="text"
              placeholder="Enter Login OTP"
              className="w-full py-2 px-3 bg-white/20 border border-white/40 rounded-lg outline-none text-sm"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <button
              type="button"
              onClick={verifyLoginOtpHandler}
              className="w-full mt-2 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium"
            >
              Verify Login OTP
            </button>
          </div>
        )}

        {/* SIGNUP OTP UI */}
        {mode === "signup" && !otpVerified && (
          <>
            {!otpSent && (
              <button
                type="button"
                onClick={sendOtpHandler}
                className="w-full py-2 rounded-lg text-sm font-medium mb-3 bg-white text-blue-600"
              >
                Send OTP
              </button>
            )}

            {otpSent && (
              <div className="mb-3">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full py-2 px-3 bg-white/20 border border-white/40 rounded-lg outline-none text-sm"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  type="button"
                  onClick={verifyOtpHandler}
                  className="w-full mt-2 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium"
                >
                  Verify OTP
                </button>
              </div>
            )}
          </>
        )}

        {/* PASSWORD */}
        <div className="relative mb-4">
          <FiLock className="absolute top-2.5 left-3 text-white/70 text-sm" />
          <input
            required
            type="password"
            placeholder="Password"
            className="w-full pl-9 py-2 bg-white/20 border border-white/40 rounded-lg outline-none text-sm"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />
        </div>

        <button
          type="button"
          onClick={googleLoginHandler}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white text-blue-600 font-medium rounded-lg text-sm mb-3"
        >
          <FaGoogle /> Login with Google
        </button>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-white text-blue-600 font-semibold rounded-lg text-sm"
        >
          {loading
            ? "Processing..."
            : mode === "signup"
            ? "Register"
            : "Login"}
        </button>

        <p className="text-center text-xs mt-4">
          {mode === "signup" ? "Already have account?" : "New user?"}
          <span
            onClick={switchMode}
            className="underline ml-1 cursor-pointer"
          >
            {mode === "signup" ? "Login" : "Sign Up"}
          </span>
        </p>
      </motion.form>
    </div>
  );
};

export default Login;
