import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import passport from "passport";
import { setupGoogleAuth } from "./middlewares/authGoogle.js";
import authRoutes from "./routes/authRoute.js";



// app config
const app = express()
const port = process.env.PORT || 4000
connectDB()
// connectCloudinary()
setupGoogleAuth();
// middlewares
app.use(express.json())
app.use(cors())
app.use(passport.initialize());

app.use("/api/auth", authRoutes);


app.get('/', (req, res) => {
  res.send('Api working...')
})

app.listen(port, () => console.log('Server started', port))
