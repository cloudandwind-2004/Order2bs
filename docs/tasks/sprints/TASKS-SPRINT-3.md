# 🗓️ Task Sprint 3 — Thanh toán & Dashboard

Sprint 3 hoàn thiện luồng công nợ, thanh toán QR, dashboard quản trị và lớp nền chất lượng gồm test/CI.

## Mục tiêu sprint

- Debt và payment đi hết vòng đời nghiệp vụ.
- Admin cấu hình QR và theo dõi dashboard tháng.
- Có test backend và CI/CD để chốt chất lượng phát hành.

## Bảng task

| Mã task | Tên task | Module | Loại | Người nhận | Trạng thái | Phụ thuộc | Ưu tiên | Ước tính |
|---|---|---|---|---|---|---|---|---|
| TASK-015 | API Debt và tổng hợp công nợ | Payment | Backend | senior-backend-programmer | ⬜ TODO | TASK-010 | Cao | 5h |
| TASK-016 | API Payment: tạo yêu cầu, confirm và phân bổ FIFO | Payment | Backend | senior-backend-programmer | ⬜ TODO | TASK-015 | Cao | 8h |
| TASK-017 | API QR ngân hàng và quy tắc chứng từ thanh toán | Payment | Backend | senior-backend-programmer | ⬜ TODO | TASK-003 | Cao | 4h |
| TASK-018 | MFE user xem nợ, QR và nộp chứng từ | Payment | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-005, TASK-016, TASK-017 | Cao | 7h |
| TASK-019 | API Dashboard summary và monthly dataset | Dashboard | Backend | senior-backend-programmer | ⬜ TODO | TASK-015 | Trung bình | 5h |
| TASK-020 | MFE admin dashboard với KPI và biểu đồ tháng | Dashboard | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-019 | Trung bình | 6h |
| TASK-021 | Admin shell, sidebar và route guard | Dashboard | Frontend | senior-frontend-programmer | ⬜ TODO | TASK-003, TASK-020 | Cao | 5h |
| TASK-022 | Bộ test backend cho auth, order, payment, dashboard | Nền tảng | Testing | senior-qa | ⬜ TODO | TASK-019 | Cao | 6h |
| TASK-023 | CI/CD: build, test và kiểm tra container | Nền tảng | DevOps | senior-devops | ⬜ TODO | TASK-022 | Cao | 4h |

## Phụ thuộc chính

- `TASK-015` và `TASK-016` khép kín vòng đời công nợ - thanh toán.
- `TASK-019` là đầu vào cho dashboard UI và shell quản trị.
- `TASK-022` và `TASK-023` là lớp kiểm soát chất lượng cuối sprint.

## Kết quả mong đợi

- User thanh toán QR có proof bắt buộc.
- Admin confirm payment và dashboard hoạt động đúng.
- Có test và CI để chuẩn bị staging/release.

*Cập nhật lần cuối: 2026-04-23*