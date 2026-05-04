# Screen Spec - ORDER

## 1. Mục tiêu màn hình
- Mục tiêu: cho user đã được duyệt đặt món nhanh, thấy ngay khoản nợ phát sinh và tự sửa/hủy đơn đúng điều kiện nghiệp vụ.
- Actor: User `approved`.
- Luồng chính:
  1. Chọn phiên ăn active.
  2. Chọn món và tạo đơn trước cutoff cố định toàn công ty.
  3. Xem danh sách đơn của tôi.
  4. Sửa/hủy đơn khi `status = pending` và chưa qua cutoff.

## 2. Cấu trúc layout

```mermaid
block-beta
  columns 1
  Header[Header: tiêu đề + trạng thái cutoff]
  SessionBar[Session selector + thông tin trợ cấp]
  MenuGrid[Danh sách category + menu item]
  Summary[Panel tóm tắt đơn + debt ước tính]
  MyOrders[Danh sách đơn của tôi + action sửa/hủy]
```

## 3. Danh sách component trên màn hình

| Component | Vị trí | Variant | Hành vi | Ghi chú |
|---|---|---|---|---|
| `SessionSelect` | SessionBar | select | Đổi phiên và tải menu tương ứng | Chỉ hiển thị session active |
| `SubsidyBadge` | SessionBar | info chip | Hiển thị trợ cấp công ty đang áp dụng | Giá trị snapshot khi tạo đơn |
| `MenuItemCard` | MenuGrid | interactive/disabled | Chọn món, hiển thị giá | Disable nếu `is_available = false` |
| `TextArea(note)` | Summary | default | Nhập ghi chú đơn hàng | Tối đa 500 ký tự |
| `Button(Đặt món)` | Summary | primary | Gửi `POST /api/orders` | Loading khi submit |
| `MyOrdersTable` | MyOrders | table | Hiển thị đơn theo thời gian mới nhất | Có filter trạng thái cơ bản |
| `Button(Sửa/Hủy)` | MyOrders row action | secondary/danger | Chỉ bật khi thỏa điều kiện nghiệp vụ | Check quyền trước khi mở modal |

## 4. Trạng thái và tương tác quan trọng
- Loading đầu trang: skeleton cho session/menu/table.
- Empty session: thông báo "Chưa có phiên ăn khả dụng" + CTA liên hệ admin.
- Quá cutoff: khóa nút đặt món và action sửa/hủy; hiển thị lý do rõ ràng.
- Đặt món thành công: toast success + cập nhật bảng "Đơn của tôi".
- Lỗi `422` quá hạn: giữ dữ liệu form, hiển thị cảnh báo cạnh nút submit.
- Lỗi `409` khi sửa/hủy: thông báo đơn không còn ở trạng thái `pending`.
- Đồng bộ realtime: khi nhận event `order_status_changed`, cập nhật row tương ứng.

## 5. Validation + thông báo lỗi chính

| Trường/Ngữ cảnh | Rule | Thông báo lỗi đề xuất |
|---|---|---|
| `session_id` | required | Vui lòng chọn phiên ăn |
| `menu_item_id` | required nếu `is_self_cook = false` | Vui lòng chọn món |
| `note` | max 500 ký tự | Ghi chú không vượt quá 500 ký tự |
| API `422` | Sau cutoff | Đã qua hạn chót đặt món của công ty |
| API `403` | User chưa approved/không phải chủ đơn | Bạn không có quyền thao tác đơn này |
| API `409` | Trạng thái đơn không hợp lệ để sửa/hủy | Đơn đã được xử lý, không thể sửa hoặc hủy |
| API `404` | Session/đơn không tồn tại | Dữ liệu đã thay đổi, vui lòng tải lại |

## 6. Mapping API/SRS liên quan

| Tác vụ UI | Endpoint/API | Tham chiếu SRS |
|---|---|---|
| Lấy session active | `GET /api/sessions/active` | `SRS-order.md` - ORDER-03, API 5.1 |
| Lấy menu theo session | `GET /api/sessions/:id/menu` | `SRS-order.md` - ORDER-03 |
| Tạo đơn | `POST /api/orders` | `SRS-order.md` - ORDER-04 |
| Sửa đơn của tôi | `PATCH /api/orders/:id` | `SRS-order.md` - ORDER-08 |
| Hủy đơn của tôi | `PATCH /api/orders/:id/cancel` | `SRS-order.md` - ORDER-08 |
| Danh sách đơn của tôi | `GET /api/orders/my` | `SRS-order.md` - API 5.1 |
| Đồng bộ realtime trạng thái đơn | WS event `order_status_changed` | `SRS-order.md` - ORDER-06, WebSocket 5.3 |

## 7. Acceptance checklist cho Frontend

- [ ] User chỉ thấy và thao tác được khi tài khoản `approved`.
- [ ] Chặn tạo/sửa/hủy khi quá cutoff với thông báo rõ ràng.
- [ ] Hiển thị đúng `debt_amount` trả về từ API sau khi đặt món.
- [ ] Action sửa/hủy chỉ xuất hiện với đơn `pending` của chính user.
- [ ] Xử lý đầy đủ lỗi `403/404/409/422/500`.
- [ ] Có empty state cho trường hợp chưa có session hoặc chưa có đơn.
- [ ] Realtime update hoạt động và có fallback refresh thủ công.

---

Cập nhật lần cuối: 2026-04-23
