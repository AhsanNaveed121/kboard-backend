import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"
import passport from "./Config/passport.config.js"

import mongoSanitize from "express-mongo-sanitize";

const app = express()

// Security middleware that sets protective HTTP response headers
app.use(helmet())

// CORS — must be applied before routes
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))

// Prevent NoSQL injection attacks by sanitizing request data ($ and . operators)
// Compatible with Express 5 read-only req.query property
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body);
  if (req.params) mongoSanitize.sanitize(req.params);
  if (req.query) mongoSanitize.sanitize(req.query);
  next();
});

app.use(express.static("public"))
app.use(cookieParser())
app.use(passport.initialize()) // activates the Google auth stratergy 

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Kboard Backend API is running!",
    docs: "/api/v1/health",
  });
});

// Health check endpoint for host uptime and deployment monitoring
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});


//routes import
import userRouter from './Routes/User.Routes.js'
import boardRouter from './Routes/Board.Routes.js'
import columnRouter from './Routes/Column.Routes.js'
import taskRouter from './Routes/Task.Routes.js'
import authRouter from './Routes/Auth.Routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/boards", boardRouter)
app.use("/api/v1/columns", columnRouter)
app.use("/api/v1/tasks", taskRouter)
app.use("/auth", authRouter)          // Google OAuth: /auth/google  &  /auth/google/callback


//means that on this router ("/api/v1/users") ,activate userRouter
//for each route we would make a different router which would have its own controller 
// http://localhost:8000/api/v1/users(app ka route)/register(router ka route)

//all users functionalities like rigister login will be in user.router 
// and there login will be in user vcontroller
export { app }