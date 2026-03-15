import {Request, Response, NextFunction} from 'express';
import jwt from 'jsonwebtoken'
import prisma from '../config/db';
export interface AuthRequest extends Request{
    user?:{
        id:string,
        role:string
    }
}

export const protect = async(
    req:AuthRequest,
    res:Response,
    next:NextFunction
):Promise<void> =>{
    try {
          const authHeader = req.headers.authorization;
          if(!authHeader || !authHeader.startsWith("Bearer ")){
            res.status(401).json({
                message:"No token Provided"
            })
            return;
          }
          const token = authHeader.split(" ")[1];

          const decoded = jwt.verify(token,process.env.JWT_SECRET as string) as{
            id:string,
          };

          const user = await prisma.user.findUnique({
            where:{
                id:decoded.id
            }
          })
          if(!user){
            res.status(401).json({
                message:"User not found"
            })
          }

          req.user = {
            id : user!.id,
            role : user!.role,
          };
          next()
    } catch (error) {
           res.status(401).json({
            message:"Invalid token"
           })
    }
}

export const authorize = (...roles:string[])=>{
        return (req:AuthRequest,res:Response,next:NextFunction):void=>{
              if(!req.user || !roles.includes(req.user.role)){
                res.status(403).json({
                    message:"Not Authorized to access this route"
                });
                next();
              }
        }
}