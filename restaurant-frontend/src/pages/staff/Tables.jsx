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
        title="Order món"
        subtitle="Chọn bàn để mở trang gọi món riêng."
        tables={tables}
        areas={areas}
        loading={loading}
        activeArea={activeArea}
        onAreaChange={handleAreaChange}
        onSelectTable={(table) => navigate(`/staff/orders/${table.id}`)}
        totalLabel="Tổng số bàn"
      />
    </div>
  );
}
