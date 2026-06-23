import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { withAdmin } from "@/lib/middleware/auth";
import { z } from "zod";

const updateProductSchema = z.object({
  name: z.object({
    en: z.string().min(1),
    ar: z.string().min(1),
  }).optional(),
  description: z.object({
    en: z.string().min(1),
    ar: z.string().min(1),
  }).optional(),
  price: z.number().positive().optional(),
  category: z.enum(["Burgers", "Pizza", "Drinks", "Desserts", "Salads"]).optional(),
  image: z.string().url().optional(),
  available: z.boolean().optional(),
});

// GET /api/products/:id - Public
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const product = await Product.findById(params.id);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: { product } });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/products/:id - Admin only
export const PUT = withAdmin(async (req, { params }) => {
  try {
    await connectDB();
    const body = await req.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: validation.data },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { product } });
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});

// DELETE /api/products/:id - Admin only
export const DELETE = withAdmin(async (_req, { params }) => {
  try {
    await connectDB();
    const product = await Product.findByIdAndDelete(params.id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: { message: "Product deleted successfully" } });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
