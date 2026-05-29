# Đề Xuất Tích Hợp Tính Năng Thời Gian Thực (Real-time)

Dựa trên việc kiểm tra mã nguồn backend hiện tại (Node.js + Express + MySQL), tôi nhận thấy hệ thống hiện đang hoàn toàn sử dụng mô hình REST API truyền thống (Request-Response). Điều này có nghĩa là các thay đổi dữ liệu (như có order mới, món ăn nấu xong, hay trạng thái bàn thay đổi) không được đẩy (push) tự động đến các client (bếp, nhân viên phục vụ, thu ngân) mà người dùng phải tự tải lại trang (refresh) hoặc hệ thống frontend phải thực hiện polling (gọi API liên tục để kiểm tra).

Để giải quyết vấn đề này, tôi đề xuất tích hợp **Socket.IO** vào hệ thống.

## User Review Required

> [!IMPORTANT]
> Vui lòng xác nhận xem bạn có đồng ý sử dụng thư viện **Socket.IO** (chuẩn phổ biến nhất cho Node.js và React) cho việc giao tiếp thời gian thực hay không, hay bạn muốn dùng một công nghệ khác như Server-Sent Events (SSE) hoặc Pusher?

> [!WARNING]
> Việc tích hợp Socket.IO sẽ yêu cầu phải chỉnh sửa đồng loạt ở cả Frontend và Backend, đặc biệt là phải cấu hình lại `app.js` của backend để chia sẻ server HTTP giữa Express và Socket.IO.

## Đánh giá Hiện Trạng

- **Backend**: Đang sử dụng Express. Các file controller (`orderController.js`, `tableController.js`) xử lý DB bằng MySQL query và trả về trực tiếp response JSON. Không có logic emit sự kiện ra bên ngoài.
- **Frontend**: Dùng React + Vite. Rất dễ dàng để tích hợp `socket.io-client` kết hợp với React Hooks (`useEffect`) để nhận tín hiệu.

## Các Sự Kiện Cần Thời Gian Thực (Real-time Events)

Hệ thống nhà hàng cần các luồng sự kiện chính sau:

1. **Gửi Order xuống bếp (`NEW_KITCHEN_ORDER`)**
   - *Khi nào*: Nhân viên phục vụ thêm món và bấm "Gửi xuống bếp" (`sendToKitchen`).
   - *Hành động*: Server nhận lệnh, lưu DB và phát sự kiện `NEW_KITCHEN_ORDER` đến tất cả các client đang ở màn hình Bếp. Màn hình Bếp tự động hiện món mới mà không cần F5.

2. **Cập nhật trạng thái món ăn (`ITEM_STATUS_UPDATED`)**
   - *Khi nào*: Đầu bếp bấm "Đang nấu", "Xong", hoặc "Hết món" (`updateItemStatus`).
   - *Hành động*: Server cập nhật DB và phát sự kiện `ITEM_STATUS_UPDATED` để thông báo cho nhân viên phục vụ biết trạng thái món ăn đã thay đổi.

3. **Cập nhật trạng thái Bàn (`TABLE_STATUS_UPDATED`)**
   - *Khi nào*: Bàn chuyển từ "Trống" sang "Có khách", hoặc "Đã đặt" (`updateStatus`, `createReservation`).
   - *Hành động*: Server cập nhật DB và báo cho tất cả thiết bị của thu ngân và phục vụ để làm mới lại biểu đồ sơ đồ bàn (Table Map).

4. **Thông báo Thanh toán (`PAYMENT_COMPLETED`)**
   - *Khi nào*: Khách hàng thanh toán xong.
   - *Hành động*: Cập nhật trạng thái đơn hàng và gửi sự kiện để dọn bàn, giải phóng trạng thái bàn về "Trống".

## Kế Hoạch Triển Khai (Proposed Changes)

### 1. Backend (`restaurant-backend`)

- Cài đặt thêm thư viện: `npm install socket.io`
- Cấu hình lại Server:
#### [MODIFY] [app.js](file:///c:/Users/hoang/Documents/GitHub/nhahangwow/restaurant-backend/src/app.js)
  - Khởi tạo HTTP server thay vì dùng trực tiếp `app.listen`.
  - Khởi tạo instance `Socket.IO` và đính kèm (attach) vào HTTP server.
  - Export đối tượng `io` hoặc truyền nó qua middleware để các controller có thể sử dụng (ví dụ: `req.io = io`).

#### [MODIFY] [orderController.js](file:///c:/Users/hoang/Documents/GitHub/nhahangwow/restaurant-backend/src/controllers/orderController.js)
  - Trong `sendToKitchen`: Thêm lệnh `req.io.emit('NEW_KITCHEN_ORDER', { order_id })`
  - Trong `updateItemStatus`: Thêm lệnh `req.io.emit('ITEM_STATUS_UPDATED', { itemId, status })`

#### [MODIFY] [tableController.js](file:///c:/Users/hoang/Documents/GitHub/nhahangwow/restaurant-backend/src/controllers/tableController.js)
  - Trong `updateStatus`, `createTable`, `deleteTable`: Thêm lệnh emit các sự kiện `TABLE_STATUS_UPDATED` hoặc `TABLE_LIST_UPDATED`.

### 2. Frontend (`restaurant-frontend`)

- Cài đặt thêm thư viện: `npm install socket.io-client`
- Tạo một file service mới cho Socket:
#### [NEW] [socketService.js](file:///c:/Users/hoang/Documents/GitHub/nhahangwow/restaurant-frontend/src/services/socketService.js)
  - Thiết lập kết nối tới URL của backend.
  - Cung cấp các hàm wrapper để lắng nghe (on) hoặc hủy lắng nghe (off) sự kiện.

- **Cập nhật các Hook/Component:**
  - Cập nhật Màn hình Bếp: Sử dụng `useEffect` lắng nghe `NEW_KITCHEN_ORDER` để tự động gọi lại API `getKitchenOrders` hoặc nối thêm món mới vào state hiện tại.
  - Cập nhật Màn hình Phục vụ (Sơ đồ bàn): Lắng nghe `TABLE_STATUS_UPDATED` để tự động đổi màu bàn.
  - Cập nhật Màn hình Order của khách: Lắng nghe `ITEM_STATUS_UPDATED` để thay đổi trạng thái "Chờ" -> "Đang nấu" -> "Xong".

## Open Questions

1. Bạn có muốn phân tách "Room" cho Socket.IO không? Ví dụ: Thông báo của bếp chỉ gửi đến các client đã đăng nhập là Bếp, thay vì broadcast (gửi tất cả) cho mọi người.
2. Bạn có muốn tiến hành triển khai cấu trúc này luôn không? Nếu bạn đồng ý, tôi sẽ bắt đầu cài đặt thư viện và thiết lập `Socket.IO` trên backend trước.

## Verification Plan

- Khởi động Backend và Frontend.
- Mở 2 trình duyệt đóng vai trò: 1 là Phục vụ, 1 là Bếp.
- Phục vụ bấm gọi món -> Bếp ngay lập tức nhận được thông báo/thấy món mới nổi lên mà không cần làm mới trang.
- Bếp bấm "Đã xong" -> Phục vụ thấy trạng thái thay đổi ngay lập tức.
