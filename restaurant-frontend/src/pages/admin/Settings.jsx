import { useMemo, useState } from "react";
import {
  Bank,
  CreditCard,
  ImageSquare,
  Money,
  Percent,
  Plus,
  QrCode,
  Receipt,
  UploadSimple,
} from "@phosphor-icons/react";
import Layout from "../../components/Layout";

const initialPaymentMethods = [
  {
    id: "cash",
    name: "Tiền mặt",
    description: "Thanh toán trực tiếp",
    icon: Money,
    active: true,
    selected: true,
  },
  {
    id: "card",
    name: "Thẻ tín dụng",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
    active: true,
    selected: true,
  },
  {
    id: "qr",
    name: "QR Pay",
    description: "Kích hoạt chuyển khoản",
    icon: QrCode,
    active: true,
    selected: false,
  },
];

export default function SettingsPage() {
  const [vatRate, setVatRate] = useState("10");
  const [autoTax, setAutoTax] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [invoiceTitle, setInvoiceTitle] = useState("RESTO DELUXE");
  const [contactInfo, setContactInfo] = useState(
    "123 Đường Ẩm Thực, Quận 1, TP. HCM - Hotline: 0123 456 789",
  );
  const [footerText, setFooterText] = useState("Cảm ơn quý khách và hẹn gặp lại!");
  const [logoName, setLogoName] = useState("");
  const [logoError, setLogoError] = useState("");
  const [saveState, setSaveState] = useState("idle");

  const enabledMethods = useMemo(
    () => paymentMethods.filter((method) => method.active).length,
    [paymentMethods],
  );
  const safeVatRate = Math.min(Math.max(Number(vatRate) || 0, 0), 100);
  const subtotal = 220000;
  const vatAmount = autoTax ? Math.round((subtotal * safeVatRate) / 100) : 0;
  const totalAmount = subtotal + vatAmount;

  const togglePaymentMethod = (methodId) => {
    setPaymentMethods((methods) =>
      methods.map((method) =>
        method.id === methodId ? { ...method, active: !method.active } : method,
      ),
    );
  };

  const selectPaymentMethod = (methodId) => {
    setPaymentMethods((methods) =>
      methods.map((method) =>
        method.id === methodId
          ? { ...method, selected: !method.selected, active: true }
          : method,
      ),
    );
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      setLogoName("");
      setLogoError("");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoName("");
      setLogoError("Ảnh vượt quá 2MB. Vui lòng chọn ảnh nhẹ hơn.");
      event.target.value = "";
      return;
    }

    setLogoName(file.name);
    setLogoError("");
  };

  const handleSave = () => {
    setSaveState("saving");
    window.setTimeout(() => {
      setSaveState("saved");
      window.setTimeout(() => setSaveState("idle"), 1800);
    }, 450);
  };

  const formatReceiptMoney = (amount) => new Intl.NumberFormat("vi-VN").format(amount);

  return (
    <Layout>
      <div className="admin-page">
        <header className="admin-header">
          <div>
            <p className="admin-kicker">Cài đặt</p>
            <h1 className="admin-title">Cấu hình hệ thống</h1>
            <p className="admin-subtitle">
              Quản lý thuế, phương thức thanh toán và mẫu hóa đơn của nhà hàng.
            </p>
          </div>
          <div className="admin-command-strip">
            Mẫu hóa đơn cập nhật trực tiếp
          </div>
        </header>

        <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
          <section className="admin-panel-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Percent size={23} weight="bold" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">Cấu hình Thuế</h2>
                <p className="text-xs font-medium text-gray-400">Áp dụng cho hóa đơn</p>
              </div>
            </div>

            <label className="block text-xs font-semibold text-gray-500">
              Thuế VAT hiện tại (%)
              <div className="mt-2 flex h-12 overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100 focus-within:ring-2 focus-within:ring-emerald-500">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={vatRate}
                  onChange={(event) => setVatRate(event.target.value)}
                  aria-label="Thuế VAT hiện tại"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-gray-800 outline-none"
                />
                <span className="flex items-center px-4 text-sm font-bold text-gray-400">
                  %
                </span>
              </div>
            </label>

            <button
              type="button"
              onClick={() => setAutoTax((enabled) => !enabled)}
              className="mt-5 flex w-full items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left transition-colors hover:bg-emerald-100/70 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              aria-pressed={autoTax}
            >
              <span>
                <span className="block text-sm font-bold text-emerald-700">
                  Tự động tính thuế
                </span>
                <span className="block text-xs font-medium text-emerald-600/80">
                  Áp dụng cho mọi đơn hàng
                </span>
              </span>
              <span
                className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                  autoTax ? "justify-end bg-emerald-600" : "justify-start bg-gray-300"
                }`}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
              </span>
            </button>
          </section>

          <section className="admin-panel-pad">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Bank size={23} weight="duotone" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-gray-900">
                    Phương thức thanh toán
                  </h2>
                  <p className="text-xs font-medium text-gray-400">
                    {enabledMethods} phương thức đang bật
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-emerald-600 transition-colors hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              >
                <Plus size={16} weight="bold" />
                Thêm phương thức
              </button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;

                return (
                  <article
                    key={method.id}
                    className={`rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      method.active
                        ? "border-emerald-100 bg-white shadow-sm"
                        : "border-gray-100 bg-gray-50 opacity-70"
                    } ${method.selected ? "ring-2 ring-emerald-100" : ""}`}
                  >
                    <div className="mb-5 flex items-start justify-between gap-3">
                      <span
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          method.selected
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-gray-100 text-gray-400"
                        }`}
                      >
                        <Icon size={18} weight="duotone" />
                      </span>
                      {method.id === "qr" ? (
                        <button
                          type="button"
                          onClick={() => togglePaymentMethod(method.id)}
                          className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                            method.active
                              ? "justify-end bg-emerald-600"
                              : "justify-start bg-gray-300"
                          }`}
                          aria-label="Bật tắt QR Pay"
                          aria-pressed={method.active}
                        >
                          <span className="h-5 w-5 rounded-full bg-white shadow-sm" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => selectPaymentMethod(method.id)}
                          className={`flex h-6 w-6 items-center justify-center rounded-md text-white transition-colors ${
                            method.selected ? "bg-emerald-600" : "bg-gray-200"
                          }`}
                          aria-label={`Chọn ${method.name}`}
                          aria-pressed={method.selected}
                        >
                          {method.selected && <span className="text-xs font-bold">✓</span>}
                        </button>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-gray-800">{method.name}</h3>
                    <p className="mt-1 text-xs font-medium text-gray-400">
                      {method.description}
                    </p>
                    <p
                      className={`mt-4 text-xs font-bold ${
                        method.active ? "text-emerald-600" : "text-gray-400"
                      }`}
                    >
                      {method.active ? "Đang bật" : "Đã tắt"}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        <div className="grid gap-4 xl:grid-cols-[390px_1fr]">
          <section className="rounded-[18px] border border-slate-200/80 bg-slate-50 p-4">
            <p className="mb-4 text-center text-[11px] font-black uppercase tracking-[0.18em] text-slate-300">
              Xem trước hóa đơn
            </p>
            <div className="mx-auto max-w-[280px] bg-white px-6 py-6 shadow-[0_22px_50px_rgba(15,23,42,0.14)]">
              <div className="mb-5 flex flex-col items-center text-center">
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-sm bg-stone-100 text-stone-600">
                  <Receipt size={22} weight="duotone" />
                </div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gray-800">
                  {invoiceTitle || "Tên nhà hàng"}
                </p>
                <p className="mt-2 text-[10px] font-medium text-gray-500">
                  {contactInfo || "Địa chỉ và số điện thoại"}
                </p>
              </div>

              <div className="space-y-3 border-y border-dashed border-gray-200 py-4">
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>Sườn Nướng BBQ x1</span>
                  <span>180,000</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-gray-700">
                  <span>Coca Cola x2</span>
                  <span>40,000</span>
                </div>
              </div>

              <div className="space-y-2 border-b border-dashed border-gray-200 py-4">
                <div className="flex justify-between text-xs font-bold text-gray-900">
                  <span>Tạm tính:</span>
                  <span>{formatReceiptMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-900">
                  <span>VAT ({autoTax ? safeVatRate : 0}%):</span>
                  <span>{formatReceiptMoney(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-gray-900">
                  <span>Tổng cộng:</span>
                  <span>{formatReceiptMoney(totalAmount)}</span>
                </div>
              </div>

              <p className="mt-5 text-center text-[10px] font-semibold italic text-slate-400">
                {footerText}
              </p>
            </div>
          </section>

          <section className="admin-panel-pad">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                <Receipt size={23} weight="duotone" />
              </span>
              <div>
                <h2 className="text-base font-bold text-gray-900">
                  Cài đặt mẫu hóa đơn
                </h2>
                <p className="text-xs font-medium text-gray-400">
                  Nội dung này sẽ hiện trên hóa đơn in ra.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold text-gray-700">
                  Logo nhà hàng
                </label>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-blue-200 bg-blue-50 text-blue-400">
                    <ImageSquare size={24} weight="duotone" />
                  </div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus-within:ring-2 focus-within:ring-emerald-500/30">
                    <UploadSimple size={17} weight="bold" />
                    Tải ảnh lên
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/gif"
                      className="sr-only"
                      onChange={handleLogoUpload}
                    />
                  </label>
                </div>
                <p
                  className={`mt-2 text-xs font-medium ${
                    logoError ? "text-red-500" : "text-gray-400"
                  }`}
                >
                  {logoError || logoName || "Định dạng: PNG, JPG (Tối đa 2MB)"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold text-gray-700">
                  Tiêu đề hóa đơn (Tên nhà hàng)
                  <input
                    type="text"
                    value={invoiceTitle}
                    onChange={(event) => setInvoiceTitle(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm font-semibold text-gray-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>

                <label className="block text-xs font-bold text-gray-700">
                  Lời chào chân trang
                  <input
                    type="text"
                    value={footerText}
                    onChange={(event) => setFooterText(event.target.value)}
                    className="mt-2 h-12 w-full rounded-xl border border-gray-100 bg-gray-50 px-4 text-sm font-semibold italic text-gray-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                  />
                </label>
              </div>

              <label className="block text-xs font-bold text-gray-700">
                Thông tin liên hệ (Địa chỉ/SĐT)
                <textarea
                  value={contactInfo}
                  onChange={(event) => setContactInfo(event.target.value)}
                  rows={3}
                  className="mt-2 w-full resize-none rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-emerald-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20"
                />
              </label>

              <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs font-medium text-gray-400">
                  {saveState === "saved"
                    ? "Đã lưu cấu hình hiển thị."
                    : "Thay đổi được phản ánh ngay trên mẫu xem trước."}
                </p>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState === "saving"}
                  className="min-h-11 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saveState === "saving"
                    ? "Đang lưu..."
                    : saveState === "saved"
                      ? "Đã lưu"
                      : "Lưu cấu hình"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}
