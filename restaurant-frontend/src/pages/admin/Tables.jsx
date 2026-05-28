import { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

const STATUS_CONFIG = {
  trong: { label: "Bàn trống", color: "bg-green-400", text: "text-green-600", border: "border-green-200" },
  dang_dung: { label: "Có khách", color: "bg-blue-400", text: "text-blue-600", border: "border-blue-200" },
  da_dat: { label: "Đã đặt", color: "bg-orange-400", text: "text-orange-600", border: "border-orange-200" },
};

export default function AdminTablesPage() {
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState(null);

  // Form thêm bàn
  const [showAddTable, setShowAddTable] = useState(false);
  const [tableForm, setTableForm] = useState({ name: "", area_id: "" });

  // Form thêm khu vực
  const [showAddArea, setShowAddArea] = useState(false);
  const [areaForm, setAreaForm] = useState({ name: "" });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tablesRes, areasRes] = await Promise.all([
        API.get("/api/tables"),
        API.get("/api/tables/areas"),
      ]);
      setTables(tablesRes.data);
      setAreas(areasRes.data);
      if (areasRes.data.length > 0 && !activeArea) {
        setActiveArea(areasRes.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTable = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await API.post("/api/tables", {
        name: tableForm.name,
        area_id: Number(tableForm.area_id),
      });
      setSuccess("Thêm bàn thành công!");
      setTableForm({ name: "", area_id: "" });
      setShowAddTable(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi thêm bàn!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddArea = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      API.post("/api/tables/areas", { name: areaForm.name });
      setSuccess("Thêm khu vực thành công!");
      setAreaForm({ name: "" });
      setShowAddArea(false);
    const areasRes = await API.get("/api/tables/areas");
    setAreas(areasRes.data);
    setActiveArea(res.data.id); 
    setTableForm((prev) => ({ ...prev, area_id: res.data.id }));
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi thêm khu vực!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm("Xóa bàn này?")) return;
    try {
      await API.delete(`/api/tables/${id}`);
      setSuccess("Xóa bàn thành công!");
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi xóa bàn!");
    }
  };

  const handleDeleteArea = async (id) => {
    if (!window.confirm("Xóa khu vực này? Tất cả bàn trong khu vực sẽ bị xóa!")) return;
    try {
      await API.delete(`/api/tables/areas/${id}`);
      setSuccess("Xóa khu vực thành công!");
      setActiveArea(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi xóa khu vực!");
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await API.patch(`/api/tables/${id}/status`, { status });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTables = activeArea
    ? tables.filter((t) => t.area_id === activeArea)
    : tables;

  const counts = {
    trong: tables.filter((t) => t.status === "trong").length,
    dang_dung: tables.filter((t) => t.status === "dang_dung").length,
    da_dat: tables.filter((t) => t.status === "da_dat").length,
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Sơ đồ bàn</h1>
          <p className="text-gray-500 text-sm mt-1">
            Tổng quan sơ đồ tầng và tình trạng sử dụng bàn
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddArea(true)}
            className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            + Thêm khu vực
          </button>
          <button
            onClick={() => setShowAddTable(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            + Thêm bàn
          </button>
        </div>
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
        {/* Main */}
        <div className="flex-1">
          {/* Status Legend */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            {Object.entries(STATUS_CONFIG).map(([key, val]) => (
              <span key={key} className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${val.color}`}></span>
                <span className="text-gray-600">{val.label} ({counts[key]})</span>
              </span>
            ))}
          </div>

          {/* Area Tabs */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {areas.map((area) => (
              <div key={area.id} className="flex items-center gap-1">
                <button
                  onClick={() => setActiveArea(area.id)}
                  className={`px-4 py-2 rounded-l-lg text-sm font-medium transition-colors ${
                    activeArea === area.id
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {area.name}
                </button>
                <button
                  onClick={() => handleDeleteArea(area.id)}
                  className={`px-2 py-2 rounded-r-lg text-sm transition-colors border-l-0 ${
                    activeArea === area.id
                      ? "bg-green-600 text-white border border-green-600"
                      : "bg-white border border-gray-200 text-red-400 hover:bg-red-50"
                  }`}
                >
                  ✕
                </button>
              </div>
            ))}
            <button
              onClick={() => setActiveArea(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeArea === null
                  ? "bg-green-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Tables Grid */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-3xl mb-2">🪑</p>
              <p>Đang tải...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-400">
              <p className="text-3xl mb-2">🪑</p>
              <p>Chưa có bàn nào trong khu vực này</p>
              <button
                onClick={() => setShowAddTable(true)}
                className="mt-3 text-green-500 text-sm hover:underline"
              >
                + Thêm bàn ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredTables.map((table) => {
                const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.trong;
                return (
                  <div
                    key={table.id}
                    className={`bg-white border-2 ${config.border} rounded-xl p-4 text-center`}
                  >
                    {/* Circle */}
                    <div className={`w-14 h-14 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold text-sm">{table.name}</span>
                    </div>

                    <p className={`text-sm font-medium ${config.text}`}>
                      {config.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {areas.find((a) => a.id === table.area_id)?.name}
                    </p>

                    {/* Status Dropdown */}
                    <select
                      value={table.status}
                      onChange={(e) => handleUpdateStatus(table.id, e.target.value)}
                      className="w-full mt-2 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                    >
                      <option value="trong">Bàn trống</option>
                      <option value="dang_dung">Có khách</option>
                      <option value="da_dat">Đã đặt</option>
                    </select>

                    {/* Xóa */}
                    <button
                      onClick={() => handleDeleteTable(table.id)}
                      className="w-full mt-2 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 py-1 rounded-lg transition-colors"
                    >
                      🗑 Xóa bàn
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel — Thống kê */}
        <div className="w-56 space-y-4">
          <div className="bg-green-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Tổng số bàn</p>
            <p className="text-3xl font-bold mt-1">{tables.length}</p>
            <p className="text-xs opacity-70 mt-1">
              {areas.length} khu vực
            </p>
          </div>

          {/* Thống kê từng khu vực */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="font-medium text-gray-800 text-sm mb-3">Theo khu vực</p>
            <div className="space-y-2">
              {areas.map((area) => {
                const areaTables = tables.filter((t) => t.area_id === area.id);
                return (
                  <div key={area.id} className="flex items-center justify-between">
                    <p className="text-xs text-gray-600">{area.name}</p>
                    <span className="text-xs font-medium text-gray-800">
                      {areaTables.length} bàn
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trạng thái */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <p className="font-medium text-gray-800 text-sm mb-3">Trạng thái</p>
            <div className="space-y-2">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${val.color}`}></span>
                    <p className="text-xs text-gray-600">{val.label}</p>
                  </div>
                  <span className="text-xs font-medium text-gray-800">
                    {counts[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thêm bàn */}
      {showAddTable && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Thêm bàn mới</h2>
              <button onClick={() => setShowAddTable(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên bàn</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bàn 01, T1, B5..."
                  value={tableForm.name}
                  onChange={(e) => setTableForm({ ...tableForm, name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                <select
                  value={tableForm.area_id}
                  onChange={(e) => setTableForm({ ...tableForm, area_id: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                >
                  <option value="">-- Chọn khu vực --</option>
                  {areas.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTable(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Đang thêm..." : "Thêm bàn"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm khu vực */}
      {showAddArea && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Thêm khu vực mới</h2>
              <button onClick={() => setShowAddArea(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddArea} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khu vực</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tầng 1, Sân thượng..."
                  value={areaForm.name}
                  onChange={(e) => setAreaForm({ name: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddArea(false)}
                  className="flex-1 border border-gray-200 text-gray-600 rounded-lg py-2.5 text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
                >
                  {submitting ? "Đang thêm..." : "Thêm khu vực"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}