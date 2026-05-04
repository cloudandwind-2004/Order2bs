# Flow Design - ORDER-FLOW

## 1. Tổng quan luồng
- Tên luồng: Đặt món và vận hành đơn hàng.
- Actor chính: User `approved`, Admin.
- Mục tiêu:
  - User tạo đơn trước cutoff, có thể tự sửa/hủy đơn khi còn `pending`.
  - Admin theo dõi đơn realtime và cập nhật trạng thái đúng ma trận.
- Điểm bắt đầu: User đã đăng nhập thành công.
- Điểm kết thúc: Đơn ở trạng thái cuối (`delivered` hoặc `cancelled`).

## 2. Flow diagram (Mermaid fallback)

Ghi chú: Hiện chưa tích hợp MCP Figma/MCP Draw.io trong workspace, sử dụng Mermaid làm fallback theo quality gate.

```mermaid
flowchart LR
    A[LOGIN: User đăng nhập] --> B{Tài khoản approved?}
    B -->|Không| C[Màn hình Pending Approval]
    B -->|Có| D[ORDER: Chọn session active]
    D --> E[Chọn món + nhập ghi chú]
    E --> F{Trước cutoff?}
    F -->|Không| G[Thông báo quá hạn đặt món]
    F -->|Có| H[POST /api/orders]
    H --> I[Đơn pending + debt_amount]
    I --> J{User muốn sửa/hủy?}
    J -->|Có| K{status=pending và chưa qua cutoff?}
    K -->|Không| L[Thông báo không thể sửa/hủy]
    K -->|Có| M[PATCH /api/orders/:id hoặc /cancel]
    J -->|Không| N[Admin nhận new_order qua WS]
    M --> N
    N --> O[ADMIN cập nhật trạng thái đơn]
    O --> P{Chuyển trạng thái hợp lệ?}
    P -->|Không| Q[409 + hiển thị lỗi]
    P -->|Có| R[WS order_status_changed]
    R --> S{Trạng thái cuối?}
    S -->|delivered/cancelled| T[Kết thúc luồng]
    S -->|Chưa| O
```

## 3. Danh sách màn hình trong luồng

| Thứ tự | Màn hình | Mục đích | Screen spec |
|---|---|---|---|
| 1 | Login | Xác thực user/admin và route theo role/status | [LOGIN](../screens/LOGIN.md) |
| 2 | Order | User chọn món, tạo đơn, sửa/hủy đơn của mình | [ORDER](../screens/ORDER.md) |
| 3 | Admin | Admin theo dõi và cập nhật trạng thái đơn realtime | [ADMIN](../screens/ADMIN.md) |

## 4. Thiết kế tương tác (Interactions)
- Transition đăng nhập -> order/admin: chuyển trang tức thời sau khi nhận token hợp lệ.
- Transition đặt món thành công: toast success + row mới xuất hiện ở danh sách đơn.
- Tương tác sửa/hủy: mở modal xác nhận ngắn, chỉ bật action nếu thỏa điều kiện nghiệp vụ.
- Realtime admin: khi có `new_order` hoặc `order_status_changed`, highlight row thay đổi trong 2 giây.
- Animation gợi ý:
  - Toast slide-up 160ms.
  - Modal fade + scale nhẹ 180ms.
  - Row update pulse background 1200ms, giảm dần.

---

Cập nhật lần cuối: 2026-04-23
