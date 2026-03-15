import {Response} from "express"; 
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

export const createCategory = async (
    req: AuthRequest,
    res: Response
): Promise<void> => {
    try {
        const { name, slug } = req.body;
        if (!name || !slug) {
            res.status(400).json({
                message: "Name and slug are required "
            });
            return;
        }

        const existingCategory = await prisma.category.findUnique({
            where: { slug },
        });
          if(existingCategory){
            res.status(409).json({
                message:"Slug already exist"
            });
            return;
          }
          const category = await prisma.category.create({
            data:{name,slug}
          })
          res.status(401).json(category);
    } catch (error) {
        res.status(500).json({
            message:"Server error",error
        })
    }
};
export const getCategories =async(
    req:AuthRequest,
    res:Response
):Promise<void>=>{
       try {
             const categories = await prisma.category.findMany();
             res.status(200).json(categories);
       } catch (error) {
            res.status(500).json({
                message:"Server error", error
            })
       }
};
