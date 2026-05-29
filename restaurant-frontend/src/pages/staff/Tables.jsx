import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import TableMap from "../../components/TableMap";
import API from "../../services/api";

export default function StaffTablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeArea, setActiveArea] = useState(null);
  const [error, setError] = useState("");

  async function fetchTables() {
    setLoading(true);
    setError("");

    try {
      const [tablesRes, areasRes] = await Promise.all([
        API.get("/api/tables"),
        API.get("/api/tables/areas"),
      ]);

      setTables(tablesRes.data);
      setAreas(areasRes.data);
      setActiveArea((current) => current ?? areasRes.data[0]?.id ?? null);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được sơ đồ bàn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([API.get("/api/tables"), API.get("/api/tables/areas")])
      .then(([tablesRes, areasRes]) => {
        if (cancelled) return;
        setTables(tablesRes.data);
        setAreas(areasRes.data);
        setActiveArea((current) => current ?? areasRes.data[0]?.id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Không tải được sơ đồ bàn.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleAreaChange = (areaId) => {
    if (areaId === activeArea) {
      fetchTables();
      return;
    }
    setActiveArea(areaId);
  };

  return (
    <div className="space-y-4">
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <TableMap
        title="Sơ đồ bàn"
        subtitle="Chọn bàn để mở trang gọi món riêng."
        tables={tables}
        areas={areas}
        loading={loading}
        activeArea={activeArea}
        onAreaChange={handleAreaChange}
        onSelectTable={(table) => navigate(`/staff/orders/${table.id}`)}
        totalLabel="Tổng số bàn"
        aside={<ReservationList />}
      />
    </div>
  );
}

function ReservationList() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await API.get("/api/tables/reservations/all");
        setReservations(res.data.slice(0, 5));
      } catch (err) {
        console.error(err);
      }
    };

    fetchReservations();
  }, []);

  return (
    <div className="admin-panel-pad">
      <p className="admin-section-title mb-3">Đặt bàn sắp tới</p>
      {reservations.length === 0 ? (
        <p className="py-4 text-center text-xs font-bold text-slate-400">Chưa có đặt bàn</p>
      ) : (
        <div className="space-y-3">
          {reservations.map((reservation) => (
            <div key={reservation.id} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">
                {reservation.num_guests}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-slate-800">{reservation.customer_name}</p>
                <p className="text-xs font-semibold text-slate-400">
                  {new Date(reservation.arrive_time).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}{" "}
                  · {reservation.table_name}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
