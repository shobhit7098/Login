import express from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
import connectDB from "./config/mongodb.js";
import { setupGoogleAuth } from "./middlewares/authGoogle.js";
import authRoutes from "./routes/authRoute.js";

const app = express();
const port = process.env.PORT || 5000;

// ✅ Connect Database
connectDB();

// ✅ Setup Google Auth (ONLY ONCE)
setupGoogleAuth();

// ✅ CORS (MUST be before routes)
app.use(
  cors({
    origin: "https://login-3-i4wo.onrender.com",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

]

// ✅ Body Parser
app.use(express.json());

// ✅ Session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "keyboardcat",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,       // Render uses HTTPS
      sameSite: "none",   // Required for cross-origin cookies
    },
  })
);

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Routes
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API working...");
});

// ✅ Start Server
app.listen(port, () => console.log("Server started on", port));
