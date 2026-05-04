# 🗓️ Task Sprint 2 — Đặt món Realtime

Sprint 2 tập trung các tính năng vận hành đơn hàng: phiên ăn, menu, tạo đơn, quản lý trạng thái và realtime cho admin.

## Mục tiêu sprint

- User có thể xem phiên active, chọn menu và đặt món trước cutoff.
- Admin có thể quản lý session/menu/order board.
- Realtime hoạt động để giảm lệ thuộc vào refresh thủ công.

## Bảng task

| Mã task | Tên task | Module | Loại | Người nhận | Trạng thái | Phụ thuộc | Ưu tiên | Ước tính |
|---|---|---|---|---|---|---|---|---|
| TASK-008 | API Meal Session | Order | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 5h |
| TASK-009 | API Menu category và menu item | Order | Backend | senior-backend-programmer | ⬜ TODO | TASK-008 | Cao | 5h |
| TASK-010 | API Order: tạo, sửa, hủy, xem, đổi trạng thái | Order | Backend | senior-backend-programmer | ⬜ TODO | TASK-009 | Cao | 8h |
| TASK-011 | WebSocket hub và broadcast sự kiện order/payment | Order | Backend | senior-backend-programmer | ⬜ TODO | TASK-010 | Trung bình | 4h |
| TASK-012 | MFE user đặt món và danh sách đơn của tôi | Order | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-005, TASK-010 | Cao | 8h |
| TASK-013 | MFE admin quản lý session, menu và order board | Order | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-009, TASK-010 | Cao | 8h |
| TASK-014 | Client realtime và cơ chế fallback refresh | Order | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-011, TASK-013 | Trung bình | 4h |

## Phụ thuộc chính

- `TASK-008` và `TASK-009` mở đường cho mọi nghiệp vụ order.
- `TASK-010` là lõi business, tạo nền cho debt và payment.
- `TASK-011` và `TASK-014` giúp admin vận hành realtime ổn định.

## Kết quả mong đợi

- User đặt món đúng cutoff.
- Admin quản lý đơn trên board realtime.
- Menu và session được vận hành theo route riêng.

*Cập nhật lần cuối: 2026-04-23*