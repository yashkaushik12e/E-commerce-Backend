import {Response} from "express"; 
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";
export const createProduct = async(
    req:AuthRequest,
    res:Response
):Promise<void>=>{
    try {
          const {name,description,price,stock,images,categoryId} = req.body;

          // Validate the required fields
          if(!name || !price || !categoryId){
            res.status(400).json({
                message:"Name,Price and categoryId are required"
            })
          }

        //   Check category exists
            const category = await prisma.category.findUnique({
                where:{id:categoryId},
            });
            if(!category){
                res.status(404).json({
                    message:"Category not found"
                })
            }

            // Create Product
            const product = await prisma.product.create({
                data:{
                    name,
                    description,
                    price,
                    stock:stock || 0,
                    images:images || [],
                    categoryId,
                    sellerId:req.user!.id,
                    status:stock>0 ?"ACTIVE" : "OUT_OF_STOCK",
                }
            })
            res.status(201).json(product);
    } catch (error) {
             res.status(500).json({
                message:"Server Error",error
             })
    }
}


export const getProducts = async(
    req:AuthRequest,
    res:Response
):Promise<void>=>{
    try {
         const {page = 1,limit = 10,search,category} = req.query as{
            page?:string,
            limit?:number,
            search?:string,
            category?:string
         }
         const skip = (Number(page)-1) * Number(limit);
         const where ={
            name:search 
               ? {
                contains:search as string,
                mode:"insensitive" as const
               }
               :undefined,
               categoryId:category ? (category as string) : undefined,
         };
         const [product,total] = await Promise.all([
            prisma.product.findMany({
                        where,
                        skip,
                        take:Number(limit),
                        include:{
                            category:true,
                            seller:{
                                select:{
                                    id:true,
                                    name:true,
                                    email:true
                                }
                            }
                        }
            }),
                 prisma.product.count({where}),
         ])
              res.status(200).json({
                product,
                total,
                page:Number(page),
                limit:Number(limit)
              })
    } catch (error) {
            res.status(500).json({
                message:"Server Error", error
            })
    }
};



export const getProductById = async(
    req:AuthRequest,
    res:Response
):Promise<void>=>{
      try {
           const {id} = req.params as {id:string}; 

           const product = await prisma.product.findUnique({
              where:{ id },
              include:{
                category:true,
                seller:true,
                reviews:true,
              },
           });
           if(!product){
            res.status(404).json({
                message:"Product not found"
            })
            return;
           }
            if(product.sellerId !== req.user!.id){
                res.status(403).json({
                    message:"Not Authorized"
                });
                return;
            }
            await prisma.product.delete({
                where:{id},
            })
            res.status(200).json({
                message:"Product deleted Successfully"
            });
      } catch (error) {
           res.status(500).json({
            message:"Server error",error
           })
      }
}

export const updateProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as {id:string};

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Ownership check
    if (product.sellerId !== req.user!.id) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    // Recompute status if stock is being updated
    const stock = req.body.stock ?? product.stock;
    const status = stock > 0 ? "ACTIVE" : "OUT_OF_STOCK";

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...req.body,
        status,
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

export const deleteProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as {id:string};

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Ownership check
    if (product.sellerId !== req.user!.id) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    await prisma.product.delete({
      where: { id },
    });

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};