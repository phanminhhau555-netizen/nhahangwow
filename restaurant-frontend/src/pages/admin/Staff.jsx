import { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import API from "../../services/api";

const roles = [
  { id: 1, name: "admin", label: "Admin", desc: "Quản lý toàn bộ hệ thống" },
  { id: 2, name: "ban_hang", label: "Staff", desc: "Phục vụ và nhận đơn" },
  { id: 3, name: "bep", label: "Kitchen", desc: "Quản lý chế biến món ăn" },
];

const rolePermissions = {
  1: ["Xem toàn bộ báo cáo", "Quản lý nhân viên", "Quản lý thực đơn", "Cấu hình hệ thống"],
  2: ["Xem sơ đồ bàn & trạng thái", "Nhận order và thanh toán"],
  3: ["Xem order từ bếp", "Cập nhật trạng thái món", "Quản lý kho nguyên liệu"],
};

export default function Staff() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    full_name: "",
    username: "",
    password: "",
    role_id: 2,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await API.get("/api/auth/accounts");
      setAccounts(res.data);
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
      await API.post("/api/auth/register", form);
      setSuccess("Tạo tài khoản thành công!");
      setForm({ full_name: "", username: "", password: "", role_id: 2 });
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tạo tài khoản!");
    } finally {
      setSubmitting(false);
    }
  };

  const getRoleInfo = (role_id) => roles.find((r) => r.id === role_id);

  const getStatusColor = (is_active) =>
    is_active ? "text-green-500" : "text-gray-400";

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản lý Nhân sự</h1>
          <p className="text-gray-500 text-sm mt-1">
            Quản lý tài khoản và phân quyền nhân viên
          </p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Danh sách nhân viên */}
        <div className="flex-1 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Danh sách nhân viên</h2>
            <div className="flex gap-2 text-xs">
              <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full">
                {accounts.filter((a) => a.is_active).length} Đang hoạt động
              </span>
              <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                {accounts.filter((a) => !a.is_active).length} Vắng mặt
              </span>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <p className="text-center text-gray-400 py-8">Đang tải...</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-3">NHÂN VIÊN</th>
                  <th className="text-left pb-3">VAI TRÒ</th>
                  <th className="text-left pb-3">TRẠNG THÁI</th>
                  <th className="text-left pb-3">THAO TÁC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {accounts.map((acc) => (
                  <tr key={acc.id} className="text-sm">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-xs">
                          {acc.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{acc.full_name}</p>
                          <p className="text-xs text-gray-400">{acc.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        acc.role_id === 1 ? "bg-purple-100 text-purple-600" :
                        acc.role_id === 2 ? "bg-blue-100 text-blue-600" :
                        "bg-orange-100 text-orange-600"
                      }`}>
                        {getRoleInfo(acc.role_id)?.label || "N/A"}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`flex items-center gap-1 text-xs ${getStatusColor(acc.is_active)}`}>
                        <span className={`w-2 h-2 rounded-full ${acc.is_active ? "bg-green-500" : "bg-gray-300"}`}></span>
                        {acc.is_active ? "Hoạt động" : "Vắng mặt"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={async () => {
                          if (window.confirm("Xóa tài khoản này?")) {
                            await API.delete(`/api/auth/accounts/${acc.id}`);
                            fetchAccounts();
                          }
                        }}
                        className="text-red-400 hover:text-red-600 text-xs"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Form thêm nhân viên */}
        <div className="w-72 bg-white rounded-xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">👤</span>
            <h2 className="font-semibold text-gray-800">Thêm nhân viên mới</h2>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 rounded-lg px-3 py-2 mb-3 text-xs">
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-600 rounded-lg px-3 py-2 mb-3 text-xs">
              ✅ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Họ tên */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                placeholder="Nhập tên nhân viên"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            {/* Vai trò */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Vai trò
              </label>
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    onClick={() => setForm({ ...form, role_id: role.id })}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      form.role_id === role.id
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        form.role_id === role.id
                          ? "border-green-500"
                          : "border-gray-300"
                      }`}>
                        {form.role_id === role.id && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-800">{role.label}</p>
                    </div>
                    <p className="text-xs text-gray-400 ml-6">{role.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Phân quyền hiển thị */}
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">
                Phân quyền của {getRoleInfo(form.role_id)?.label}
              </p>
              <ul className="space-y-1">
                {rolePermissions[form.role_id]?.map((perm, i) => (
                  <li key={i} className="text-xs text-gray-500 flex items-center gap-1">
                    <span className="text-green-500">✓</span> {perm}
                  </li>
                ))}
              </ul>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg py-2.5 text-sm transition-colors disabled:opacity-50"
            >
              {submitting ? "Đang tạo..." : "Xác nhận thêm"}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}