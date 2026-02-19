import express from "express";
import cors from "cors";
import "dotenv/config";
import session from "express-session";
import passport from "passport";
// import { setupGoogleAuth } from "./middlewares/";
import connectDB from "./config/mongodb.js";
import { setupGoogleAuth } from "./middlewares/authGoogle.js";
import authRoutes from "./routes/authRoute.js";

const app = express();
const port = process.env.PORT || 5000;

connectDB();
setupGoogleAuth();

app.use(express.json());

app.use(
  cors({
    origin: "https://login-3-i4wo.onrender.com",
    credentials: true,
  })
);

app.use(
  session({
    secret: "keyboardcat",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
setupGoogleAuth();

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API working...");
});

app.listen(port, () => console.log("Server started on", port));
