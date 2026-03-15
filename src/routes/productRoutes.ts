import { Router } from "express";
import { createProduct, getProducts,getProductById,updateProduct,deleteProduct } from "../controllers/productController";
import { createReview,getReviews } from "../controllers/reviewController";
import { protect, authorize } from "../middleware/authMiddleware";

const router =Router();
router.get("/",getProducts)
router.get("/:id",getProductById)
router.post("/",protect,authorize("SELLER","ADMIN"),createProduct)
router.put("/:id",protect,authorize("SELLER","ADMIN"),updateProduct)
router.delete("/:id",protect,authorize("SELLER","ADMIN"),deleteProduct)
router.post("/:id/reviews",protect,createReview);
router.get("/:id/reviews",getReviews)

export default router