import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet" // Security middleware that sets protective HTTP response headers
import rateLimit from "express-rate-limit" // Middleware to limit repeated requests to public APIs and prevent brute-force attacks

const app = express()

// Sets secure HTTP headers to guard against common web vulnerabilities (XSS, clickjacking, etc.)
app.use(helmet())

// Rate limiter: limits each IP address to 100 requests per 15-minute window across all /api routes
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Maximum 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests from this IP, please try again after 15 minutes." }
})
app.use("/api", apiLimiter)

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from './Routes/User.Routes.js'
import boardRouter from './Routes/Board.Routes.js'
import columnRouter from './Routes/Column.Routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/boards", boardRouter)
app.use("/api/v1/columns", columnRouter)


//means that on this router ("/api/v1/users") ,activate userRouter
//for each route we would make a different router which would have its own controller 
// http://localhost:8000/api/v1/users(app ka route)/register(router ka route)

//all users functionalities like rigister login will be in user.router 
// and there login will be in user vcontroller
export { app }