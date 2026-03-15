import { Router } from "express";
import { authorize, protect } from "../middleware/authMiddleware";
import { createOrder, getOrders,getOrderById,updateOrderStatus } from "../controllers/orderController";

const router= Router();

router.post("/",protect,createOrder);
router.get("/",protect,getOrders)
router.get("/:id",protect,getOrderById);
router.put("/:id/status",protect,authorize("ADMIN","SELLER"),updateOrderStatus)

export default router