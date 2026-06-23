import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/middleware/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: "Logged out successfully" } });
  return clearAuthCookies(response);
}
