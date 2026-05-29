 import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowClockwise, CalendarBlank, Users } from "@phosphor-icons/react";
import API from "../../services/api";

const STATUS_CONFIG = {
  trong: {
    label: "Bàn trống",
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    ring: "border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:bg-emerald-100/60",
    circle: "bg-emerald-500",
  },
  dang_dung: {
    label: "Có khách",
    dot: "bg-blue-500",
    text: "text-blue-700",
    ring: "border-blue-200 bg-blue-50 hover:border-blue-400 hover:bg-blue-100/60",
    circle: "bg-blue-500",
  },
  da_dat: {
    label: "Đã đặt",
    dot: "bg-orange-400",
    text: "text-orange-700",
    ring: "border-orange-200 bg-orange-50",
    circle: "bg-orange-400",
  },
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
    if (table.status === "da_dat") return;
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

  const occupancyRate = Math.round((counts.dang_dung / (tables.length || 1)) * 100);

  return (
    <div className="admin-soft-grid flex min-h-screen flex-col bg-[#eff1ea]">

      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-[#fbfbf8]/95 px-5 py-3 shadow-[0_4px_16px_rgba(15,23,42,0.04)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4">
          <div>
            <p className="admin-kicker">Nhân viên</p>
            <h1 className="text-[18px] font-black leading-tight text-slate-950">
              Sơ đồ bàn
            </h1>
          </div>
          <button onClick={fetchTables} className="admin-secondary-btn">
            <ArrowClockwise size={15} weight="bold" />
            Làm mới
          </button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-[1480px] flex-1 gap-4 p-4">

        {/* Main */}
        <div className="flex flex-1 flex-col gap-4">

          {/* Status Legend + Area Tabs */}
          <div className="admin-panel-pad flex items-center justify-between gap-4">
            {/* Legend */}
            <div className="flex items-center gap-4">
              {Object.entries(STATUS_CONFIG).map(([key, val]) => (
                <span key={key} className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${val.dot}`} />
                  <span className="text-xs font-semibold text-slate-500">
                    {val.label} ({counts[key]})
                  </span>
                </span>
              ))}
            </div>

            {/* Area Tabs */}
            {areas.length > 0 && (
              <div className="flex gap-2">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setActiveArea(area.id)}
                    className={`admin-tab ${activeArea === area.id ? "admin-tab-active" : ""}`}
                  >
                    {area.name}
                  </button>
                ))}
                <button
                  onClick={() => setActiveArea(null)}
                  className={`admin-tab ${activeArea === null ? "admin-tab-active" : ""}`}
                >
                  Tất cả
                </button>
              </div>
            )}
          </div>

          {/* Tables Grid */}
          {loading ? (
            <div className="admin-panel flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-semibold">Đang tải...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="admin-panel flex flex-col items-center justify-center py-20 text-slate-400">
              <p className="text-sm font-semibold">Chưa có bàn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3 xl:grid-cols-5">
              {filteredTables.map((table) => {
                const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.trong;
                const isDisabled = table.status === "da_dat";
                return (
                  <button
                    key={table.id}
                    onClick={() => handleSelectTable(table)}
                    disabled={isDisabled}
                    className={`admin-lift flex flex-col items-center rounded-[14px] border-2 p-4 text-center transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/30 ${config.ring} ${
                      isDisabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
                    }`}
                  >
                    {/* Circle */}
                    <div className={`mb-2.5 flex h-14 w-14 items-center justify-center rounded-full ${config.circle} shadow-md`}>
                      <span className="text-sm font-black text-white">{table.name}</span>
                    </div>

                    <p className={`text-xs font-black ${config.text}`}>
                      {config.label}
                    </p>

                    {table.status === "dang_dung" && table.total_amount > 0 && (
                      <p className="mt-1 text-[11px] font-bold text-slate-500">
                        {new Intl.NumberFormat("vi-VN").format(table.total_amount)}đ
                      </p>
                    )}
                    {table.status === "da_dat" && (
                      <p className="mt-1 text-[11px] font-bold text-orange-500">Đã đặt trước</p>
                    )}
                    {table.status === "trong" && (
                      <p className="mt-1 text-[11px] font-semibold text-slate-400">Nhấn để đặt món</p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="flex w-60 shrink-0 flex-col gap-4">

          {/* Tổng quan */}
          <div className="rounded-[14px] bg-emerald-700 p-4 text-white shadow-[0_18px_40px_rgba(4,120,87,0.18)]">
            <div className="flex items-center gap-2 mb-1">
              <Users size={16} weight="duotone" className="opacity-80" />
              <p className="text-xs font-black uppercase tracking-wide opacity-80">Trực tiếp</p>
              <span className="admin-live-dot ml-auto" />
            </div>
            <p className="text-3xl font-black mt-1">
              {counts.dang_dung}
            </p>
            <p className="text-xs font-bold opacity-70 mt-0.5">
              bàn đang có khách
            </p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-white transition-all"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
            <p className="mt-1 text-[11px] font-black opacity-70">
              Công suất {occupancyRate}%
            </p>
          </div>

          {/* Đặt bàn sắp tới */}
          <div className="admin-panel-pad flex-1">
            <div className="mb-3 flex items-center gap-2">
              <CalendarBlank size={15} weight="duotone" className="text-emerald-700" />
              <p className="admin-section-title">Đặt bàn sắp tới</p>
            </div>
            <ReservationList />
          </div>
        </div>
      </div>
    </div>
  );
}

function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/api/tables/reservations/all");
        setReservations(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  if (reservations.length === 0) {
    return (
      <p className="py-6 text-center text-xs font-semibold text-slate-400">
        Chưa có đặt bàn
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {reservations.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/80 p-2"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
            {r.num_guests}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-black text-slate-800">{r.customer_name}</p>
            <p className="text-[11px] font-semibold text-slate-400">
              {new Date(r.arrive_time).toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })} • {r.table_name}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}