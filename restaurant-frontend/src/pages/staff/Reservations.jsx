import { useEffect, useMemo, useState } from "react";
import API from "../../services/api";

const emptyForm = {
  table_id: "",
  customer_name: "",
  phone: "",
  arrive_time: "",
  num_guests: 2,
};

export default function StaffReservationsPage() {
  const [tables, setTables] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const availableTables = useMemo(
    () => tables.filter((table) => table.status === "trong"),
    [tables]
  );

  async function refreshData() {
    setLoading(true);
    setError("");

    try {
      const [tablesRes, reservationsRes] = await Promise.all([
        API.get("/api/tables"),
        API.get("/api/tables/reservations/all"),
      ]);

      setTables(tablesRes.data);
      setReservations(reservationsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Không tải được dữ liệu đặt bàn.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;

    Promise.all([API.get("/api/tables"), API.get("/api/tables/reservations/all")])
      .then(([tablesRes, reservationsRes]) => {
        if (cancelled) return;
        setTables(tablesRes.data);
        setReservations(reservationsRes.data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Không tải được dữ liệu đặt bàn.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await API.post("/api/tables/reservations", {
        table_id: Number(form.table_id),
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        arrive_time: normalizeDateTime(form.arrive_time),
        num_guests: Number(form.num_guests),
      });

      setSuccess("Đã tạo đặt bàn thành công.");
      setForm(emptyForm);
      await refreshData();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo đặt bàn.");
    } finally {
      setSubmitting(false);
    }
  };

  const upcomingReservations = reservations.slice(0, 12);

  return (
    <div className="admin-page space-y-4">
      <header className="admin-header items-start">
        <div>
          <p className="admin-kicker">Phục vụ</p>
          <h1 className="admin-title">Đặt bàn</h1>
          <p className="admin-subtitle">Tạo lịch đặt bàn trước cho khách và theo dõi danh sách sắp tới.</p>
        </div>
        <button type="button" onClick={refreshData} className="admin-tab">
          Làm mới
        </button>
      </header>

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700">
          {success}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[420px_minmax(0,1fr)]">
        <form onSubmit={handleSubmit} className="admin-panel-pad space-y-4">
          <div>
            <p className="admin-section-title">Thông tin đặt bàn</p>
            <p className="admin-muted mt-1">{availableTables.length} bàn trống có thể đặt.</p>
          </div>

          <label className="admin-label">
            Bàn
            <select
              value={form.table_id}
              onChange={(event) => setForm({ ...form, table_id: event.target.value })}
              className="admin-field mt-1"
              required
            >
              <option value="">Chọn bàn trống</option>
              {availableTables.map((table) => (
                <option key={table.id} value={table.id}>
                  {table.name} · {table.area_name || "Chưa có khu vực"}
                </option>
              ))}
            </select>
          </label>

          <label className="admin-label">
            Tên khách
            <input
              type="text"
              value={form.customer_name}
              onChange={(event) => setForm({ ...form, customer_name: event.target.value })}
              className="admin-field mt-1"
              placeholder="Tên người đặt"
              required
            />
          </label>

          <label className="admin-label">
            Số điện thoại
            <input
              type="tel"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              className="admin-field mt-1"
              placeholder="Số điện thoại liên hệ"
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="admin-label">
              Thời gian đến
              <input
                type="datetime-local"
                value={form.arrive_time}
                onChange={(event) => setForm({ ...form, arrive_time: event.target.value })}
                className="admin-field mt-1"
                required
              />
            </label>

            <label className="admin-label">
              Số khách
              <input
                type="number"
                min="1"
                value={form.num_guests}
                onChange={(event) => setForm({ ...form, num_guests: event.target.value })}
                className="admin-field mt-1"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting || availableTables.length === 0}
            className="admin-primary-btn w-full"
          >
            {submitting ? "Đang tạo..." : "Tạo đặt bàn"}
          </button>
        </form>

        <section className="admin-panel overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
            <div>
              <p className="admin-section-title">Lịch đặt bàn</p>
              <p className="admin-muted mt-0.5">Hiển thị các lượt đặt gần nhất.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-600">
              {reservations.length} lượt
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-bold text-slate-400">
              Đang tải đặt bàn...
            </div>
          ) : upcomingReservations.length === 0 ? (
            <div className="flex min-h-72 items-center justify-center text-sm font-bold text-slate-400">
              Chưa có lịch đặt bàn.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Khách</th>
                    <th>Bàn</th>
                    <th>Thời gian</th>
                    <th>Số khách</th>
                    <th>Liên hệ</th>
                  </tr>
                </thead>
                <tbody>
                  {upcomingReservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <td className="font-black text-slate-800">{reservation.customer_name}</td>
                      <td className="font-bold text-slate-600">{reservation.table_name}</td>
                      <td className="font-bold text-slate-600">{formatDateTime(reservation.arrive_time)}</td>
                      <td className="font-bold text-slate-600">{reservation.num_guests}</td>
                      <td className="font-bold text-slate-500">{reservation.phone}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function normalizeDateTime(value) {
  if (!value) return value;
  return value.length === 16 ? `${value.replace("T", " ")}:00` : value.replace("T", " ");
}

function formatDateTime(value) {
  if (!value) return "";
  return new Date(value).toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
