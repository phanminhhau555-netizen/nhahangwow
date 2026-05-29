import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  ForkKnife,
  CheckCircle,
  WarningCircle,
  Plus,
  Minus,
} from "@phosphor-icons/react";
import API from "../../services/api";

const STATUS_CONFIG = {
  trong: { label: "Bàn trống", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  dang_dung: { label: "Có khách", color: "bg-blue-100 text-blue-700 border-blue-200" },
  da_dat: { label: "Đã đặt", color: "bg-orange-100 text-orange-700 border-orange-200" },
};

const CATEGORY_TONES = [
  "bg-blue-100 text-blue-600",
  "bg-purple-100 text-purple-600",
  "bg-yellow-100 text-yellow-700",
  "bg-pink-100 text-pink-600",
  "bg-teal-100 text-teal-700",
  "bg-orange-100 text-orange-700",
];

export default function TableOrder() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orderId, setOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchData();
  }, [tableId]);

  const fetchData = async () => {
    try {
      const [tableRes, menuRes, categoriesRes] = await Promise.all([
        API.get(`/api/tables/${tableId}`),
        API.get("/api/menu"),
        API.get("/api/menu/categories"),
      ]);
      setTable(tableRes.data);
      setMenu(menuRes.data.filter((m) => m.is_visible));
      setCategories(categoriesRes.data || []);
    } catch (err) {
      setError("Không tải được dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  const allCategories = useMemo(() => [
    { id: null, label: "Tất cả" },
    ...categories.map((c) => ({ id: c.id, label: c.name })),
  ], [categories]);

  const filteredMenu = useMemo(() =>
    activeCategory === null
      ? menu
      : menu.filter((m) => m.category_id === activeCategory),
    [activeCategory, menu]
  );

  const totalPages = Math.max(1, Math.ceil(filteredMenu.length / ITEMS_PER_PAGE));
  const activePage = currentPage > totalPages ? totalPages : currentPage;
  const startIndex = (activePage - 1) * ITEMS_PER_PAGE;
  const paginatedMenu = filteredMenu.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1, note: "", sendToKitchen: true }];
    });
  };

  const toggleSendToKitchen = (id) => {
    setCart((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, sendToKitchen: c.sendToKitchen !== false ? false : true } : c
      )
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id);
      if (existing.quantity === 1) return prev.filter((c) => c.id !== id);
      return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const getCartQty = (id) => cart.find((c) => c.id === id)?.quantity || 0;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const getCategoryTone = (id) =>
    CATEGORY_TONES[Math.abs(Number(id) || 0) % CATEGORY_TONES.length];

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    if (table?.status !== "dang_dung") {
      alert("Bàn phải ở trạng thái có khách trước khi order.");
      navigate("/staff/tables");
      return;
    }
    
    // Kiểm tra xem có món nào mới hoặc tăng thêm số lượng cần gửi không
    const itemsToPost = cart.filter(item => item.quantity > (item.sentQuantity || 0));
    if (itemsToPost.length === 0) {
      alert("Tất cả các món và số lượng hiện tại đã được gửi trước đó rồi!");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const orderRes = await API.post("/api/orders", { table_id: Number(tableId) });
        currentOrderId = orderRes.data.order_id;
        setOrderId(currentOrderId);
      }

      // Thêm từng món mới/số lượng tăng thêm vào order
      for (const item of itemsToPost) {
        const newQty = item.quantity - (item.sentQuantity || 0);
        await API.post(`/api/orders/${currentOrderId}/items`, {
          menu_item_id: item.id,
          quantity: newQty,
          note: item.note || "",
          status: item.sendToKitchen !== false ? 'cho' : 'hoan_thanh'
        });
      }

      // Chỉ kích hoạt thông báo cho bếp nếu có ít nhất một món mới chọn gửi bếp
      const hasKitchenItems = itemsToPost.some(item => item.sendToKitchen !== false);
      if (hasKitchenItems) {
        await API.post(`/api/orders/${currentOrderId}/send`);
      }

      // Cập nhật lại số lượng đã gửi (sentQuantity) cho các món trong giỏ
      setCart(prev => prev.map(c => ({
        ...c,
        sentQuantity: c.quantity
      })));

      setSuccess("Đã gửi đơn hàng thành công! Bạn có thể tiếp tục chỉnh sửa hoặc thêm món.");
      alert("✅ Đã gửi đơn hàng thành công! Bạn có thể tiếp tục chỉnh sửa hoặc thêm món.");
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi gửi order!");
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  if (loading) {
    return (
      <div className="admin-soft-grid flex min-h-screen items-center justify-center bg-[#eff1ea]">
        <p className="text-sm font-semibold text-slate-400">Đang tải...</p>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[table?.status] || STATUS_CONFIG.trong;

  return (
    <div className="admin-page flex min-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#fbfbf8]/95 px-5 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/staff/tables")}
              className="admin-secondary-btn h-9 w-9 p-0"
            >
              <ArrowLeft size={16} weight="bold" />
            </button>
            <div>
              <p className="admin-kicker">Đặt món</p>
              <h1 className="text-[18px] font-black leading-tight text-slate-950">
                {table?.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Thông báo */}
            {success && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700">
                <CheckCircle size={14} weight="fill" />
                {success}
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700">
                <WarningCircle size={14} weight="duotone" />
                {error}
              </div>
            )}

            {/* Trạng thái bàn */}
            <span className={`rounded-full border px-3 py-1 text-xs font-black ${statusConfig.color}`}>
              {statusConfig.label}
            </span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-[1480px] flex-1 gap-4 overflow-hidden p-4">

        {/* Menu */}
        <div className="flex-1 overflow-auto p-5">
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat.id
                    ? "bg-green-500 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Grid */}
          <div className="grid grid-cols-3 gap-4">
            {filteredMenu.map((item) => {
              const qty = getCartQty(item.id);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
                >
                  {/* Ảnh */}
                  <div className="h-32 bg-gray-100 flex items-center justify-center">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl">🍴</span>
                    )}
                  </div>

                  <div className="p-3">
                    <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                    <p className="text-green-600 font-semibold text-sm mt-0.5">
                      {formatMoney(item.price)}
                    </p>

                    {/* Add/Remove */}
                    {qty === 0 ? (
                      <button
                        onClick={() => addToCart(item)}
                        className="w-full mt-2 bg-green-500 hover:bg-green-600 text-white rounded-lg py-1.5 text-sm transition-colors flex items-center justify-center gap-1"
                      >
                        + Thêm vào giỏ
                      </button>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center font-bold text-gray-600"
                        >
                          -
                        </button>
                        <span className="font-bold text-gray-800">{qty}</span>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 bg-green-500 hover:bg-green-600 rounded-lg flex items-center justify-center font-bold text-white"
                        >
                          +
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Giỏ hàng */}
        <div className="flex w-80 shrink-0 flex-col overflow-hidden rounded-[14px] border border-slate-200/80 bg-white shadow-[0_12px_32px_rgba(15,23,42,0.045)]">

          {/* Cart Header */}
          <div className="border-b border-slate-100 bg-slate-50/70 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart size={18} weight="duotone" className="text-emerald-700" />
                <p className="text-sm font-black text-slate-900">Giỏ hàng</p>
              </div>
              <span className="rounded-full bg-emerald-700 px-2.5 py-0.5 text-[11px] font-black text-white">
                {totalItems} món
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 space-y-2 overflow-auto p-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <ForkKnife size={32} className="mb-2 text-slate-300" weight="duotone" />
                <p className="text-xs font-semibold">Bổ sung món ngon vào giỏ</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.sendToKitchen !== false}
                    onChange={() => toggleSendToKitchen(item.id)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer shrink-0"
                    title="Gửi xuống bếp khi xác nhận"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-green-600">{formatMoney(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-6 w-6 items-center justify-center rounded text-slate-500 transition-colors hover:bg-slate-100"
                    >
                      <Minus size={11} weight="bold" />
                    </button>
                    <span className="w-5 text-center text-xs font-black text-slate-800">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => addToCart(item)}
                      className="flex h-6 w-6 items-center justify-center rounded text-emerald-700 transition-colors hover:bg-emerald-50"
                    >
                      <Plus size={11} weight="bold" />
                    </button>
                  </div>

                  <p className="w-16 text-right text-[12px] font-black text-slate-800">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-t border-slate-100 p-3 space-y-3">
            {/* Tổng */}
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs font-black uppercase tracking-wide text-slate-500">Tổng tiền</p>
              <p className="text-base font-black text-emerald-700">{formatMoney(totalAmount)}</p>
            </div>

            {/* Confirm Button */}
            <button
              onClick={handleConfirmOrder}
              disabled={cart.length === 0 || submitting}
              className="admin-primary-btn w-full"
            >
              {submitting ? (
                "Đang gửi..."
              ) : (
                <>
                  <CheckCircle size={16} weight="fill" />
                  Xác nhận đơn hàng
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}