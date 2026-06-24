"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";


const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const locale = useLocale();
  const t = useTranslations("auth.login");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        setUser(result.data.user);
        toast.success(`Welcome back, ${result.data.user.name}! 👋`);
        router.push(`/${locale}`);
      } else {
        toast.error(result.error || "Login failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.08)_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-orange-500/30">
            🍔
          </div>
          <h1 className="text-3xl font-black text-white">{t("title")}</h1>
          <p className="text-white/40 mt-2">{t("subtitle")}</p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="login-form">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t("email")}
              </label>
              <input
                {...register("email")}
                type="email"
                placeholder={t("emailPlaceholder")}
                className="input-field"
                id="login-email"
              />
              {errors.email && (
                <p className="text-red-400 text-xs mt-1.5">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t("password")}
              </label>
              <input
                {...register("password")}
                type="password"
                placeholder={t("passwordPlaceholder")}
                className="input-field"
                id="login-password"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="login-submit"
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : (
                t("submit")
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-white/40 text-sm mt-6">
            {t("noAccount")}{" "}
            <Link
              href={`/${locale}/register`}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              {t("register")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
