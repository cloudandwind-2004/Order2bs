# User Stories — Sprint 1

## Mục tiêu Sprint 1

Xây nền tảng kỹ thuật và xác thực người dùng để sẵn sàng cho luồng đặt món ở Sprint 2.

## Phạm vi bám theo TASK-INDEX

- TASK-001 đến TASK-007.

## User Stories chi tiết

### US-S1-01: Khởi tạo cơ sở dữ liệu và migration
- Vai trò: Kỹ sư backend.
- Nhu cầu: Tôi muốn tạo schema dữ liệu chuẩn và migration ban đầu cho các bảng cốt lõi.
- Giá trị: Để các tính năng auth, order, debt có nền dữ liệu nhất quán và sẵn sàng mở rộng.
- Liên kết task: TASK-001.
- Tiêu chí chấp nhận:
  - [ ] Có đầy đủ model cốt lõi theo thiết kế trong tài liệu task.
  - [ ] Migration chạy thành công trên PostgreSQL.
  - [ ] Các ràng buộc chính (khóa chính, unique email, quan hệ cơ bản) được áp dụng.
- Độ ưu tiên: Cao.
- Ước lượng: M.

### US-S1-02: Đăng ký, đăng nhập và lấy thông tin cá nhân
- Vai trò: Nhân viên nội bộ.
- Nhu cầu: Tôi muốn đăng ký tài khoản, đăng nhập và xem thông tin cá nhân của mình.
- Giá trị: Để tôi có thể truy cập hệ thống đặt món một cách bảo mật.
- Liên kết task: TASK-002.
- Tiêu chí chấp nhận:
  - [ ] Có endpoint đăng ký tạo tài khoản ở trạng thái chờ duyệt.
  - [ ] Có endpoint đăng nhập trả JWT khi thông tin hợp lệ.
  - [ ] Có endpoint lấy thông tin người dùng hiện tại khi có token hợp lệ.
  - [ ] Trả lỗi đúng cho các tình huống email trùng, sai mật khẩu, chưa được duyệt.
- Độ ưu tiên: Cao.
- Ước lượng: M.

### US-S1-03: Bảo vệ API bằng JWT và phân quyền
- Vai trò: Quản trị hệ thống.
- Nhu cầu: Tôi muốn API được bảo vệ bằng xác thực token và phân quyền rõ ràng admin/user.
- Giá trị: Để ngăn truy cập trái phép và đảm bảo đúng vai trò nghiệp vụ.
- Liên kết task: TASK-003.
- Tiêu chí chấp nhận:
  - [ ] Middleware JWT xác thực token và gắn thông tin người dùng vào context.
  - [ ] Middleware role chặn user thường truy cập endpoint admin.
  - [ ] Middleware approved chặn tài khoản chưa được duyệt ở các route yêu cầu.
- Độ ưu tiên: Cao.
- Ước lượng: S.

### US-S1-04: Admin duyệt, từ chối và quản lý tài khoản
- Vai trò: Admin.
- Nhu cầu: Tôi muốn xem danh sách tài khoản và duyệt/từ chối/xóa tài khoản theo quy định.
- Giá trị: Để kiểm soát người dùng truy cập hệ thống đúng chính sách nội bộ.
- Liên kết task: TASK-004.
- Tiêu chí chấp nhận:
  - [ ] Admin xem được danh sách user và lọc theo trạng thái duyệt.
  - [ ] Admin có thể duyệt hoặc từ chối tài khoản.
  - [ ] Admin có thể xóa tài khoản user thường.
  - [ ] Không cho phép xóa tài khoản admin.
- Độ ưu tiên: Cao.
- Ước lượng: S.

### US-S1-05: Giao diện Login/Register và trạng thái chờ duyệt
- Vai trò: Nhân viên nội bộ.
- Nhu cầu: Tôi muốn có giao diện đăng nhập/đăng ký rõ ràng và biết trạng thái chờ duyệt sau đăng ký.
- Giá trị: Để thao tác nhanh, giảm nhầm lẫn và tăng tỷ lệ hoàn tất đăng nhập.
- Liên kết task: TASK-005.
- Tiêu chí chấp nhận:
  - [ ] Có form Login và Register với validate client cơ bản.
  - [ ] Hiển thị thông báo lỗi từ API rõ ràng.
  - [ ] Lưu token cục bộ sau đăng nhập thành công.
  - [ ] Tài khoản chưa duyệt được điều hướng tới màn hình chờ duyệt.
  - [ ] Route guard chuyển hướng về trang đăng nhập khi chưa xác thực.
- Độ ưu tiên: Cao.
- Ước lượng: L.

### US-S1-06: Thiết lập Design System nền tảng
- Vai trò: UI/UX Designer.
- Nhu cầu: Tôi muốn chuẩn hóa token màu, font và thành phần cơ bản cho toàn bộ giao diện.
- Giá trị: Để các màn hình về sau đồng nhất và giảm chi phí chỉnh sửa UI.
- Liên kết task: TASK-006.
- Tiêu chí chấp nhận:
  - [ ] Có bộ token cơ bản (màu, typography, spacing) theo định hướng dự án.
  - [ ] Login/Register áp dụng đúng token đã thống nhất.
  - [ ] Có guideline ngắn để frontend tái sử dụng trong các sprint tiếp theo.
- Độ ưu tiên: Trung bình.
- Ước lượng: M.

### US-S1-07: Môi trường chạy thống nhất bằng Docker Compose
- Vai trò: DevOps.
- Nhu cầu: Tôi muốn có cấu hình Docker Compose để chạy frontend, backend, database đồng bộ.
- Giá trị: Để giảm sai khác môi trường và tăng tốc onboard kỹ thuật.
- Liên kết task: TASK-007.
- Tiêu chí chấp nhận:
  - [ ] Chạy được tối thiểu 3 service: frontend, backend, database.
  - [ ] Kết nối giữa các service hoạt động ổn định.
  - [ ] Hướng dẫn chạy local ngắn gọn, rõ ràng cho team.
- Độ ưu tiên: Cao.
- Ước lượng: S.

---

Cập nhật lần cuối: 2026-04-23