import dotenv from "dotenv"
dotenv.config()

import connectDB from "../src/DB/index.js"
import { app } from "../src/app.js"

// Ensure DB is connected for each serverless invocation
let isConnected = false;

const handler = async (req, res) => {
    if (!isConnected) {
        try {
            await connectDB();
            isConnected = true;
        } catch (error) {
            console.error("Database connection error:", error);
            return res.status(500).json({
                success: false,
                message: "Failed to connect to database",
                error: error.message || String(error)
            });
        }
    }
    return app(req, res);
};

export default handler;
