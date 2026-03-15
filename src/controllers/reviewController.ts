import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// @desc   Create review
// @route  POST /api/products/:id/reviews
// @access Private
export const createReview = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { rating, comment } = req.body;

    // Check product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Check rating
    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    // Check user purchased the product
    const purchased = await prisma.order.findFirst({
      where: {
        userId: req.user!.id,
        items: {
          some: {
            productId: id,
          },
        },
      },
    });

    if (!purchased) {
      res.status(403).json({
        message: "You must purchase this product before reviewing",
      });
      return;
    }

    // Check already reviewed
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId: id,
        },
      },
    });

    if (existingReview) {
      res.status(409).json({ message: "You have already reviewed this product" });
      return;
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: req.user!.id,
        productId: id,
        rating,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc   Get reviews for product
// @route  GET /api/products/:id/reviews
// @access Public
export const getReviews = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { productId: id },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.status(200).json({
      reviews,
      total: reviews.length,
      averageRating: Math.round(averageRating * 10) / 10,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

