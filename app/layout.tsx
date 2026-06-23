import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "FoodieExpress - Fast Food Delivery",
  description: "Order delicious food online with fast delivery to your door",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
