# 📋 Bảng Theo Dõi Task — Lunch Order System

> Task breakdown đã được bóc tách theo module và sprint, giữ đúng tổng 23 task hiện có.

## 1. Trạng thái

| Ký hiệu | Ý nghĩa |
|---|---|
| ⬜ TODO | Chưa bắt đầu |
| 🔵 IN PROGRESS | Đang thực hiện |
| 🟡 REVIEW | Chờ review |
| 🟢 DONE | Hoàn thành |
| 🔴 BLOCKED | Bị chặn |
| ⏸️ HOLD | Tạm hoãn |

## 2. Bảng task tổng hợp

| Mã task | Tên task | Module | Sprint | Loại | Người nhận | Trạng thái | Phụ thuộc | Ưu tiên | Ước tính |
|---|---|---|---|---|---|---|---|---|---|
| TASK-001 | Khởi tạo schema dữ liệu và migration nền tảng | Auth | 1 | Backend | senior-backend-programmer | 🟡 REVIEW | — | Cao | 4h |
| TASK-002 | API Auth: đăng ký, đăng nhập, lấy hồ sơ | Auth | 1 | Backend | senior-backend-programmer | ⬜ TODO | TASK-001 | Cao | 6h |
| TASK-003 | Middleware JWT, role và trạng thái duyệt | Auth | 1 | Backend | senior-backend-programmer | ⬜ TODO | TASK-002 | Cao | 3h |
| TASK-004 | API Admin quản lý tài khoản | Auth | 1 | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 4h |
| TASK-005 | UI đăng nhập, đăng ký, chờ duyệt | Auth | 1 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-002, TASK-006 | Cao | 6h |
| TASK-006 | Design system và token giao diện | Auth | 1 | Frontend | ui-ux-designer | ⬜ TODO | — | Cao | 5h |
| TASK-007 | Docker Compose và môi trường chạy chuẩn | Auth | 1 | DevOps | senior-devops | ⬜ TODO | — | Cao | 4h |
| TASK-008 | API Meal Session | Order | 2 | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 5h |
| TASK-009 | API Menu category và menu item | Order | 2 | Backend | senior-backend-programmer | ⬜ TODO | TASK-008 | Cao | 5h |
| TASK-010 | API Order: tạo, sửa, hủy, xem, đổi trạng thái | Order | 2 | Backend | senior-backend-programmer | ⬜ TODO | TASK-009 | Cao | 8h |
| TASK-011 | WebSocket hub và broadcast sự kiện order/payment | Order | 2 | Backend | senior-backend-programmer | ⬜ TODO | TASK-010 | Trung bình | 4h |
| TASK-012 | MFE user đặt món và danh sách đơn của tôi | Order | 2 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-005, TASK-010 | Cao | 8h |
| TASK-013 | MFE admin quản lý session, menu và order board | Order | 2 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-009, TASK-010 | Cao | 8h |
| TASK-014 | Client realtime và cơ chế fallback refresh | Order | 2 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-011, TASK-013 | Trung bình | 4h |
| TASK-015 | API Debt và tổng hợp công nợ | Payment | 3 | Backend | senior-backend-programmer | ⬜ TODO | TASK-010 | Cao | 5h |
| TASK-016 | API Payment: tạo yêu cầu, confirm và phân bổ FIFO | Payment | 3 | Backend | senior-backend-programmer | ⬜ TODO | TASK-015 | Cao | 8h |
| TASK-017 | API QR ngân hàng và quy tắc chứng từ thanh toán | Payment | 3 | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 4h |
| TASK-018 | MFE user xem nợ, QR và nộp chứng từ | Payment | 3 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-005, TASK-016, TASK-017 | Cao | 7h |
| TASK-019 | API Dashboard summary và monthly dataset | Dashboard | 3 | Backend | senior-backend-programmer | ⬜ TODO | TASK-015 | Trung bình | 5h |
| TASK-020 | MFE admin dashboard với KPI và biểu đồ tháng | Dashboard | 3 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-019 | Trung bình | 6h |
| TASK-021 | Admin shell, sidebar và route guard | Dashboard | 3 | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-003, TASK-020 | Cao | 5h |
| TASK-022 | Bộ test backend cho auth, order, payment, dashboard | Nền tảng | 3 | Testing | senior-qa | ⬜ TODO | TASK-019 | Cao | 6h |
| TASK-023 | CI/CD: build, test và kiểm tra container | Nền tảng | 3 | DevOps | senior-devops | ⬜ TODO | TASK-022 | Cao | 4h |

## 3. Tổng kết theo sprint

| Sprint | Tổng task | TODO | IN PROGRESS | REVIEW | DONE |
|---|---|---|---|---|---|
| Sprint 1 | 7 | 6 | 0 | 1 | 0 |
| Sprint 2 | 7 | 7 | 0 | 0 | 0 |
| Sprint 3 | 9 | 9 | 0 | 0 | 0 |
| **Tổng** | **23** | **22** | **0** | **1** | **0** |

## 4. Ghi chú bóc tách

- Sprint 1 tập trung nền tảng xác thực, design system và môi trường chạy.
- Sprint 2 tập trung luồng đặt món, admin order và realtime.
- Sprint 3 tập trung công nợ, thanh toán QR, dashboard, test và CI/CD.

*Cập nhật lần cuối: 2026-04-23*
