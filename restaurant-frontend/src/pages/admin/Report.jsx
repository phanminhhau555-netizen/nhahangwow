import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

const TABS = [
  { key: "day", label: "Hôm nay" },
  { key: "week", label: "Tuần" },
  { key: "month", label: "Tháng" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("day");
  const [revenue, setRevenue] = useState(null);
  const [topItems, setTopItems] = useState([]);
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, [tab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [revRes, topRes, invRes] = await Promise.all([
        API.get(`/api/reports/revenue/${tab}`),
        API.get("/api/reports/top-items?limit=5"),
        API.get("/api/reports/inventory"),
      ]);
      setRevenue(revRes.data);
      setTopItems(topRes.data);
      setInventory(invRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount || 0) + "đ";

  const getMaxSold = () =>
    Math.max(...topItems.map((i) => i.tong_so_luong || 0), 1);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo Doanh thu</h1>
          <p className="text-gray-500 text-sm mt-1">
            Phân tích chi tiết hiệu suất kinh doanh của nhà hàng
          </p>
        </div>
        <div className="flex gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === t.key
                  ? "bg-green-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-3xl mb-2">📊</p>
          <p>Đang tải dữ liệu...</p>
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              {
                icon: "💰",
                label: "Tổng doanh thu",
                value: formatMoney(revenue?.tong_doanh_thu),
                change: "+12.5%",
                up: true,
                color: "bg-green-50",
              },
              {
                icon: "🛒",
                label: "Giá trị đơn TB",
                value: formatMoney(
                  (revenue?.tong_doanh_thu || 0) / (revenue?.tong_don || 1)
                ),
                change: "+5.2%",
                up: true,
                color: "bg-blue-50",
              },
              {
                icon: "❌",
                label: "Tỷ lệ hủy đơn",
                value: "2.4%",
                change: "-1.2%",
                up: false,
                color: "bg-red-50",
              },
              {
                icon: "📋",
                label: "Tổng đơn hàng",
                value: revenue?.tong_don || 0,
                change: "+8%",
                up: true,
                color: "bg-purple-50",
              },
            ].map((card, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{card.value}</p>
                    <p className={`text-xs mt-1 ${card.up ? "text-green-500" : "text-red-500"}`}>
                      {card.up ? "↗" : "↘"} {card.change}
                    </p>
                  </div>
                  <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center text-xl`}>
                    {card.icon}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Doanh thu theo ngày */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Xu hướng doanh thu</h2>
              {tab === "day" ? (
                <div className="text-center py-8 text-gray-400">
                  <p className="text-3xl mb-2">📅</p>
                  <p className="font-medium text-gray-700 text-lg">
                    {formatMoney(revenue?.tong_doanh_thu)}
                  </p>
                  <p className="text-sm mt-1">Tổng doanh thu hôm nay</p>
                  <p className="text-xs mt-3 text-gray-300">
                    {revenue?.tong_don || 0} đơn hàng đã thanh toán
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {(revenue?.chi_tiet || []).map((day, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <p className="text-xs text-gray-400 w-20 shrink-0">
                        {new Date(day.ngay).toLocaleDateString("vi-VN")}
                      </p>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(
                              ((day.tong_doanh_thu || 0) /
                                Math.max(...(revenue?.chi_tiet || []).map((d) => d.tong_doanh_thu || 0), 1)) *
                                100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                      <p className="text-xs font-medium text-gray-700 w-24 text-right shrink-0">
                        {formatMoney(day.tong_doanh_thu)}
                      </p>
                    </div>
                  ))}
                  {(!revenue?.chi_tiet || revenue.chi_tiet.length === 0) && (
                    <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
                  )}
                </div>
              )}
            </div>

            {/* Món bán chạy */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Món bán chạy nhất</h2>
                <span className="text-xs text-gray-400">Top 5 sản phẩm</span>
              </div>
              <div className="space-y-4">
                {topItems.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
                ) : (
                  topItems.map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm text-gray-700 font-medium">{item.mon_ten}</p>
                        <p className="text-sm text-green-600 font-semibold">
                          {item.tong_so_luong} đơn
                        </p>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-green-500 h-1.5 rounded-full transition-all"
                          style={{
                            width: `${((item.tong_so_luong || 0) / getMaxSold()) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Phương thức thanh toán */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h2>
              {(revenue?.chi_tiet_thanh_toan || []).length === 0 ? (
                <p className="text-center text-gray-400 py-8">Chưa có dữ liệu</p>
              ) : (
                <div className="space-y-3">
                  {(revenue?.chi_tiet_thanh_toan || []).map((pt, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {pt.payment_method === "tien_mat" ? "💵" :
                           pt.payment_method === "chuyen_khoan" ? "🏦" : "📱"}
                        </span>
                        <p className="text-sm text-gray-700">
                          {pt.payment_method === "tien_mat" ? "Tiền mặt" :
                           pt.payment_method === "chuyen_khoan" ? "Chuyển khoản" : "QR Code"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {formatMoney(pt.tong_doanh_thu)}
                        </p>
                        <p className="text-xs text-gray-400">{pt.tong_don} đơn</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cảnh báo tồn kho */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800">Cảnh báo & Ghi chú</h2>
                {((inventory?.canh_bao_sap_het?.length || 0) +
                  (inventory?.canh_bao_het_hang?.length || 0)) > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {(inventory?.canh_bao_sap_het?.length || 0) +
                      (inventory?.canh_bao_het_hang?.length || 0)} SỰ KIỆN
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {/* Hết hàng */}
                {(inventory?.canh_bao_het_hang || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                    <span className="text-red-500 text-lg">🚨</span>
                    <div>
                      <p className="text-sm font-medium text-red-700">Hết nguyên liệu</p>
                      <p className="text-xs text-red-500 mt-0.5">
                        {item.name} đã hết hàng. Cần nhập bổ sung ngay!
                      </p>
                    </div>
                  </div>
                ))}

                {/* Sắp hết */}
                {(inventory?.canh_bao_sap_het || []).map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <span className="text-yellow-500 text-lg">⚠️</span>
                    <div>
                      <p className="text-sm font-medium text-yellow-700">Sắp hết nguyên liệu</p>
                      <p className="text-xs text-yellow-600 mt-0.5">
                        {item.name} còn {item.quantity} {item.unit}. Mức tối thiểu: {item.min_quantity} {item.unit}
                      </p>
                    </div>
                  </div>
                ))}

                {((inventory?.canh_bao_sap_het?.length || 0) +
                  (inventory?.canh_bao_het_hang?.length || 0)) === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-3xl mb-2">✅</p>
                    <p className="text-sm">Tồn kho ổn định</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </Layout>
  );
}