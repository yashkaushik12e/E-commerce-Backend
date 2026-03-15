import express, {Application} from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import prisma from './config/db';
import authRoutes from "./routes/auth.Routes"
import categoryRoutes from "./routes/categoryRoutes"
import productRoutes from "./routes/productRoutes"
import cartRoutes from "./routes/cartRoutes"
import orderRoutes from "./routes/orderRoutes"
import {errorHandler, notFound} from './middleware/errorMiddleware'
dotenv.config();

const app:Application = express();
const PORT = process.env.PORT || 5000;

app.get("/api/health",(req,res)=>{
    res.status(200).json({
        status:"ok"
    });
})

app.use(cors());
app.use(express.json());
app.use("/api/auth",authRoutes);
app.use("/api/categories",categoryRoutes);
app.use("/api/products",productRoutes);
app.use("/api/cart",cartRoutes);
app.use("/api/orders",orderRoutes);
app.use(notFound);
app.use(errorHandler)

app.listen(PORT,async ()=>{
   try { 
        await prisma.$connect();
        console.log("DB is connected successfully")
        console.log(`Server is running on ${PORT}`)
   } catch (err) {
         console.log("DB Connection failed", err);
         process.exit(1);
   }
})
