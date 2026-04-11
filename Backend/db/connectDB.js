import mongoose from "mongoose";
import dns from "dns";

let connectionPromise = null;
let dnsConfigured = false;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (connectionPromise) {
        await connectionPromise;
        return mongoose.connection;
    }

    if (!dnsConfigured) {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
        dnsConfigured = true;
    }

    const uri = `${process.env.MONGODB_URI}/${process.env.DB_NAME}`;

    connectionPromise = mongoose
        .connect(uri)
        .then((connectionInstance) => {
            console.log(`MongoDB connected: ${connectionInstance.connection.host}`);
            return connectionInstance.connection;
        })
        .catch((error) => {
            connectionPromise = null;
            throw error;
        });

    await connectionPromise;
    return mongoose.connection;
};

export default connectDB;