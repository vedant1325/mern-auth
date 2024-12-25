import express from "express";
import cors from "cors";
import 'dotenv/config';
import cookieParser
 from "cookie-parser";
 import connectDB from "./config/mongodb.js";
 import authRouter from "./Routes/authRoutes.js"
import userRouter from "./Routes/userRoutes.js";
 





 const app=express();
 const port=process.env.PORT || 4000;
 connectDB();

 const allowedOrigins=['https://mern-auth-client-6mfo.onrender.com']

 app.use(express.json());
 app.use(cookieParser());
 app.use(cors({origin: allowedOrigins, credentials:true}));

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));


 //API Endpoints
 app.get('/',(req,res)=>{
    res.send("Api working")
 });
 app.use('/api/auth',authRouter);
 app.use('/api/user',userRouter);

 app.listen(port,()=>{
    console.log(`Server started on port ${port}`)
 });

