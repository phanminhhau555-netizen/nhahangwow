import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

const categories = [
  { id: null, label: "Tất cả" },
  { id: 1, label: "Món chính" },
  { id: 2, label: "Món phụ" },
  { id: 3, label: "Đồ uống" },
  { id: 4, label: "Tráng miệng" },
];

export default function TableOrder() {
  const { tableId } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState([]);
  const [cart, setCart] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    let cancelled = false;

    Promise.all([API.get(`/api/tables/${tableId}`), API.get("/api/menu")])
      .then(([tableRes, menuRes]) => {
        if (cancelled) return;
        setTable(tableRes.data);
        setMenu(menuRes.data.filter((item) => item.is_visible));
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tableId]);

  const filteredMenu = activeCategory
    ? menu.filter((m) => m.category_id === activeCategory)
    : menu;

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
    try {
      // Tạo order mới hoặc dùng order đang có
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

      alert("✅ Đã gửi đơn hàng thành công! Bạn có thể tiếp tục chỉnh sửa hoặc thêm món.");
    } catch (err) {
      alert("❌ Lỗi: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        <p>Đang tải...</p>
      </div>
    );
  }

  if (table?.status !== "dang_dung") {
    return (
      <div className="admin-page flex min-h-[calc(100vh-2rem)] items-center justify-center">
        <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
          <p className="admin-kicker">Order món</p>
          <h1 className="admin-title mt-1">Bàn chưa sẵn sàng order</h1>
          <p className="admin-subtitle mx-auto mt-2">
            Hãy chuyển bàn sang có khách trước khi gọi món.
          </p>
          <div className="mt-5 flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => navigate("/staff/tables")} className="admin-primary-btn flex-1">
              Về Order món
            </button>
            <button type="button" onClick={() => navigate("/staff/reservations")} className="admin-tab flex-1">
              Mở Quản lí bàn
            </button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="admin-page flex h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_18px_44px_rgba(15,23,42,0.08)]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/staff/tables")}
            className="admin-tab"
          >
            ← Quay lại
          </button>
          <div>
            <h1 className="font-bold text-gray-800">{table?.name}</h1>
            <p className="text-xs font-semibold text-gray-400">Trang order riêng của nhân viên</p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          table?.status === "trong" ? "bg-green-100 text-green-600" :
          table?.status === "dang_dung" ? "bg-blue-100 text-blue-600" :
          "bg-orange-100 text-orange-600"
        }`}>
          {table?.status === "trong" ? "Bàn trống" :
           table?.status === "dang_dung" ? "Có khách" : "Đã đặt"}
        </span>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Menu */}
        <div className="flex-1 overflow-hidden flex flex-col justify-between p-5">
          {/* Category Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setCurrentPage(1);
                }}
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

          <div className="flex-1 overflow-auto">
            {/* Menu Grid */}
            <div className="grid grid-cols-3 gap-4">
              {paginatedMenu.map((item) => {
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

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-4 pt-4 border-t border-gray-100 bg-white rounded-xl p-2 shadow-sm">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={activePage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                ← Trước
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-lg border text-xs font-bold transition-colors ${
                    activePage === page
                      ? "bg-green-500 border-green-500 text-white"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={activePage === totalPages}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-semibold transition-colors"
              >
                Sau →
              </button>
            </div>
          )}
        </div>

        {/* Giỏ hàng */}
        <div className="flex w-80 flex-col border-l border-gray-100 bg-white">
          {/* Cart Header */}
          <div className="px-5 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">🛒 Giỏ hàng</h2>
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length} món
              </span>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-3xl mb-2">🍴</p>
                <p className="text-sm">Bổ sung món ngon vào giỏ</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={item.sendToKitchen !== false}
                    onChange={() => toggleSendToKitchen(item.id)}
                    className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                    title="Gửi xuống bếp khi xác nhận"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-green-600">{formatMoney(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                    <button
                      onClick={() => addToCart(item)}
                      className="w-6 h-6 bg-green-500 rounded flex items-center justify-center text-xs font-bold text-white"
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 w-20 text-right">
                    {formatMoney(item.price * item.quantity)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">Tổng tiền</p>
              <p className="text-lg font-bold text-green-600">{formatMoney(totalAmount)}</p>
            </div>
            <button
              onClick={handleConfirmOrder}
              disabled={cart.length === 0 || submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? "Đang gửi..." : "✅ Xác nhận đơn hàng"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
