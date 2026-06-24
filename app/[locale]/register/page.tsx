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


const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const locale = useLocale();
  const t = useTranslations("auth.register");
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (result.success) {
        setUser(result.data.user);
        toast.success(`Welcome, ${result.data.user.name}! 🎉`);
        router.push(`/${locale}`);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-16 pb-8">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.08)_0%,_transparent_70%)]" />

      <div className="relative w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-xl shadow-orange-500/30">
            🍕
          </div>
          <h1 className="text-3xl font-black text-white">{t("title")}</h1>
          <p className="text-white/40 mt-2">{t("subtitle")}</p>
        </div>

        {/* Form Card */}
        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="register-form">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t("name")}
              </label>
              <input
                {...register("name")}
                type="text"
                placeholder={t("namePlaceholder")}
                className="input-field"
                id="register-name"
              />
              {errors.name && (
                <p className="text-red-400 text-xs mt-1.5">{errors.name.message}</p>
              )}
            </div>

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
                id="register-email"
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
                id="register-password"
              />
              {errors.password && (
                <p className="text-red-400 text-xs mt-1.5">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t("confirmPassword")}
              </label>
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder={t("confirmPasswordPlaceholder")}
                className="input-field"
                id="register-confirm-password"
              />
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs mt-1.5">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              id="register-submit"
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

          {/* Login Link */}
          <p className="text-center text-white/40 text-sm mt-6">
            {t("hasAccount")}{" "}
            <Link
              href={`/${locale}/login`}
              className="text-orange-400 hover:text-orange-300 font-semibold transition-colors"
            >
              {t("login")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
