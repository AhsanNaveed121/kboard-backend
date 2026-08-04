import mongoose from "mongoose";
import { DB_NAME } from "../Constants.js";

const DBconnect = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }
    try {
        console.log(DB_NAME, process.env.MONGODB_URI)
        let connectionUrl = process.env.MONGODB_URI || process.env.DBURL;
        
        if (!connectionUrl) {
            throw new Error("Neither MONGODB_URI nor DBURL is defined in your environment variables (.env file)");
        }
        
        if (connectionUrl.includes("?")) {
            const [base, query] = connectionUrl.split("?");
            connectionUrl = `${base.replace(/\/$/, "")}/${DB_NAME}?${query}`;
        } else {
            connectionUrl = `${connectionUrl.replace(/\/$/, "")}/${DB_NAME}`;
        }

        await mongoose.connect(connectionUrl);
        console.log("DB connected successfully");
    }
    catch (error) {
        console.error("error while connecting to db:", error);
        throw error; // Rethrow to prevent the server from starting with a broken DB connection
    }
}
export default DBconnect;