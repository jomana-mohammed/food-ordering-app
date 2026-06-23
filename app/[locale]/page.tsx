"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useCartStore } from "@/store/cartStore";
import { ProductCardSkeleton } from "@/components/LoadingSkeleton";
import toast from "react-hot-toast";

interface Product {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  price: number;
  category: string;
  image: string;
  available: boolean;
}

const CATEGORIES = ["All", "Burgers", "Pizza", "Drinks", "Desserts", "Salads"];

const CATEGORY_ICONS: Record<string, string> = {
  All: "🍽️",
  Burgers: "🍔",
  Pizza: "🍕",
  Drinks: "🥤",
  Desserts: "🍰",
  Salads: "🥗",
};

interface HomePageProps {
  params: { locale: string };
}

export default function HomePage({ params: { locale } }: HomePageProps) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const { addItem, openCart } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All") params.set("category", selectedCategory);
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, debouncedSearch, tCommon]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAddToCart = (product: Product) => {
    addItem({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image,
    });
    toast.success(
      `${locale === "ar" ? product.name.ar : product.name.en} ${
        locale === "ar" ? "أضيف للسلة!" : "added to cart!"
      }`,
      { icon: "🛒" }
    );
    openCart();
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden pt-16">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/50 via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.15)_0%,_transparent_70%)]" />

        {/* Decorative circles */}
        <div className="absolute top-20 right-1/4 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-48 h-48 bg-red-500/10 rounded-full blur-2xl" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 rounded-full px-4 py-1.5 text-sm text-orange-300 mb-6">
            <span className="animate-pulse">🔥</span>
            {locale === "ar" ? "أفضل المطاعم في مدينتك" : "Best restaurants in your city"}
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-tight mb-6">
            {locale === "ar" ? (
              <>
                طعام <span className="gradient-text">شهي</span>،
                <br />
                توصيل <span className="gradient-text">سريع</span>
              </>
            ) : (
              <>
                Delicious <span className="gradient-text">Food</span>,
                <br />
                Delivered <span className="gradient-text">Fast</span>
              </>
            )}
          </h1>
          <p className="text-white/60 text-xl mb-8 max-w-2xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <a
            href="#menu"
            className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
          >
            {t("hero.cta")} <span>→</span>
          </a>
        </div>

        {/* Floating food emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {["🍔", "🍕", "🥗", "🍰", "🥤", "🍟"].map((emoji, i) => (
            <div
              key={i}
              className="absolute text-3xl opacity-10 animate-float"
              style={{
                left: `${10 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`,
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg
              className="w-5 h-5 text-white/30"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-12"
            id="menu-search"
          />
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 mb-10 scrollbar-hide">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              id={`category-${category.toLowerCase()}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30"
                  : "glass text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{CATEGORY_ICONS[category]}</span>
              <span>
                {category === "All"
                  ? tCommon("all")
                  : t(`categories.${category.toLowerCase()}` as Parameters<typeof t>[0])}
              </span>
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-7xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-white mb-3">{t("noResults")}</h3>
            <p className="text-white/40 max-w-md">{t("noResultsHint")}</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-6 btn-secondary"
            >
              {tCommon("all")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product._id}
                className="bg-[#1a1a1a] rounded-2xl overflow-hidden border border-white/10 card-hover group"
                id={`product-${product._id}`}
              >
                {/* Product Image */}
                <div className="relative h-48 overflow-hidden bg-white/5">
                  <img
                    src={product.image}
                    alt={locale === "ar" ? product.name.ar : product.name.en}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop";
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full border border-white/10">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-4">
                  <h3 className="text-white font-bold text-base mb-1 line-clamp-1">
                    {locale === "ar" ? product.name.ar : product.name.en}
                  </h3>
                  <p className="text-white/40 text-sm mb-4 line-clamp-2">
                    {locale === "ar"
                      ? product.description.ar
                      : product.description.en}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-orange-400 font-black text-xl">
                      ${product.price.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.available}
                      id={`add-to-cart-${product._id}`}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        product.available
                          ? "bg-orange-500 hover:bg-orange-600 text-white active:scale-95"
                          : "bg-white/10 text-white/30 cursor-not-allowed"
                      }`}
                    >
                      {product.available ? (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          {t("addToCart")}
                        </>
                      ) : (
                        t("outOfStock")
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; }
        .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
      `}</style>
    </div>
  );
}
