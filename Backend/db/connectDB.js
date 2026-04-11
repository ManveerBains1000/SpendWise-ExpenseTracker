import mongoose from "mongoose";
import dns from "dns"
const connectDB = async () => {
    try {
        dns.setServers(["1.1.1.1", "8.8.8.8"]);
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log(`\n MongoDB is connected to host : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("Database connect error: ",error);
        process.exit(1);
    }
}

export default connectDB;