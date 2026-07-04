import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log("MongoDB connection failed");
    console.log(error.message);
    process.exit(1); // no point running the server without a database
  }
};

export default connectDB;
