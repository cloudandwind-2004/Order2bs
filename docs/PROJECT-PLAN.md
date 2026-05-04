# Kế hoạch dự án: Lunch Order System

## Tổng quan
- **Mục tiêu:** Xây dựng hệ thống đặt cơm trưa nội bộ có duyệt tài khoản, đặt món theo phiên, quản lý nợ và thanh toán QR.
- **Đối tượng:** Nhân viên đặt món hằng ngày và quản trị viên vận hành thực đơn, đơn hàng, thanh toán.
- **Nền tảng:** Web (Frontend React + Backend Golang).
- **Ngày bắt đầu:** 2026-04-23

## Các giai đoạn

| Giai đoạn | Agent thực hiện | Trạng thái | Đầu ra |
|---|---|---|---|
| 1. Phân tích yêu cầu | Product Owner | 🟢 Hoàn thành | docs/prd/, docs/user-stories/ |
| 2. Đặc tả kỹ thuật | Business Analyst | 🟢 Hoàn thành | docs/srs/ |
| 3. Thiết kế UI/UX | UI/UX Designer | 🟢 Hoàn thành | docs/design/ |
| 4. Kiến trúc & task | Technical Leader | 🟢 Hoàn thành | docs/tasks/ |
| 5. Triển khai | Backend + Frontend + DevOps | ⬜ Chưa bắt đầu | Source code, infra/ |
| 6. Kiểm thử | Senior QA | ⬜ Chưa bắt đầu | docs/testcases/, docs/evidence/ |

## Cổng kiểm soát chất lượng (Quality Gates)

Trước khi chuyển sang giai đoạn tiếp theo, PHẢI đáp ứng:

- **Giai đoạn 1 → 2**: PRD được người dùng xác nhận, user story đủ cho ít nhất 1 sprint.
- **Giai đoạn 2 → 3**: SRS có đủ 4 phần (feature specs, flow, mockup, dữ liệu & validation).
- **Giai đoạn 3 → 4**: Design system và screen specs của ít nhất 1 luồng chính được hoàn thành.
- **Giai đoạn 4 → 5**: TASK-INDEX.md có đủ task với thiết kế DB, API, tech stack rõ ràng.
- **Giai đoạn 5 → 6**: Tất cả task sprint có trạng thái 🟡 REVIEW.
- **Hoàn thành**: Không còn bug Critical/Major, QA xác nhận đủ điều kiện release.
