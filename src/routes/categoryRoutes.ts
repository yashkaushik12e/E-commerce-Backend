import { Router } from "express";
import { createCategory, getCategories, } from "../controllers/categoryController";
import { protect, authorize } from "../middleware/authMiddleware";

const router =Router();

router.get("/",getCategories)
router.post("/",protect,authorize("ADMIN"),createCategory)

export default router 