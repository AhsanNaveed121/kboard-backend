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
            throw new Error("Neither MONGODB_URI nor DBURL is defined in environment variables");
        }

        await mongoose.connect(connectionUrl, {
            dbName: DB_NAME
        });
        console.log("DB connected successfully");
    }
    catch (error) {
        console.error("error while connecting to db:", error);
        throw error; // Rethrow to prevent the server from starting with a broken DB connection
    }
}
export default DBconnect;