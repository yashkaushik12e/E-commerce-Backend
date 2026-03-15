import {Response} from "express"
import prisma from "../config/db"
import { AuthRequest } from "../middleware/authMiddleware"
// helper to compute total
const computeTotal = (items:any[])=>{
    return items.reduce((total,item)=>{
        return total + item.quantity * item.product.price;
    }, 0)
};

export const getCart = async(
    req:AuthRequest,
    res:Response
):Promise<void>=>{
    try {
        const cart = await prisma.cart.upsert({
            where:{userId:req.user!.id},
            create:{userId:req.user!.id},
            update:{},
            include:{
                items:{
                    include:{product:true},
                },
            },
        });
        res.status(200).json({
            ...cart,
            totalAmount:computeTotal(cart.items),
        });
    } catch (error) {
          res.status(500).json({
            message:"Server error ",error
          })
    }
}

export const addItem = async (
    req:AuthRequest,
    res:Response
):Promise<void>=>{
     try {
         const {productId,quantity=1} = req.body;
         if(!productId){
            res.status(400).json({
                message:"Product is required"
            });
         }
         const product = await prisma.product.findUnique({
            where:{id:productId}
         })
         if(!product){
             res.status(404).json({
                message:"Product not found",
             });
         }
         
         if(product!.stock<quantity){
            res.status(400).json({
                message:"Not enough stock"
            });
                     return;
         }

         const cart = await prisma.cart.upsert({
            where:{userId:req.user!.id},
            create:{userId:req.user!.id},
            update:{}
         });

         const existingItem = await prisma.cartItem.findUnique({
            where:{
                  cartId_productId:{
                    cartId:cart.id,
                    productId,
                  },
            },
         });
         if(existingItem){
            await prisma.cartItem.update({
                where:{id:existingItem.id},
                data:{quantity:existingItem.quantity + quantity}
            })
         }else{
            await prisma.cartItem.create({
                data:{
                    cartId:cart.id,
                    productId,
                    quantity
                },
            });
         }
        const updateCart = await prisma.cart.findUnique({
            where:{id:cart.id},
            include:{
                items:{
                    include:{product:true},
                },
            },
        });
        res.status(200).json({
            ...updateCart,
              totalAmount:computeTotal(updateCart!.items),
        });
     } catch (error) {
                 res.status(500).json({
                    message:"Server error",error
                 })
     }
     
};



export const updateItem =async(
    req:AuthRequest,
    res:Response,
):Promise<void>=>{
      try {
          const {id} = req.params as {id:string};
          const {quantity} = req.body;
          if(!quantity || quantity<1){
              res.status(400).json({
                message:"Valid quantity is required"
              });
              return;
          }
           const item = await prisma.cartItem.findUnique({
                where:{id},
           });

           if(!item){
                res.status(404).json({
                    message:"Item Not Found",
                });
                return;
           }
           await prisma.cartItem.update({
            where:{id},
            data:{quantity},
           });

           const cart = await prisma.cart.findUnique({
            where:{userId:req.user!.id},
            include:{
                items:{
                    include:{
                        product:true
                    }
                }
            }
           });

           res.status(200).json({
            ...cart,
            totalAmount:computeTotal(cart!.items),

           })
      } catch (error) {
                  res.status(500).json({
                    message:"Server error",error
                  })
      }
}
export const removeItem = async(
    req:AuthRequest,
    res:Response,
):Promise<void>=>{
      try {
           const {id} = req.params as {id:string};
           const item = await prisma.cartItem.findUnique({
            where:{id},
           });
           if(!item) {
            res.status(404).json({
                message:"Item not found"
            })
            return;
        }
         await prisma.cartItem.delete({
            where:{id},
         });

         const cart = await prisma.cart.findUnique({
            where:{userId:req.user!.id},
            include:{
                items:{
                    include:{product:true}
                }
            }
         });

         res.status(200).json({
            ...cart,
            totalAmount:computeTotal(cart!.items),
         });
         
      } catch (error) {
            res.status(500).json({
                message:"Server error ",error
            })
      }

}