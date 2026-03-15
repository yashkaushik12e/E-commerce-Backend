import { Router } from "express";
import { getCart,addItem,updateItem,removeItem } from "../controllers/cartController";
import { protect } from "../middleware/authMiddleware";
const router =Router();
router.get("/",protect,getCart);
router.post("/items",protect,addItem);
router.put("/items/:id",protect,updateItem);
router.delete("/items/:id",protect,removeItem);

export default router