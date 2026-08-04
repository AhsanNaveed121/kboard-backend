import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import helmet from "helmet"

const app = express()

// Security middleware that sets protective HTTP response headers
app.use(helmet())

app.use(cors({
    origin: (!process.env.CORS_ORIGIN || process.env.CORS_ORIGIN === "*") 
      ? true 
      : process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Health check route
app.get("/", (req, res) => {
    res.status(200).json({
        status: "OK",
        message: "Kboard Backend API is running successfully!"
    });
});

//routes import
import userRouter from './src/Routes/User.Routes.js'
import boardRouter from './src/Routes/Board.Routes.js'
import columnRouter from './src/Routes/Column.Routes.js'
import taskRouter from './src/Routes/Task.Routes.js'

//routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/boards", boardRouter)
app.use("/api/v1/columns", columnRouter)
app.use("/api/v1/tasks", taskRouter)
//means that on this router ("/api/v1/users") ,activate userRouter
//for each route we would make a different router which would have its own controller 
// http://localhost:8000/api/v1/users(app ka route)/register(router ka route)

//all users functionalities like rigister login will be in user.router 
// and there login will be in user vcontroller
export { app }