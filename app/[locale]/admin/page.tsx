"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuthStore } from "@/store/authStore";
import toast from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

interface Product {
  _id: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
  price: number;
  category: "Burgers" | "Pizza" | "Drinks" | "Desserts" | "Salads";
  image: string;
  available: boolean;
}

interface OrderItem {
  product: string;
  name: { en: string; ar: string };
  quantity: number;
  priceAtOrder: number;
}

interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: "online" | "cash";
  paymentStatus: "paid" | "unpaid";
  deliveryAddress: {
    street: string;
    city: string;
    phone: string;
  };
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled";
  createdAt: string;
}

type TabType = "overview" | "products" | "orders";

export default function AdminDashboard() {
  const locale = useLocale();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const tOrders = useTranslations("orders");
  const router = useRouter();

  const { user, isLoading: authLoading } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Filter/Search states
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");

  // Product Form Modal state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Product Form inputs
  const [formNameEn, setFormNameEn] = useState("");
  const [formNameAr, setFormNameAr] = useState("");
  const [formDescEn, setFormDescEn] = useState("");
  const [formDescAr, setFormDescAr] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formCategory, setFormCategory] = useState<Product["category"]>("Burgers");
  const [formImage, setFormImage] = useState("");
  const [formAvailable, setFormAvailable] = useState(true);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Authentication check
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      toast.error(locale === "ar" ? "وصول مرفوض" : "Access Denied");
      router.push(`/${locale}`);
    }
  }, [user, authLoading, router, locale]);

  // Fetch functions
  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      // Pass available=false to get both available & unavailable products
      const res = await fetch("/api/products?available=false");
      const data = await res.json();
      if (data.success) {
        setProducts(data.data.products);
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoadingProducts(false);
    }
  }, [tCommon]);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      if (data.success) {
        setOrders(data.data.orders);
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setLoadingOrders(false);
    }
  }, [tCommon]);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchProducts();
      fetchOrders();
    }
  }, [user, fetchProducts, fetchOrders]);

  // Open product modal for add/edit
  const openProductModal = (product: Product | null = null) => {
    if (product) {
      setEditingProduct(product);
      setFormNameEn(product.name.en);
      setFormNameAr(product.name.ar);
      setFormDescEn(product.description.en);
      setFormDescAr(product.description.ar);
      setFormPrice(product.price.toString());
      setFormCategory(product.category);
      setFormImage(product.image);
      setFormAvailable(product.available);
    } else {
      setEditingProduct(null);
      setFormNameEn("");
      setFormNameAr("");
      setFormDescEn("");
      setFormDescAr("");
      setFormPrice("");
      setFormCategory("Burgers");
      setFormImage("");
      setFormAvailable(true);
    }
    setIsProductModalOpen(true);
  };

  const closeProductModal = () => {
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Submit product Form
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameEn || !formNameAr || !formPrice || !formImage || !formDescEn || !formDescAr) {
      toast.error(locale === "ar" ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill in all required fields");
      return;
    }

    setFormSubmitting(true);
    const productData = {
      name: { en: formNameEn, ar: formNameAr },
      description: { en: formDescEn, ar: formDescAr },
      price: parseFloat(formPrice),
      category: formCategory,
      image: formImage,
      available: formAvailable,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(editingProduct ? t("productsTab.editSuccess") : t("productsTab.addSuccess"));
        fetchProducts();
        closeProductModal();
      } else {
        toast.error(data.error || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle availability directly
  const handleToggleAvailability = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ available: !product.available }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("productsTab.editSuccess"));
        // Update local state directly
        setProducts(products.map((p) => (p._id === product._id ? { ...p, available: !p.available } : p)));
      } else {
        toast.error(data.error || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  // Delete product
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm(t("productsTab.deleteConfirm"))) return;

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("productsTab.deleteSuccess"));
        setProducts(products.filter((p) => p._id !== productId));
      } else {
        toast.error(data.error || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(t("ordersTab.statusUpdated"));
        // Update local state directly
        setOrders(orders.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o)));
      } else {
        toast.error(data.error || tCommon("error"));
      }
    } catch {
      toast.error(tCommon("error"));
    }
  };

  // Calculations for stats
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter((o) => o.status === "pending").length;

  const todayRevenue = orders
    .filter((o) => {
      if (o.status === "cancelled") return false;
      const orderDate = new Date(o.createdAt);
      const today = new Date();
      return (
        orderDate.getDate() === today.getDate() &&
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    })
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.en.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.name.ar.includes(productSearch) ||
      p.description.en.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description.ar.includes(productSearch);

    const matchesCategory = productCategory === "all" || p.category === productCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter((o) => {
    return orderStatusFilter === "all" || o.status === orderStatusFilter;
  });

  if (authLoading || !user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const isRtl = locale === "ar";

  return (
    <div className="min-h-screen pt-24 pb-16 bg-black text-white relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.08)_0%,_transparent_60%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
              {t("title")}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {isRtl ? "مرحباً بك في لوحة الإدارة. إدارة المنتجات والطلبات بكفاءة." : "Welcome back to the admin portal. Manage products and orders efficiently."}
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t("overview")}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "products"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t("products")}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {t("orders")}
            </button>
          </div>
        </div>

        {/* Tab 1: Overview */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1 */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t("stats.totalOrders")}</p>
                  <h3 className="text-3xl font-bold mt-2">{loadingOrders ? "..." : totalOrdersCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 text-xl">
                  📦
                </div>
              </div>

              {/* Stat 2 */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t("stats.pendingOrders")}</p>
                  <h3 className="text-3xl font-bold mt-2 text-amber-500">{loadingOrders ? "..." : pendingOrdersCount}</h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 text-xl animate-pulse">
                  ⏳
                </div>
              </div>

              {/* Stat 3 */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t("stats.todayRevenue")}</p>
                  <h3 className="text-3xl font-bold mt-2 text-emerald-400">
                    {loadingOrders ? "..." : `$${todayRevenue.toFixed(2)}`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-xl">
                  💰
                </div>
              </div>

              {/* Stat 4 */}
              <div className="glass p-6 rounded-2xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">{t("stats.totalRevenue")}</p>
                  <h3 className="text-3xl font-bold mt-2 text-blue-400">
                    {loadingOrders ? "..." : `$${totalRevenue.toFixed(2)}`}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 text-xl">
                  📈
                </div>
              </div>
            </div>

            {/* Layout with Recent Orders & Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Status breakdown chart */}
              <div className="glass p-6 rounded-2xl border border-white/10 lg:col-span-1">
                <h3 className="text-lg font-bold mb-6">{isRtl ? "توزيع حالات الطلبات" : "Order Status Distribution"}</h3>
                <div className="space-y-4">
                  {["pending", "confirmed", "preparing", "out_for_delivery", "delivered", "cancelled"].map((status) => {
                    const count = orders.filter((o) => o.status === status).length;
                    const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0;
                    
                    const colors: Record<string, string> = {
                      pending: "bg-amber-500",
                      confirmed: "bg-blue-500",
                      preparing: "bg-purple-500",
                      out_for_delivery: "bg-orange-500",
                      delivered: "bg-emerald-500",
                      cancelled: "bg-red-500",
                    };

                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="capitalize font-medium text-white/80">
                            {tOrders(`status.${status}`)}
                          </span>
                          <span className="text-white/60 font-semibold">{count}</span>
                        </div>
                        <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${colors[status] || "bg-orange-500"} rounded-full transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Orders */}
              <div className="glass p-6 rounded-2xl border border-white/10 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">{isRtl ? "آخر الطلبات" : "Recent Orders"}</h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-4"
                  >
                    {isRtl ? "عرض الكل" : "View All"}
                  </button>
                </div>

                <div className="space-y-4">
                  {loadingOrders ? (
                    <p className="text-white/50 text-sm text-center py-6">{tCommon("loading")}</p>
                  ) : orders.length === 0 ? (
                    <p className="text-white/50 text-sm text-center py-6">{tOrders("empty")}</p>
                  ) : (
                    orders.slice(0, 5).map((order) => (
                      <div
                        key={order._id}
                        className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 flex items-center justify-between gap-4"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {order.user?.name || (isRtl ? "مستخدم ضيف" : "Guest Customer")}
                          </p>
                          <p className="text-xs text-white/50 truncate">
                            {order._id.substring(0, 8)}... | {new Date(order.createdAt).toLocaleDateString(locale)}
                          </p>
                          <p className="text-xs text-orange-400 font-semibold mt-1">
                            {order.items.map((item) => `${isRtl ? item.name.ar : item.name.en} x${item.quantity}`).join(", ")}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-white">${order.totalAmount.toFixed(2)}</p>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 ${
                              order.status === "delivered"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : order.status === "cancelled"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                            }`}
                          >
                            {tOrders(`status.${order.status}`)}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === "products" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-2xl">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t("productsTab.table.name") + "..."}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                </div>

                {/* Category select */}
                <select
                  value={productCategory}
                  onChange={(e) => setProductCategory(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="all" className="bg-black">{tCommon("all")}</option>
                  <option value="Burgers" className="bg-black">Burgers</option>
                  <option value="Pizza" className="bg-black">Pizza</option>
                  <option value="Drinks" className="bg-black">Drinks</option>
                  <option value="Desserts" className="bg-black">Desserts</option>
                  <option value="Salads" className="bg-black">Salads</option>
                </select>
              </div>

              {/* Add Product Button */}
              <button
                onClick={() => openProductModal()}
                className="btn-primary !px-5 !py-2.5 flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
              >
                <span>➕</span>
                <span>{t("productsTab.addProduct")}</span>
              </button>
            </div>

            {/* Products Table Card */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/70 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">{t("productsTab.table.image")}</th>
                      <th className="px-6 py-4">{t("productsTab.table.name")}</th>
                      <th className="px-6 py-4">{t("productsTab.table.category")}</th>
                      <th className="px-6 py-4">{t("productsTab.table.price")}</th>
                      <th className="px-6 py-4 text-center">{t("productsTab.table.available")}</th>
                      <th className="px-6 py-4 text-center">{t("productsTab.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                            <span>{tCommon("loading")}</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-white/50">
                          {isRtl ? "لا توجد منتجات مطابقة للبحث." : "No products matching your filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-white/5 transition-colors">
                          {/* Image */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                              <Image
                                src={product.image || "/images/placeholder.jpg"}
                                alt={isRtl ? product.name.ar : product.name.en}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          </td>

                          {/* Name */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">
                              {isRtl ? product.name.ar : product.name.en}
                            </div>
                            <div className="text-xs text-white/50 max-w-[250px] truncate mt-0.5">
                              {isRtl ? product.description.ar : product.description.en}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold">
                              {product.category}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-white">
                            ${product.price.toFixed(2)}
                          </td>

                          {/* Availability */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <button
                              onClick={() => handleToggleAvailability(product)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                product.available ? "bg-orange-500" : "bg-white/10"
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  product.available ? (isRtl ? "-translate-x-5" : "translate-x-5") : "translate-x-0"
                                }`}
                              />
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center gap-3">
                              <button
                                onClick={() => openProductModal(product)}
                                className="p-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors"
                                title={tCommon("edit")}
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors"
                                title={tCommon("delete")}
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Orders */}
        {activeTab === "orders" && (
          <div className="space-y-6 animate-fade-in">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1 max-w-md">
                <label className="text-sm text-white/60 font-semibold">{t("ordersTab.filterByStatus")}:</label>
                <select
                  value={orderStatusFilter}
                  onChange={(e) => setOrderStatusFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-orange-500 transition-colors"
                >
                  <option value="all" className="bg-black">{tCommon("all")}</option>
                  <option value="pending" className="bg-black">{tOrders("status.pending")}</option>
                  <option value="confirmed" className="bg-black">{tOrders("status.confirmed")}</option>
                  <option value="preparing" className="bg-black">{tOrders("status.preparing")}</option>
                  <option value="out_for_delivery" className="bg-black">{tOrders("status.out_for_delivery")}</option>
                  <option value="delivered" className="bg-black">{tOrders("status.delivered")}</option>
                  <option value="cancelled" className="bg-black">{tOrders("status.cancelled")}</option>
                </select>
              </div>
            </div>

            {/* Orders Table Card */}
            <div className="glass rounded-2xl border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5 text-white/70 text-xs font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">{t("ordersTab.table.orderID")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.customer")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.items")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.total")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.payment")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.status")}</th>
                      <th className="px-6 py-4">{t("ordersTab.table.date")}</th>
                      <th className="px-6 py-4 text-center">{t("ordersTab.table.actions")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-white/50">
                          <div className="flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-orange-500"></div>
                            <span>{tCommon("loading")}</span>
                          </div>
                        </td>
                      </tr>
                    ) : filteredOrders.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-12 text-center text-white/50">
                          {tOrders("empty")}
                        </td>
                      </tr>
                    ) : (
                      filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-white/5 transition-colors">
                          {/* Order ID */}
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-xs font-bold text-white">
                            #{order._id.substring(0, 8)}...
                          </td>

                          {/* Customer */}
                          <td className="px-6 py-4">
                            <div className="font-bold text-white">
                              {order.user?.name || (isRtl ? "مستخدم ضيف" : "Guest Customer")}
                            </div>
                            <div className="text-xs text-white/50 mt-0.5">
                              {order.user?.email || ""}
                            </div>
                          </td>

                          {/* Items */}
                          <td className="px-6 py-4 max-w-[200px]">
                            <div className="text-xs space-y-1">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="truncate text-white/80">
                                  {isRtl ? item.name.ar : item.name.en} <span className="font-bold text-orange-400">x{item.quantity}</span>
                                </div>
                              ))}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="px-6 py-4 whitespace-nowrap font-bold text-white">
                            ${order.totalAmount.toFixed(2)}
                          </td>

                          {/* Payment */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-xs">
                              <span className="font-semibold block text-white/80">
                                {tOrders(`payment.${order.paymentMethod}`)}
                              </span>
                              <span
                                className={`inline-block text-[10px] font-bold px-1.5 py-0.2 mt-1 rounded-full ${
                                  order.paymentStatus === "paid"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                    : "bg-red-500/10 text-red-400 border border-red-500/20"
                                }`}
                              >
                                {tOrders(`payment.${order.paymentStatus}`)}
                              </span>
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg ${
                                order.status === "delivered"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : order.status === "cancelled"
                                  ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                  : "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                              }`}
                            >
                              {tOrders(`status.${order.status}`)}
                            </span>
                          </td>

                          {/* Date */}
                          <td className="px-6 py-4 whitespace-nowrap text-xs text-white/60">
                            {new Date(order.createdAt).toLocaleString(locale)}
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex flex-col gap-1 items-center justify-center">
                              <select
                                value={order.status}
                                onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value as Order["status"])}
                                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-orange-500 transition-colors"
                              >
                                <option value="pending" className="bg-black">{tOrders("status.pending")}</option>
                                <option value="confirmed" className="bg-black">{tOrders("status.confirmed")}</option>
                                <option value="preparing" className="bg-black">{tOrders("status.preparing")}</option>
                                <option value="out_for_delivery" className="bg-black">{tOrders("status.out_for_delivery")}</option>
                                <option value="delivered" className="bg-black">{tOrders("status.delivered")}</option>
                                <option value="cancelled" className="bg-black">{tOrders("status.cancelled")}</option>
                              </select>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {isProductModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="glass max-w-2xl w-full rounded-2xl border border-white/15 p-6 md:p-8 animate-scale-up max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  {editingProduct ? t("productsTab.form.editTitle") : t("productsTab.form.addTitle")}
                </h2>
                <button
                  onClick={closeProductModal}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white flex items-center justify-center font-bold text-sm border border-white/15"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleProductSubmit} className="space-y-6 text-sm text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name English */}
                  <div>
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.nameEn")} *</label>
                    <input
                      type="text"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      required
                      placeholder="e.g. Double Beef Burger"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Name Arabic */}
                  <div>
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.nameAr")} *</label>
                    <input
                      type="text"
                      value={formNameAr}
                      onChange={(e) => setFormNameAr(e.target.value)}
                      required
                      placeholder="مثال: برجر لحم دبل"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors text-right"
                    />
                  </div>

                  {/* Description English */}
                  <div className="md:col-span-2">
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.descriptionEn")} *</label>
                    <textarea
                      value={formDescEn}
                      onChange={(e) => setFormDescEn(e.target.value)}
                      required
                      rows={3}
                      placeholder="e.g. Flame-grilled beef patty, cheddar cheese, special sauce, lettuce, and tomatoes in a brioche bun."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Description Arabic */}
                  <div className="md:col-span-2">
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.descriptionAr")} *</label>
                    <textarea
                      value={formDescAr}
                      onChange={(e) => setFormDescAr(e.target.value)}
                      required
                      rows={3}
                      placeholder="مثال: شريحة لحم بقري مشوية على اللهب، جبنة شيدر، صلصة خاصة، خس وطماطم في خبز بريوش."
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors resize-none text-right"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.price")} *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      required
                      placeholder="12.99"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.category")} *</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as Product["category"])}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-orange-500 transition-colors"
                    >
                      <option value="Burgers" className="bg-black">Burgers</option>
                      <option value="Pizza" className="bg-black">Pizza</option>
                      <option value="Drinks" className="bg-black">Drinks</option>
                      <option value="Desserts" className="bg-black">Desserts</option>
                      <option value="Salads" className="bg-black">Salads</option>
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="md:col-span-2">
                    <label className="block text-white/80 font-semibold mb-1.5">{t("productsTab.form.image")} *</label>
                    <input
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      required
                      placeholder="e.g. /images/products/double-beef.jpg or a valid web URL"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/40 focus:outline-none focus:border-orange-500 transition-colors"
                    />
                  </div>

                  {/* Available */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formAvailable}
                      onChange={(e) => setFormAvailable(e.target.checked)}
                      className="w-5 h-5 rounded bg-white/5 border border-white/10 text-orange-500 focus:ring-orange-500 focus:ring-offset-black"
                    />
                    <label htmlFor="available" className="text-white/80 font-semibold select-none cursor-pointer">
                      {t("productsTab.form.available")}
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/10 mt-8">
                  <button
                    type="button"
                    onClick={closeProductModal}
                    className="px-5 py-2.5 border border-white/10 hover:bg-white/5 text-white font-semibold rounded-xl transition-colors"
                  >
                    {tCommon("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="btn-primary !px-6 !py-2.5 font-semibold shrink-0"
                  >
                    {formSubmitting ? tCommon("loading") : tCommon("save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
