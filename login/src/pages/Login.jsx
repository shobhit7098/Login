import React, { useContext, useState , useEffect } from "react";
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

  /* ================= PREMIUM TOAST ================= */
  const showToast = (type, message) => {
    toast[type](message, {
      position: "top-right",
      autoClose: 3000,
      theme: "colored",
      style: {
        borderRadius: "12px",
        fontWeight: "500",
      },
    });
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /* ================= SEND OTP ================= */
  const sendOtpHandler = async () => {
    if (!form.email) return showToast("error", "Enter email first!");

    if (!emailRegex.test(form.email)) {
      return showToast("error", "Please enter valid email address");
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/send-otp`,
        { email: form.email }
      );

      if (data.success) {
        showToast("success", "OTP sent to your email 📩");
        setOtpSent(true);
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };
    useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token");

  if (token) {
    localStorage.setItem("token", token);
    setToken(token);
    navigate("/home"); // redirect to home
  }
}, []);

  /* ================= VERIFY SIGNUP OTP ================= */
  const verifyOtpHandler = async () => {
    if (!otp) return showToast("error", "Enter OTP!");

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-otp`,
        { email: form.email, otp }
      );

      if (data.success) {
        showToast("success", "OTP verified successfully ✅");
        setOtpVerified(true);
        setOtpSent(false);
        setOtp("");
      } else {
        showToast("error", data.message);
      }
    } catch {
      showToast("error", "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= VERIFY LOGIN OTP ================= */
  const verifyLoginOtpHandler = async () => {
    if (!otp) return showToast("error", "Enter OTP!");

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/auth/verify-login-otp`,
        { email: form.email, otp }
      );

      if (!data.success) {
        return showToast("error", data.message);
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);

      showToast("success", "Welcome back! Login successful 🚀");
      navigate("/home");
    } catch {
      showToast("error", "OTP Verification Failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= SUBMIT ================= */
  const submitHandler = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(form.email)) {
      return showToast("error", "Please enter valid email address");
    }

    if (form.password.length < 8) {
      return showToast("error", "Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      /* ===== SIGNUP ===== */
      if (mode === "signup") {
        if (!otpVerified) {
          return showToast("error", "Please verify OTP first!");
        }

        const { data } = await axios.post(
          `${backendUrl}/api/auth/register`,
          form
        );

        if (!data.success) {
          return showToast("error", data.message);
        }

        localStorage.setItem("token", data.token);
        setToken(data.token);

        showToast("success", "Account created successfully 🎉");
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

        if (!data.success) {
          if (data.message === "User not found") {
            return showToast("error", "User does not exist ❌");
          }

          if (data.message === "Invalid credentials") {
            return showToast("error", "Incorrect email or password ❌");
          }

          return showToast("error", data.message);
        }

        if (data.step === "OTP_SENT") {
          showToast("success", "Login OTP sent to email 📩");
          setOtpSent(true);
          return;
        }

        if (data.token) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          showToast("success", "Login successful 🚀");
          navigate("/home");
        }
      }

    } catch {
      showToast("error", "Authentication Failed");
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
