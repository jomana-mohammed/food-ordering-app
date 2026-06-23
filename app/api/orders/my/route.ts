import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { withAuth } from "@/lib/middleware/auth";

// GET /api/orders/my - Authenticated user's own orders
export const GET = withAuth(async (_req: NextRequest, _context, user) => {
  try {
    await connectDB();
    const orders = await Order.find({ user: user.userId })
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { orders } });
  } catch (error) {
    console.error("Get my orders error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
