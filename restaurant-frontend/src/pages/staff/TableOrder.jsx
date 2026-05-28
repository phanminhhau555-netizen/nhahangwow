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
  const [note, setNote] = useState("");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tableId]);

  const fetchData = async () => {
    try {
      const [tableRes, menuRes] = await Promise.all([
        API.get(`/api/tables/${tableId}`),
        API.get("/api/menu"),
      ]);
      setTable(tableRes.data);
      setMenu(menuRes.data.filter((m) => m.is_visible));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMenu = activeCategory
    ? menu.filter((m) => m.category_id === activeCategory)
    : menu;

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1, note: "" }];
    });
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
    setSubmitting(true);
    try {
      // Tạo order mới hoặc dùng order đang có
      let currentOrderId = orderId;
      if (!currentOrderId) {
        const orderRes = await API.post("/api/orders", { table_id: Number(tableId) });
        currentOrderId = orderRes.data.order_id;
        setOrderId(currentOrderId);
      }

      // Thêm từng món vào order
      for (const item of cart) {
        await API.post(`/api/orders/${currentOrderId}/items`, {
          menu_item_id: item.id,
          quantity: item.quantity,
          note: item.note || "",
        });
      }

      // Gửi xuống bếp
      await API.post(`/api/orders/${currentOrderId}/send`);

      alert("✅ Đã gửi order xuống bếp!");
      setCart([]);
      navigate("/staff/tables");
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/staff/tables")}
            className="text-gray-400 hover:text-gray-600"
          >
            ← Quay lại
          </button>
          <div>
            <h1 className="font-bold text-gray-800">{table?.name}</h1>
            <p className="text-xs text-gray-400">Chọn món để đặt</p>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Menu */}
        <div className="flex-1 p-6 overflow-auto">
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
        <div className="w-80 bg-white border-l border-gray-100 flex flex-col">
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