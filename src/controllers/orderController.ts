import { Response } from "express";
import prisma from "../config/db";
import { AuthRequest } from "../middleware/authMiddleware";

// @desc   Create order
// @route  POST /api/orders
// @access Private
export const createOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Get user's cart
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    // Check cart exists and has items
    if (!cart || cart.items.length === 0) {
      res.status(400).json({ message: "Cart is empty" });
      return;
    }

    // Check all items are in stock
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        res.status(400).json({
          message: `Not enough stock for ${item.product.name}`,
        });
        return;
      }
    }

    // Calculate total
    const totalAmount = cart.items.reduce((total, item) => {
      return total + item.quantity * item.product.price;
    }, 0);

    // Transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user!.id,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.product.price,
            })),
          },
        },
        include: { items: true },
      });

      // Decrease stock for each product
      for (const item of cart.items) {
        const newStock = item.product.stock - item.quantity;
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: newStock,
            status: newStock === 0 ? "OUT_OF_STOCK" : "ACTIVE",
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc   Get orders
// @route  GET /api/orders
// @access Private
export const getOrders = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const isAdmin = req.user!.role === "ADMIN";

    const orders = await prisma.order.findMany({
      where: isAdmin ? {} : { userId: req.user!.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ orders, total: orders.length });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc   Get order by id
// @route  GET /api/orders/:id
// @access Private
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Buyer can only see their own orders
    if (req.user!.role === "BUYER" && order.userId !== req.user!.id) {
      res.status(403).json({ message: "Not authorized" });
      return;
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// @desc   Update order status
// @route  PUT /api/orders/:id/status
// @access Admin, Seller
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params as { id: string };
    const { status } = req.body;

    const validStatuses = [
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: "Valid status is required" });
      return;
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // If cancelling restore stock
    if (status === "CANCELLED" && order.status !== "CANCELLED") {
      await prisma.$transaction(async (tx) => {
        await tx.order.update({
          where: { id },
          data: { status },
        });

        // Restore stock
        for (const item of order.items) {
          const newStock = item.product.stock + item.quantity;
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: newStock,
              status: "ACTIVE",
            },
          });
        }
      });
    } else {
      await prisma.order.update({
        where: { id },
        data: { status },
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};