import { Request,Response } from "express"
import bcrypt from 'bcryptjs'
import jwt from "jsonwebtoken";
import prisma from "../config/db";
export const register = async (req:Request,res:Response): Promise<void> =>{
    try {
          const {name,email,password} = req.body;

        //   Checking the missing fields
        if(!name || !email || !password){
            res.status(400).json({
              message:"All fields are required"
            });
            return;
        }

        // check the duplicate email
        const existingUser = await prisma.user.findUnique({
            where:{email}
        });
         if(existingUser){
            res.status(409).json({
                   message:"Email already Exist"
            })
            return;
         }


         // hash Password
         const salt = await bcrypt.genSalt(10);
         const hashedPassword = await bcrypt.hash(password,salt)

        //  create User
        const user = await prisma.user.create({
            data:{
                name,email,password:hashedPassword
            }
        });
         
        // Generate Token
        const token = jwt.sign(
            {id:user.id},
            process.env.JWT_SECRET as string,
            {expiresIn:"30d"}
        );

        res.status(201).json({
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
            },
        });

    } catch (error) {
           res.status(500).json({
            message:"Server Error",error
           })
    }
};


export const login = async(req:Request,res:Response):Promise<void>=>{
    try {
         const {email,password} = req.body;

        //  check missing fields 
        if(!email || !password){
            res.status(400).json({
                message:"All Fields are required"
            })
            return;
        }

        // FInd user
        const user = await prisma.user.findUnique({
            where:{email}
        });

        // check user exists
         if(!user){
            res.status(401).json({
                message:"Invalid credentials"
            })
            return;
         }
        //  check password
         const isMatch = await bcrypt.compare(password,user.password);
         if(!isMatch){
            res.status(401).json({
                message:"Invalid Credentials"
            })
            return;
         }

        //   Generate token
        const token = jwt.sign(
            {id:user.id},
           process.env.JWT_SECRET as string,
           {expiresIn:"30d"}

        );
        res.status(200).json({
            token,
            user:{
                id:user.id,
                name:user.name,
                email:user.email,
                role:user.role,
            }
        });


    } catch (error) {
           res.status(500).json({
            message:"Server error",error
           })
    }
};