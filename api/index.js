import dotenv from "dotenv"
import connectDB from "../src/DB/index.js"
import { app } from "../app.js"

dotenv.config()

export default async function handler(req, res) {
    try {
        await connectDB();
        return app(req, res);
    } catch (error) {
        console.error("Vercel Serverless Handler Error:", error);
        return res.status(500).json({
            success: false,
            message: "Serverless Database Connection Error",
            error: error.message || String(error)
        });
    }
}
