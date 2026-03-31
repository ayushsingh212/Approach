import mongoose from "mongoose";
export const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.MONGO_URI}`);
    console.log(`MongoDB connected succesfully!!, Host: ${connectionInstance.connection.host}`)

    mongoose.connection.on("disconnected",()=>{
        console.log("MongoDB server disconnected");
    })

    mongoose.connection.on("reconnected",()=>{
        console.log("MongoDB server reconnected");
    })

    mongoose.connection.on("error",(error)=>{
        console.log("Error connecting to MongoDB server", error);
    })
    
  } catch (error) {
    console.log("error connecting mongo", error);
  }
};