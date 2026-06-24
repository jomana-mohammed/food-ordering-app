import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Order from "@/lib/models/Order";
import { withAdmin } from "@/lib/middleware/auth";
import { z } from "zod";

const updateStatusSchema = z.object({
  status: z.enum(["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"]),
});

// PUT /api/orders/:id/status - Admin only
export const PUT = withAdmin(async (req: NextRequest, context: any) => {
  try {
    await connectDB();
    const params = await context.params;
    const body = await req.json();
    const validation = updateStatusSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { status: validation.data.status },
      { new: true }
    ).populate("user", "name email");

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { order } });
  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
