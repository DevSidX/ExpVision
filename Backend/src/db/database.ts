import mongoose from 'mongoose'
import { Env } from '../config/env.config';

const connectDb = async () => {
    try {
        await mongoose.connect(Env.MONGO_URI ,{
            serverSelectionTimeoutMS: 8000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 30000,
        })
        console.log(`MONGODB connected successfully!!}`);
    } catch (error) {
        console.log("MONGODB connection FAILED!!", error);
        process.exit(1)
    }
}

export default connectDb