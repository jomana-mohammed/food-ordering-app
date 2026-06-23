import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import Product from "@/lib/models/Product";
import { withAuth, withAdmin, getAuthUser } from "@/lib/middleware/auth";
import { z } from "zod";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string().min(1, "Product ID is required"),
      quantity: z.number().int().positive("Quantity must be positive"),
    })
  ).min(1, "Order must have at least one item"),
  paymentMethod: z.enum(["online", "cash"]),
  deliveryAddress: z.object({
    street: z.string().min(1, "Street is required"),
    city: z.string().min(1, "City is required"),
    phone: z.string().min(7, "Valid phone number is required"),
  }),
  stripePaymentIntentId: z.string().optional(),
});

// GET /api/orders - Admin: all orders
export async function GET(req: NextRequest) {
  try {
    const authUser = await getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }
    if (authUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Admin access required" }, { status: 403 });
    }

    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const query: Record<string, unknown> = {};
    if (status && status !== "all") query.status = status;

    const orders = await Order.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/orders - Authenticated users
export const POST = withAuth(async (req, _context, user) => {
  try {
    await connectDB();
    const body = await req.json();
    const validation = createOrderSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { items, paymentMethod, deliveryAddress, stripePaymentIntentId } = validation.data;

    // Fetch all products and validate availability
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({ _id: { $in: productIds }, available: true });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { success: false, error: "One or more products are unavailable or not found" },
        { status: 400 }
      );
    }

    // Build order items with snapshot prices
    const orderItems = items.map((item) => {
      const product = products.find((p) => p._id.toString() === item.productId)!;
      return {
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        priceAtOrder: product.price,
      };
    });

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.priceAtOrder * item.quantity,
      0
    );

    const orderData: Record<string, unknown> = {
      user: user.userId,
      items: orderItems,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === "cash" ? "unpaid" : "unpaid",
      deliveryAddress,
      status: "pending",
    };

    if (stripePaymentIntentId) {
      orderData.stripePaymentIntentId = stripePaymentIntentId;
      try {
        const paymentIntent = await stripe.paymentIntents.retrieve(stripePaymentIntentId);
        if (paymentIntent.status === "succeeded") {
          orderData.paymentStatus = "paid";
          orderData.status = "confirmed";
        }
      } catch (err) {
        console.error("Failed to retrieve stripe payment intent:", err);
      }
    }

    const order = await Order.create(orderData);

    return NextResponse.json({ success: true, data: { order } }, { status: 201 });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
});
