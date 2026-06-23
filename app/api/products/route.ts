import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Product from "@/lib/models/Product";
import { withAdmin } from "@/lib/middleware/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.object({
    en: z.string().min(1, "English name is required"),
    ar: z.string().min(1, "Arabic name is required"),
  }),
  description: z.object({
    en: z.string().min(1, "English description is required"),
    ar: z.string().min(1, "Arabic description is required"),
  }),
  price: z.number().positive("Price must be positive"),
  category: z.enum(["Burgers", "Pizza", "Drinks", "Desserts", "Salads"]),
  image: z.string().url("Image must be a valid URL"),
  available: z.boolean().optional().default(true),
});

// GET /api/products - Public
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const available = searchParams.get("available");

    const query: Record<string, unknown> = {};

    if (category && category !== "all") {
      query.category = category;
    }

    if (available !== "false") {
      query.available = true;
    }

    if (search) {
      query.$or = [
        { "name.en": { $regex: search, $options: "i" } },
        { "name.ar": { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: { products } });
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/products - Admin only
export const POST = withAdmin(async (req) => {
  try {
    await connectDB();
    const body = await req.json();
    const validation = productSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const product = await Product.create(validation.data);

    return NextResponse.json(
      { success: true, data: { product } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
});
