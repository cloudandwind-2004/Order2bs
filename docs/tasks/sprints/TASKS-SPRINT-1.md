# 🗓️ Task Sprint 1 — Nền tảng & Auth

Sprint 1 tập trung dựng nền xác thực, design system và môi trường chạy, để hai sprint sau có thể giao tiếp qua API và UI đã chuẩn hóa.

## Mục tiêu sprint

- Hoàn thiện data nền và luồng đăng ký/đăng nhập.
- Chốt token giao diện và bộ khung triển khai DevOps.
- Sẵn sàng cho các module Order, Payment và Dashboard.

## Bảng task

| Mã task | Tên task | Module | Loại | Người nhận | Trạng thái | Phụ thuộc | Ưu tiên | Ước tính |
|---|---|---|---|---|---|---|---|---|
| TASK-001 | Khởi tạo schema dữ liệu và migration nền tảng | Auth | Backend | senior-backend-programmer | ⬜ TODO | — | Cao | 4h |
| TASK-002 | API Auth: đăng ký, đăng nhập, lấy hồ sơ | Auth | Backend | senior-backend-programmer | ⬜ TODO | TASK-001 | Cao | 6h |
| TASK-003 | Middleware JWT, role và trạng thái duyệt | Auth | Backend | senior-backend-programmer | ⬜ TODO | TASK-002 | Cao | 3h |
| TASK-004 | API Admin quản lý tài khoản | Auth | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 4h |
| TASK-005 | UI đăng nhập, đăng ký, chờ duyệt | Auth | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-002, TASK-006 | Cao | 6h |
| TASK-006 | Design system và token giao diện | Auth | Frontend | ui-ux-designer | ⬜ TODO | — | Cao | 5h |
| TASK-007 | Docker Compose và môi trường chạy chuẩn | Auth | DevOps | senior-devops | ⬜ TODO | — | Cao | 4h |

## Phụ thuộc chính

- `TASK-001` là tiền đề của toàn bộ backend auth và các service phía sau.
- `TASK-002` phải hoàn tất trước khi mở route guard và màn hình login.
- `TASK-006` là nền cho toàn bộ UI ở các sprint sau.

## Kết quả mong đợi

- Backend auth hoạt động ổn định.
- Frontend login/register/pending đúng design system.
- Docker Compose chạy được toàn bộ stack nền.

*Cập nhật lần cuối: 2026-04-23*