import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "react-hot-toast";
import { locales, type Locale } from "@/i18n/request";
import Navbar from "@/components/Navbar";
import CartDrawer from "@/components/CartDrawer";
import AuthInitializer from "@/components/AuthInitializer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FoodieExpress - Fast Food Delivery",
  description:
    "Order delicious food online with fast delivery to your door. Best burgers, pizza, drinks and more.",
  keywords: "food delivery, online ordering, burgers, pizza, fast food",
  openGraph: {
    title: "FoodieExpress",
    description: "Fast food delivery at your fingertips",
    type: "website",
  },
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as Locale)) notFound();

  const messages = await getMessages();
  const dir = locale === "ar" ? "rtl" : "ltr";

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cairo:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#0f0f0f] text-white min-h-screen">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AuthInitializer />
          <Navbar locale={locale} />
          <CartDrawer locale={locale} />
          <main className="min-h-screen">{children}</main>
          <Toaster
            position={locale === "ar" ? "bottom-left" : "bottom-right"}
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "12px",
              },
              success: {
                iconTheme: { primary: "#f97316", secondary: "#fff" },
              },
              error: {
                iconTheme: { primary: "#ef4444", secondary: "#fff" },
              },
            }}
          />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
