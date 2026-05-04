# Screen Spec - ADMIN

## 1. Mục tiêu màn hình
- Mục tiêu: cung cấp một shell quản trị vận hành MVP theo route rõ ràng cho 4 nhu cầu chính: duyệt tài khoản, quản lý đơn, xác nhận thanh toán và xem dashboard.
- Actor: Admin.
- Luồng chính:
  1. Duyệt/từ chối tài khoản pending trong SLA 24h.
  2. Quản lý session/menu và cập nhật trạng thái đơn theo ma trận hợp lệ.
  3. Đối soát proof thanh toán QR và confirm payment theo FIFO debt.
  4. Theo dõi dashboard tháng với bộ KPI hiện tại.

## 2. Cấu trúc layout

```mermaid
block-beta
  columns 1
  Header[Header: title + quick actions]
  Shell[Sidebar route: Dashboard | Users | Sessions/Menu | Orders | Payments]
  Content[Content panel theo route đang chọn]
```

## 3. Danh sách component trên màn hình

| Component | Vị trí | Variant | Hành vi | Ghi chú |
|---|---|---|---|---|
| `SidebarNav` | Shell | navigation | Điều hướng route admin | Đồng nhất với cấu trúc frontend hiện có |
| `KpiCard` | Content (Dashboard) | surface | Hiển thị số liệu tổng quan | Không thêm KPI ngoài SRS |
| `StatusChip` | Bảng users/orders/payments | semantic | Mã màu trạng thái vận hành | Đồng nhất toàn màn hình admin |
| `UserApprovalTable` | Route Users | table | Approve/Reject/Delete user | Reject mở modal nhập lý do |
| `RejectModal` | Route Users | modal-sm | Nhập `reject_reason` rồi submit | Bắt buộc 5-500 ký tự |
| `SessionMenuPanel` | Route Sessions/Menu | card + form | CRUD session/category/item | Theo quyền admin |
| `OrderBoardTable` | Route Orders | table realtime | Cập nhật status đơn | Chặn chuyển trạng thái sai ma trận |
| `PaymentReviewTable` | Route Payments | table | Xem payment pending và confirm | Có preview proof |
| `DashboardChart` | Route Dashboard | chart + year filter | Vẽ 12 tháng, tháng rỗng = 0 | Timezone `Asia/Ho_Chi_Minh` |

## 4. Trạng thái và tương tác quan trọng
- Loading module: mỗi route có skeleton riêng, không khóa toàn trang.
- User pending SLA: hiển thị badge cảnh báo khi gần mốc 24h.
- Reject account: bắt buộc nhập lý do, confirm trước khi gửi.
- Cập nhật status order: chỉ cho phép chuyển theo ma trận đã chốt; sai trả `409`.
- Confirm payment: chỉ khả dụng với payment `pending`; xác nhận xong cập nhật debt theo FIFO.
- Dashboard theo năm: đổi năm chỉ reload chart, giữ nguyên KPI summary.
- Error module: hiển thị panel lỗi cục bộ + nút thử lại.

## 5. Validation + thông báo lỗi chính

| Trường/Ngữ cảnh | Rule | Thông báo lỗi đề xuất |
|---|---|---|
| `reject_reason` | required, min 5, max 500 | Vui lòng nhập lý do từ chối hợp lệ |
| `order status transition` | phải đúng ma trận trạng thái | Không thể chuyển trạng thái theo yêu cầu |
| `payment confirm` | chỉ payment `pending` | Thanh toán đã được xác nhận trước đó |
| `year filter` | số 4 chữ số hợp lệ | Năm thống kê không hợp lệ |
| `QR settings` | đủ bank/account/account name/URL | Vui lòng nhập đủ thông tin QR |
| API `403` | không đủ quyền admin | Bạn không có quyền truy cập chức năng này |

## 6. Mapping API/SRS liên quan

| Tác vụ UI | Endpoint/API | Tham chiếu SRS |
|---|---|---|
| Danh sách user + filter status | `GET /api/admin/users?status=` | `SRS-auth.md` - AUTH-06, API 5.2 |
| Approve user | `PATCH /api/admin/users/:id/approve` | `SRS-auth.md` - AUTH-06 |
| Reject user | `PATCH /api/admin/users/:id/reject` | `SRS-auth.md` - AUTH-06 |
| CRUD session/menu | `GET/POST/PUT/DELETE /api/admin/sessions...` và category/item API | `SRS-order.md` - ORDER-01, ORDER-02, API 5.2 |
| Order board + update status | `GET /api/admin/orders`, `PATCH /api/admin/orders/:id/status` | `SRS-order.md` - ORDER-05, API 5.2 |
| Debt/payment review | `GET /api/admin/debts`, `POST /api/admin/payments/:id/confirm` | `SRS-payment.md` - PAY-03, PAY-06 |
| QR settings | `POST/GET /api/admin/settings/bank-qr` | `SRS-payment.md` - PAY-04 |
| Dashboard summary/monthly | `GET /api/admin/dashboard/summary`, `GET /api/admin/dashboard/monthly?year=` | `SRS-dashboard.md` - DASH-01, DASH-02 |

## 7. Acceptance checklist cho Frontend

- [ ] Chỉ role admin truy cập được màn hình và API tương ứng.
- [ ] Luồng duyệt/từ chối tài khoản có modal xác nhận và validate đủ.
- [ ] Luồng đổi trạng thái đơn chặn đúng các chuyển trạng thái không hợp lệ (`409`).
- [ ] Luồng confirm payment chỉ áp dụng cho payment pending và cập nhật UI ngay sau khi thành công.
- [ ] Dashboard hiển thị đủ 12 tháng, tháng không dữ liệu vẫn là 0.
- [ ] Các tab có loading/empty/error state riêng, không gây mất ngữ cảnh thao tác.
- [ ] Toàn bộ bảng quản trị hỗ trợ thao tác bàn phím cơ bản và focus rõ ràng.
- [ ] Luồng admin được chia theo route rõ ràng, phù hợp cấu trúc frontend hiện có.

---

Cập nhật lần cuối: 2026-04-23
