import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    doanh_thu: 0,
    tong_don: 0,
    tong_mon: 0,
  });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [revenueRes, ordersRes] = await Promise.all([
        API.get("/api/reports/revenue/day"),
        API.get("/api/orders/active"),
      ]);
      setStats({
        doanh_thu: revenueRes.data.tong_doanh_thu || 0,
        tong_don: revenueRes.data.tong_don || 0,
      });
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  const getStatusColor = (status) => {
    switch (status) {
      case "dang_goi": return "bg-blue-100 text-blue-600";
      case "cho_thanh_toan": return "bg-yellow-100 text-yellow-600";
      case "da_thanh_toan": return "bg-green-100 text-green-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "dang_goi": return "Đang gọi";
      case "cho_thanh_toan": return "Chờ TT";
      case "da_thanh_toan": return "Đã TT";
      default: return status;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Đang tải...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo Hiệu suất</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tình hình hoạt động hôm nay
          </p>
        </div>
        <div className="flex gap-2">
          {["Ngày", "Tuần", "Tháng"].map((t) => (
            <button
              key={t}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                t === "Ngày"
                  ? "bg-green-500 text-white"
                  : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
<div className="grid grid-cols-4 gap-4 mb-6">
  
  <div className="bg-white rounded-2xl shadow p-5">
    <p className="text-gray-500 text-sm">
      Doanh thu Ngày
    </p>

    <h2 className="text-2xl font-bold mt-1">
      {formatMoney(stats.doanh_thu)}
    </h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-5">
    <p className="text-gray-500 text-sm">
      Tổng Đơn hàng
    </p>

    <h2 className="text-2xl font-bold mt-1">
      {stats.tong_don}
    </h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-5">
    <p className="text-gray-500 text-sm">
      Bàn đang dùng
    </p>

    <h2 className="text-2xl font-bold mt-1">
      {orders.length}
    </h2>
  </div>

  <div className="bg-white rounded-2xl shadow p-5">
    <p className="text-gray-500 text-sm">
      Tổng khách hàng
    </p>

    <h2 className="text-2xl font-bold mt-1">
      {stats.tong_khach || 0}
    </h2>
  </div>

</div>
      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800">
            Trạng thái đơn hàng trực tiếp
          </h2>
          <div className="flex gap-3 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Đang chế biến
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Đã giao
            </span>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-400 border-b border-gray-100">
                <th className="text-left pb-3">MÃ ĐƠN</th>
                <th className="text-left pb-3">BÀN</th>
                <th className="text-left pb-3">TỔNG CỘNG</th>
                <th className="text-left pb-3">THỜI GIAN</th>
                <th className="text-left pb-3">TRẠNG THÁI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr key={order.id} className="text-sm">
                  <td className="py-3 font-medium text-gray-800">
                    #ORD-{order.id}
                  </td>
                  <td className="py-3 text-gray-600">
                    {order.table_name || `Bàn ${order.table_id}`}
                  </td>
                  <td className="py-3 text-gray-800">
                    {formatMoney(order.total_amount || 0)}
                  </td>
                  <td className="py-3 text-gray-400">
                    {new Date(order.created_at).toLocaleTimeString("vi-VN")}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}