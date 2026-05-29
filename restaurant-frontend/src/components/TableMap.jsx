const STATUS_CONFIG = {
  trong: {
    label: "Bàn trống",
    color: "bg-green-400",
    text: "text-green-700",
    border: "border-green-200",
    surface: "bg-green-50",
  },
  dang_dung: {
    label: "Có khách",
    color: "bg-blue-400",
    text: "text-blue-700",
    border: "border-blue-200",
    surface: "bg-blue-50",
  },
  da_dat: {
    label: "Đã đặt",
    color: "bg-orange-400",
    text: "text-orange-700",
    border: "border-orange-200",
    surface: "bg-orange-50",
  },
};

export { STATUS_CONFIG };

export default function TableMap({
  title = "Sơ đồ bàn",
  subtitle,
  tables = [],
  areas = [],
  loading = false,
  activeArea,
  onAreaChange,
  editable = false,
  onAddArea,
  onAddTable,
  onDeleteArea,
  onDeleteTable,
  onUpdateStatus,
  onSelectTable,
  emptyActionLabel,
  aside,
  totalLabel = "Tổng số bàn",
}) {
  const filteredTables = activeArea
    ? tables.filter((table) => table.area_id === activeArea)
    : tables;

  const counts = {
    trong: tables.filter((table) => table.status === "trong").length,
    dang_dung: tables.filter((table) => table.status === "dang_dung").length,
    da_dat: tables.filter((table) => table.status === "da_dat").length,
  };

  return (
    <div className="admin-page">
      <header className="admin-header items-start">
        <div>
          <p className="admin-kicker">{editable ? "Quản trị" : "Phục vụ"}</p>
          <h1 className="admin-title">{title}</h1>
          {subtitle ? <p className="admin-subtitle">{subtitle}</p> : null}
        </div>

        {editable ? (
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={onAddArea} className="admin-tab">
              + Khu vực
            </button>
            <button type="button" onClick={onAddTable} className="admin-primary-btn">
              + Bàn
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => onAreaChange?.(activeArea)} className="admin-tab">
            Làm mới
          </button>
        )}
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <section className="min-w-0 space-y-4">
          <div className="admin-panel-pad flex flex-wrap items-center gap-3">
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <span key={key} className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <span className={`h-2.5 w-2.5 rounded-full ${config.color}`} />
                {config.label} ({counts[key]})
              </span>
            ))}
          </div>

          {areas.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {areas.map((area) => {
                const isActive = activeArea === area.id;

                return (
                  <div key={area.id} className="inline-flex overflow-hidden rounded-xl border border-slate-200 bg-white">
                    <button
                      type="button"
                      onClick={() => onAreaChange?.(area.id)}
                      className={`min-h-10 px-4 text-sm font-black transition-colors ${
                        isActive ? "bg-emerald-700 text-white" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {area.name}
                    </button>
                    {editable ? (
                      <button
                        type="button"
                        onClick={() => onDeleteArea?.(area.id)}
                        className={`min-h-10 border-l px-3 text-sm font-black transition-colors ${
                          isActive
                            ? "border-emerald-600 bg-emerald-800 text-white"
                            : "border-slate-200 text-red-400 hover:bg-red-50 hover:text-red-600"
                        }`}
                        aria-label={`Xóa ${area.name}`}
                      >
                        x
                      </button>
                    ) : null}
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => onAreaChange?.(null)}
                className={`min-h-10 rounded-xl px-4 text-sm font-black transition-colors ${
                  activeArea === null
                    ? "bg-emerald-700 text-white"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                Tất cả
              </button>
            </div>
          ) : null}

          {loading ? (
            <div className="admin-panel-pad flex min-h-72 items-center justify-center text-sm font-bold text-slate-400">
              Đang tải sơ đồ bàn...
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="admin-panel-pad flex min-h-72 flex-col items-center justify-center text-center">
              <p className="text-sm font-bold text-slate-400">Chưa có bàn nào trong khu vực này</p>
              {editable && onAddTable ? (
                <button type="button" onClick={onAddTable} className="mt-3 admin-primary-btn">
                  {emptyActionLabel || "+ Thêm bàn"}
                </button>
              ) : null}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
              {filteredTables.map((table) => {
                const config = STATUS_CONFIG[table.status] || STATUS_CONFIG.trong;
                const disabled = !editable && table.status === "da_dat";
                const TableShell = onSelectTable && !editable ? "button" : "article";

                return (
                  <TableShell
                    key={table.id}
                    type={TableShell === "button" ? "button" : undefined}
                    onClick={TableShell === "button" ? () => onSelectTable(table) : undefined}
                    disabled={TableShell === "button" ? disabled : undefined}
                    className={`admin-lift min-h-48 rounded-xl border-2 p-4 text-center ${config.border} ${config.surface} ${
                      TableShell === "button"
                        ? disabled
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                        : "bg-white"
                    }`}
                  >
                    <div className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full ${config.color}`}>
                      <span className="px-1 text-center text-sm font-black leading-tight text-white">{table.name}</span>
                    </div>
                    <p className={`text-sm font-black ${config.text}`}>{config.label}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {areas.find((area) => area.id === table.area_id)?.name || "Chưa có khu vực"}
                    </p>

                    {!editable && table.status === "dang_dung" && table.total_amount > 0 ? (
                      <p className="mt-2 text-xs font-black text-slate-600">
                        {new Intl.NumberFormat("vi-VN").format(table.total_amount)}đ
                      </p>
                    ) : null}

                    {!editable && table.status === "da_dat" ? (
                      <p className="mt-2 text-xs font-bold text-orange-600">Đã đặt trước</p>
                    ) : null}

                    {editable ? (
                      <div className="mt-3 space-y-2">
                        <select
                          value={table.status}
                          onChange={(event) => onUpdateStatus?.(table.id, event.target.value)}
                          className="admin-field min-h-9 text-xs"
                        >
                          <option value="trong">Bàn trống</option>
                          <option value="dang_dung">Có khách</option>
                          <option value="da_dat">Đã đặt</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => onDeleteTable?.(table.id)}
                          className="min-h-9 w-full rounded-lg text-xs font-black text-red-500 transition-colors hover:bg-red-50"
                        >
                          Xóa bàn
                        </button>
                      </div>
                    ) : null}
                  </TableShell>
                );
              })}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl bg-emerald-700 p-4 text-white shadow-[0_18px_42px_rgba(4,120,87,0.18)]">
            <p className="text-sm font-bold text-emerald-50/80">{totalLabel}</p>
            <p className="mt-1 text-3xl font-black">{tables.length}</p>
            <p className="mt-1 text-xs font-bold text-emerald-50/70">{areas.length} khu vực</p>
          </div>

          <div className="admin-panel-pad">
            <p className="admin-section-title mb-3">Theo khu vực</p>
            <div className="space-y-2">
              {areas.map((area) => {
                const areaTables = tables.filter((table) => table.area_id === area.id);

                return (
                  <div key={area.id} className="flex items-center justify-between gap-3">
                    <p className="truncate text-xs font-bold text-slate-600">{area.name}</p>
                    <span className="shrink-0 text-xs font-black text-slate-900">{areaTables.length} bàn</span>
                  </div>
                );
              })}
            </div>
          </div>

          {aside}
        </aside>
      </div>
    </div>
  );
}
