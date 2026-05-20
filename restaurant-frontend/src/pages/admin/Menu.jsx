import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

const categories = [
  { id: null, label: "Tất cả" },
  { id: 1, label: "Món chính" },
  { id: 2, label: "Món phụ" },
  { id: 3, label: "Đồ uống" },
  { id: 4, label: "Tráng miệng" },
];

const STATUS_COLOR = {
  true: "text-green-500",
  false: "text-gray-400",
};

export default function MenuPage() {
  const [menu, setMenu] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    category_id: 1,
    image_url: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    if (activeCategory === null) {
      setFiltered(menu);
    } else {
      setFiltered(menu.filter((item) => item.category_id === activeCategory));
    }
    setPage(1);
  }, [activeCategory, menu]);

  const fetchMenu = async () => {
    try {
      const res = await API.get("/api/menu");
      setMenu(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/api/menu", form);
      setSuccess("Thêm món ăn thành công!");
      setForm({ name: "", price: "", description: "", category_id: 1, image_url: "" });
      setShowForm(false);
      fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi thêm món ăn!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await API.patch(`/api/menu/${id}/toggle`);
      fetchMenu();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa món ăn này?")) return;
    try {
      await API.delete(`/api/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error(err);
    }
  };

  const formatMoney = (amount) =>
    new Intl.NumberFormat("vi-VN").format(amount) + "đ";

  const getCategoryLabel = (id) =>
    categories.find((c) => c.id === id)?.label || "N/A";

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Thực đơn</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cấu hình món ăn, cập nhật giá cả và quản lý tình trạng sẵn có.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          + Thêm Món Mới
        </button>
      </div>

      {/* Thông báo */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 mb-4 text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
          ⚠️ {error}
        </div>
      )}

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Category Filter + Stats */}
          <div className="flex gap-4 mb-4">
            {/* Filter */}
            <div className="flex-1 bg-white rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="font-medium text-gray-800 text-sm">Danh mục nhanh</p>
                <button className="text-green-500 text-xs hover:underline">
                  Quản lý danh mục
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      activeCategory === cat.id
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tổng món */}
            <div className="w-48 bg-green-500 rounded-xl p-4 text-white">
              <p className="text-sm opacity-80">Tổng món đang bán</p>
              <p className="text-4xl font-bold mt-1">{menu.filter(m => m.is_visible).length}</p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left px-5 py-4">THÔNG TIN MÓN</th>
                  <th className="text-left px-5 py-4">DANH MỤC</th>
                  <th className="text-left px-5 py-4">GIÁ BÁN</th>
                  <th className="text-left px-5 py-4">TRẠNG THÁI</th>
                  <th className="text-left px-5 py-4">TỒN KHO</th>
                  <th className="text-left px-5 py-4">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      Đang tải...
                    </td>
                  </tr>
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-gray-400">
                      <p className="text-3xl mb-2">🍽️</p>
                      <p>Chưa có món ăn nào</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      {/* Thông tin món */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : "🍴"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                            <p className="text-xs text-gray-400">SKU: DF-{String(item.id).padStart(4, "0")}</p>
                          </div>
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.category_id === 1 ? "bg-blue-100 text-blue-600" :
                          item.category_id === 2 ? "bg-purple-100 text-purple-600" :
                          item.category_id === 3 ? "bg-yellow-100 text-yellow-600" :
                          "bg-pink-100 text-pink-600"
                        }`}>
                          {getCategoryLabel(item.category_id)}
                        </span>
                      </td>

                      {/* Giá */}
                      <td className="px-5 py-4 text-sm text-gray-800 font-medium">
                        {formatMoney(item.price)}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-5 py-4">
                        <span className={`flex items-center gap-1 text-sm ${STATUS_COLOR[item.is_visible]}`}>
                          <span className={`w-2 h-2 rounded-full ${item.is_visible ? "bg-green-500" : "bg-gray-300"}`}></span>
                          {item.is_visible ? "Sẵn sàng" : "Đã ẩn"}
                        </span>
                      </td>

                      {/* Tồn kho */}
                      <td className="px-5 py-4 text-sm text-gray-600">
                        Không giới hạn
                      </td>

                      {/* Thao tác */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggle(item.id)}
                            className="text-xs text-blue-500 hover:text-blue-700"
                          >
                            {item.is_visible ? "Ẩn" : "Hiện"}
                          </button>
                          <span className="text-gray-200">|</span>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="text-xs text-red-400 hover:text-red-600"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                <p className="text-xs text-gray-400">
                  Hiển thị {(page - 1) * itemsPerPage + 1} - {Math.min(page * itemsPerPage, filtered.length)} trong tổng số {filtered.length} món
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                  >
                    ‹
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === p
                          ? "bg-green-500 text-white"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 disabled:opacity-30 hover:bg-gray-50"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Thêm món */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Thêm món ăn mới</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Tên món */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên món ăn
                </label>
                <input
                  type="text"
                  placeholder="Nhập tên món ăn..."
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Danh mục + Giá */}
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phân loại
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    {categories.filter(c => c.id !== null).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    type="number"
                    placeholder="85000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              {/* Mô tả */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả món ăn
                </label>
                <textarea
                  placeholder="Nhập mô tả chi tiết về cách chế biến hoặc hương vị..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
              </div>

              {/* URL ảnh */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL hình ảnh
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? "Đang lưu..." : "Lưu món ăn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}