# Kế hoạch Sprint 1

## Mục tiêu sprint

Thiết lập nền tảng hệ thống và hoàn thành năng lực xác thực/phân quyền để sẵn sàng triển khai luồng đặt món ở Sprint 2.

## Danh sách User Stories trong sprint

- US-S1-01 — Khởi tạo cơ sở dữ liệu và migration.
- US-S1-02 — Đăng ký, đăng nhập và lấy thông tin cá nhân.
- US-S1-03 — Bảo vệ API bằng JWT và phân quyền.
- US-S1-04 — Admin duyệt, từ chối và quản lý tài khoản.
- US-S1-05 — Giao diện Login/Register và trạng thái chờ duyệt.
- US-S1-06 — Thiết lập Design System nền tảng.
- US-S1-07 — Môi trường chạy thống nhất bằng Docker Compose.

Tham chiếu chi tiết: ../user-stories/US-Sprint-1.md

## Tổng story points

- Quy đổi tương đối dùng cho planning nội bộ:
  - S = 2 điểm
  - M = 3 điểm
  - L = 5 điểm
- Tổng điểm sprint: 20 điểm.

## Rủi ro và kế hoạch giảm thiểu

- Rủi ro: Chậm hoàn thành TASK-001 làm trễ toàn bộ auth API.
  - Giảm thiểu: Ưu tiên hoàn tất schema/migration ở đầu sprint, review sớm model.

- Rủi ro: API auth hoàn tất chậm khiến frontend không thể tích hợp.
  - Giảm thiểu: Chốt contract request/response sớm, mock response tạm thời cho FE.

- Rủi ro: Luồng duyệt tài khoản chưa rõ quy tắc nghiệp vụ.
  - Giảm thiểu: Chốt rule duyệt/từ chối trong tuần đầu và ghi rõ acceptance criteria.

- Rủi ro: Khác biệt môi trường local giữa các thành viên.
  - Giảm thiểu: Hoàn thiện Docker Compose sớm và chuẩn hóa biến môi trường.

---

Cập nhật lần cuối: 2026-04-23