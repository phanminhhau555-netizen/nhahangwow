import { useEffect, useState, useCallback } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

const STATUS = {
  cho: { label: "Chờ nấu", color: "bg-yellow-100 text-yellow-600", next: "dang_nau", nextLabel: "Bắt đầu nấu" },
  dang_nau: { label: "Đang nấu", color: "bg-blue-100 text-blue-600", next: "hoan_thanh", nextLabel: "Hoàn thành" },
  hoan_thanh: { label: "Hoàn thành", color: "bg-green-100 text-green-600", next: null, nextLabel: null },
  huy: { label: "Đã hủy", color: "bg-red-100 text-red-600", next: null, nextLabel: null },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("cho");
  const [updating, setUpdating] = useState(null);

  const fetchKitchenOrders = useCallback(async () => {
    try {
      const res = await API.get("/api/orders/kitchen");
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto refresh mỗi 15 giây
  useEffect(() => {
    fetchKitchenOrders();
    const interval = setInterval(fetchKitchenOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchKitchenOrders]);

  const handleUpdateStatus = async (orderId, itemId, nextStatus) => {
    setUpdating(itemId);
    try {
      await API.patch(`/api/orders/${orderId}/items/${itemId}/status`, {
        status: nextStatus,
      });
      fetchKitchenOrders();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => o.status === filter);

  const counts = {
    cho: orders.filter((o) => o.status === "cho").length,
    dang_nau: orders.filter((o) => o.status === "dang_nau").length,
    hoan_thanh: orders.filter((o) => o.status === "hoan_thanh").length,
  };

  const getTimeDiff = (created_at) => {
    const diff = Math.floor((new Date() - new Date(created_at)) / 60000);
    if (diff < 1) return "Vừa xong";
    if (diff < 60) return `${diff} phút trước`;
    return `${Math.floor(diff / 60)} giờ trước`;
  };

  const getTimeColor = (created_at) => {
    const diff = Math.floor((new Date() - new Date(created_at)) / 60000);
    if (diff > 20) return "text-red-500 font-medium";
    if (diff > 10) return "text-yellow-500";
    return "text-gray-400";
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Màn hình Bếp</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý và cập nhật trạng thái món ăn theo thời gian thực
          </p>
        </div>
      </div>

      {/* Stat Tabs */}
      <div className="flex gap-3 mb-6">
        {[
          { key: "cho", label: "Chờ nấu", color: "yellow" },
          { key: "dang_nau", label: "Đang nấu", color: "blue" },
          { key: "hoan_thanh", label: "Hoàn thành", color: "green" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-1 flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
              filter === tab.key
                ? "border-green-500 bg-green-50"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">{tab.icon}</span>
              <span className={`text-sm font-medium ${filter === tab.key ? "text-green-600" : "text-gray-600"}`}>
                {tab.label}
              </span>
            </div>
            <span className={`text-2xl font-bold ${filter === tab.key ? "text-green-600" : "text-gray-800"}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p>Đang tải...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400 bg-white rounded-xl border border-gray-100">
          <p className="text-4xl mb-3">
            {filter === "cho" ? "⏳" : filter === "dang_nau" ? "🔥" : "✅"}
          </p>
          <p className="font-medium text-gray-500">
            {filter === "cho" && "Không có món nào đang chờ"}
            {filter === "dang_nau" && "Không có món nào đang nấu"}
            {filter === "hoan_thanh" && "Chưa có món nào hoàn thành"}
          </p>
          <p className="text-sm mt-1">Tự động cập nhật mỗi 15 giây</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-sm transition-shadow"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">
                    {item.table_name || `Bàn ${item.table_id}`}
                  </span>
                  <span className="text-xs text-gray-400">
                    #{item.order_id}
                  </span>
                </div>
                <span className={`text-xs ${getTimeColor(item.created_at)}`}>
                  {getTimeDiff(item.created_at)}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-4">
                {/* Tên món */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-gray-800">{item.mon_ten}</p>
                    <p className="text-sm text-gray-400 mt-0.5">
                      Số lượng: <span className="font-medium text-gray-700">{item.quantity}</span>
                    </p>
                    {item.note && (
                      <p className="text-xs text-orange-500 mt-1 bg-orange-50 px-2 py-1 rounded-lg">
                        📝 {item.note}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS[item.status]?.color}`}>
                    {STATUS[item.status]?.label}
                  </span>
                </div>

                {/* Action Button */}
                {STATUS[item.status]?.next && (
                  <button
                    onClick={() => handleUpdateStatus(item.order_id, item.id, STATUS[item.status].next)}
                    disabled={updating === item.id}
                    className={`w-full py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
                      item.status === "cho"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                  >
                    {updating === item.id ? "Đang cập nhật..." : STATUS[item.status]?.nextLabel}
                  </button>
                )}

                {item.status === "hoan_thanh" && (
                  <div className="w-full py-2 text-center text-sm text-green-500 font-medium">
                  Đã hoàn thành
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Auto refresh indicator */}
      <p className="text-center text-xs text-gray-300 mt-6">
        Tự động làm mới mỗi 15 giây
      </p>
    </Layout>
  );
}