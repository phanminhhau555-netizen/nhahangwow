import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../services/api";

const STATUS_CONFIG = {
  trong: { label: "Bàn trống", color: "bg-green-400", text: "text-green-600", bg: "bg-green-50 border-green-200 hover:border-green-400" },
  dang_dung: { label: "Có khách", color: "bg-blue-400", text: "text-blue-600", bg: "bg-blue-50 border-blue-200 hover:border-blue-400" },
  da_dat: { label: "Đã đặt", color: "bg-orange-400", text: "text-orange-600", bg: "bg-orange-50 border-orange-200 hover:border-orange-400" },
};

export default function TablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState(null);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const [tablesRes, areasRes] = await Promise.all([
        API.get("/api/tables"),
        API.get("/api/tables/areas"),
      ]);
      setTables(tablesRes.data);
      setAreas(areasRes.data);
      if (areasRes.data.length > 0) setActiveArea(areasRes.data[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTable = (table) => {
    navigate(`/staff/tables/${table.id}/order`);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🍽️</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-800">Sơ đồ bàn</h1>
              <p className="text-xs text-gray-400">Chọn bàn để đặt món</p>
            </div>
          </div>
          <button
            onClick={fetchTables}
            className="text-sm text-gray-500 hover:text-gray-700 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
          >
            🔄 Làm mới
          </button>
        </div>
      </div>

      <div className="flex gap-6 p-6">
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
          {areas.length > 0 && (
            <div className="flex gap-2 mb-4">
              {areas.map((area) => (
                <button
                  key={area.id}
                  onClick={() => setActiveArea(area.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeArea === area.id
                      ? "bg-green-500 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {area.name}
                </button>
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
          )}

          {/* Tables Grid */}
          {loading ? (
            <div className="text-center py-20 text-gray-400">
              <p className="text-3xl mb-2">🪑</p>
              <p>Đang tải...</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {filteredTables.map((table) => {
                const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.trong;
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    disabled={table.status === "da_dat"}
                    className={`border-2 rounded-xl p-4 text-center transition-all ${config.bg} ${
                      table.status === "da_dat" ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
                    }`}
                  >
                    {/* Circle */}
                    <div className={`w-14 h-14 ${config.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <span className="text-white font-bold text-sm">{table.name}</span>
                    </div>
                    <p className={`text-sm font-medium ${config.text}`}>
                      {config.label}
                    </p>
                    {table.status === "dang_dung" && table.total_amount > 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Intl.NumberFormat("vi-VN").format(table.total_amount)}đ
                      </p>
                    )}
                    {table.status === "da_dat" && (
                      <p className="text-xs text-orange-500 mt-1">Đã đặt trước</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="w-64 space-y-4">
          {/* Tổng quan */}
          <div className="bg-green-500 rounded-xl p-4 text-white">
            <p className="text-sm opacity-80">Tổng số khách</p>
            <p className="text-3xl font-bold mt-1">
              {tables.filter((t) => t.status === "dang_dung").length * 2}
            </p>
            <p className="text-xs opacity-70 mt-1">
              Công suất: {Math.round((counts.dang_dung / (tables.length || 1)) * 100)}%
            </p>
          </div>

          {/* Đặt bàn sắp tới */}
          <div className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-2 mb-3">
              <span>📅</span>
              <p className="font-medium text-gray-800 text-sm">Đặt bàn sắp tới</p>
            </div>
            <ReservationList />
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiện danh sách đặt bàn
function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get("/api/tables/reservations/all");
        setReservations(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    fetch();
  }, []);

  if (reservations.length === 0) {
    return <p className="text-xs text-gray-400 text-center py-4">Chưa có đặt bàn</p>;
  }

  return (
    <div className="space-y-2">
      {reservations.map((r) => (
        <div key={r.id} className="flex items-center gap-2">
          <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
            {r.num_guests}
          </div>
          <div>
            <p className="text-xs font-medium text-gray-800">{r.customer_name}</p>
            <p className="text-xs text-gray-400">
              {new Date(r.arrive_time).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} • {r.table_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}