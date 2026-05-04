# 📝 Task Module: Auth & Người dùng

## Tổng quan module

Module này bao phủ xác thực, duyệt tài khoản và nền tảng giao diện cho màn hình Login/Register/Pending. Mọi nội dung phải bám sát PRD, SRS-auth và DESIGN-SYSTEM, trong đó số điện thoại là định danh đăng nhập chính, tài khoản mới ở trạng thái chờ duyệt, và route nhạy cảm phải qua JWT + kiểm tra trạng thái approved.

---

### TASK-001: Khởi tạo schema dữ liệu và migration nền tảng

**Trạng thái:** 🟡 REVIEW
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** —

#### Mô tả
Thiết kế lớp dữ liệu nền cho toàn hệ thống theo ranh giới service, bảo đảm migration khởi tạo đủ bảng và chỉ mục cốt lõi ngay khi backend khởi động.

#### Yêu cầu chức năng
- [x] Tạo model `User` với `phone`, `password_hash`, `full_name`, `role`, `status`, `is_approved`, `reject_reason`, `locked_until`
- [x] Tạo model `MealSession`, `MenuCategory`, `MenuItem` cho service Order
- [x] Tạo model `Order`, `OrderItem`, `OrderStatusHistory`
- [x] Tạo model `Debt`, `Payment`, `PaymentProof`, `BankQrSetting`, `PaymentAllocation`
- [x] Tạo model `DashboardSummarySnapshot`, `DashboardMonthlyStat` nếu dashboard dùng read model riêng
- [x] Chạy AutoMigrate theo thứ tự phụ thuộc giữa các bảng

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Auth / Order / Payment / Dashboard
- **Bảng và trường chính:**

| Bảng | Trường chính | Ràng buộc | Mô tả |
|---|---|---|---|
| `users` | `id`, `phone`, `password_hash`, `full_name`, `role`, `status`, `is_approved` | `phone` unique, `status` enum | Tài khoản nội bộ |
| `auth_login_attempts` | `user_id`, `failed_count`, `locked_until` | index theo `user_id` | Theo dõi khóa tạm khi đăng nhập sai |
| `meal_sessions` | `id`, `title`, `meal_date`, `cutoff_at`, `is_active` | index theo `meal_date` | Phiên ăn theo ngày |
| `orders` | `id`, `user_id`, `session_id`, `status`, `subtotal`, `subsidy`, `debt_amount` | index theo `session_id`, `user_id` | Đơn đặt món |
| `debts` | `id`, `user_id`, `order_id`, `amount`, `is_paid`, `paid_amount` | index theo `user_id`, `is_paid` | Công nợ phát sinh |
| `payments` | `id`, `user_id`, `amount`, `status`, `proof_url` | index theo `status` | Yêu cầu thanh toán |
| `bank_qr_settings` | `id`, `bank_name`, `account_no`, `account_name`, `qr_image_url`, `is_active` | chỉ 1 bản ghi active | QR ngân hàng |
| `dashboard_monthly_stats` | `year`, `month`, `order_count`, `total_spent` | unique `year+month` | Read model dashboard |

- **Index cần tạo:** `users.phone`, `orders.session_id`, `orders.user_id`, `debts.user_id`, `payments.status`, `bank_qr_settings.is_active`
- **Migration cần thiết:** Có

#### Thiết kế API

- **Không expose API riêng**; đây là task nền tảng cho toàn bộ service.
- Migration phải phục vụ các API của task AUTH-002 đến DASH-020.

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** GORM + AutoMigrate
- **Giao thức:** Nội bộ
- **Microservice / Micro-frontend liên quan:** Tất cả service backend

#### Yêu cầu bảo mật
- [x] Không lưu mật khẩu dạng plain text
- [x] Chuẩn hóa enum trạng thái để tránh giá trị rác
- [x] Tách dữ liệu theo service sở hữu, không truy cập chéo bảng trực tiếp

#### Yêu cầu phi chức năng
- **Hiệu năng:** Migration khởi động dưới 30 giây trong môi trường Docker Compose
- **Khả năng mở rộng:** Có thể thêm cột mà không phá vỡ API cũ
- **Logging & Monitoring:** Log rõ bảng nào migrate lỗi
- **Xử lý lỗi:** Dừng startup nếu migration thất bại

#### Tiêu chí hoàn thành (Definition of Done)
- [x] Migrate thành công trên PostgreSQL sạch
- [x] Không tạo bảng trùng hoặc thiếu chỉ mục bắt buộc
- [x] Startup backend không lỗi với dữ liệu mẫu

#### Kết quả Unit Test

**Lần chạy:** 2026-04-23
**Kết quả:** ✅ PASS (không có unit test chuyên biệt; đã xác minh build + runtime migration)

**Evidence:**
- Build backend image thành công: `docker compose build backend`
- Runtime migration thành công trên PostgreSQL tạm:
	- `✅ Database connected`
	- `✅ Database migrated`

#### Kết quả triển khai

**Ngày hoàn thành:** 2026-04-23
**Files đã tạo / sửa:**
- `backend/internal/models/models.go` — mở rộng schema nền tảng (User/AuthLoginAttempt/OrderItem/OrderStatusHistory/PaymentProof/PaymentAllocation/Dashboard snapshots), thêm check constraints cho enum
- `backend/db/db.go` — cập nhật thứ tự và đầy đủ danh sách AutoMigrate cho TASK-001
- `backend/go.sum` — bổ sung lock dependencies để build reproducible trong Docker

**Ghi chú:**
- Giữ tương thích ngược với handler hiện có bằng alias type `PaymentLog` và `BankQR`.
- Xác minh runtime dùng PostgreSQL container tạm để tránh xung đột môi trường local.

**Definition of Done:**
- [x] Migration schema và chỉ mục chạy thành công trên PostgreSQL sạch
- [x] Build backend thành công sau thay đổi schema
- [ ] Code review được approve  ← chờ reviewer

---

### TASK-002: API Auth — đăng ký, đăng nhập, lấy hồ sơ

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 6h
**Người nhận:** —
**Phụ thuộc:** TASK-001

#### Mô tả
Triển khai luồng đăng ký, đăng nhập và lấy hồ sơ hiện tại theo định danh số điện thoại, xử lý đầy đủ trạng thái pending/rejected/approved và giới hạn sai đăng nhập.

#### Yêu cầu chức năng
- [ ] `POST /api/auth/register` tạo user mới ở trạng thái chờ duyệt
- [ ] `POST /api/auth/login` phát hành JWT nếu hợp lệ, khóa tạm khi sai quá 5 lần trong 15 phút
- [ ] `GET /api/auth/me` trả về hồ sơ user hiện tại
- [ ] Validate `phone`, `password`, `full_name`
- [ ] Trả `423` khi tài khoản bị khóa tạm hoặc bị chặn do cơ chế sai liên tiếp

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Auth Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `users` | `phone`, `password_hash`, `full_name`, `role`, `status`, `is_approved` | `phone` unique | Hồ sơ đăng nhập |
| `auth_login_attempts` | `user_id`, `failed_count`, `locked_until` | 1 user / 1 record | Khóa tạm khi login sai |

- **Index cần tạo:** `users.phone`, `auth_login_attempts.user_id`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | Không | Đăng ký user mới |
| POST | `/api/auth/login` | Không | Đăng nhập bằng phone/password |
| GET | `/api/auth/me` | Bearer JWT | Lấy hồ sơ hiện tại |

```
POST /api/auth/register
Request:  { phone, password, full_name }
Response: { message, status: "pending" }
Errors:   400, 409

POST /api/auth/login
Request:  { phone, password }
Response: { token, user: { id, phone, full_name, role, status, is_approved } }
Errors:   400, 401, 423, 500

GET /api/auth/me
Response: { id, phone, full_name, role, status, is_approved, created_at }
Errors:   401, 404
```

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + bcrypt + golang-jwt/jwt
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Auth Service, Login MFE

#### Yêu cầu bảo mật
- [ ] Hash mật khẩu bằng bcrypt
- [ ] JWT có hạn dùng rõ ràng và ký bằng secret riêng
- [ ] Rate limit logic đăng nhập sai 5 lần/15 phút
- [ ] Không trả thông tin nhạy cảm trong response lỗi

#### Yêu cầu phi chức năng
- **Hiệu năng:** p95 dưới 200ms cho login và me
- **Khả năng mở rộng:** Stateless để scale ngang
- **Logging & Monitoring:** Ghi log login success/failure và khóa tạm
- **Xử lý lỗi:** Sai mật khẩu không phân biệt user tồn tại hay không

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Ba endpoint trả đúng schema
- [ ] Tài khoản pending bị chặn ở route require approved
- [ ] Có test cho case đăng nhập sai, khóa tạm, token hết hạn

---

### TASK-003: Middleware JWT, role và trạng thái duyệt

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 3h
**Người nhận:** —
**Phụ thuộc:** TASK-002

#### Mô tả
Chuẩn hóa lớp bảo vệ API cho toàn hệ thống gồm xác thực JWT, kiểm tra role admin và chặn tài khoản chưa duyệt.

#### Yêu cầu chức năng
- [ ] `JWTAuth` parse token và đưa `user_id`, `role`, `status` vào context
- [ ] `RequireAdmin` chặn mọi route quản trị nếu không phải admin
- [ ] `RequireApproved` chặn user pending/rejected trên route nghiệp vụ

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Auth Service
- **Bảng và trường:** `users.role`, `users.status`, `users.is_approved`, `auth_login_attempts.locked_until`
- **Index cần tạo:** `users.role`, `users.status`
- **Migration cần thiết:** Không thêm bảng mới

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| ALL | `/api/admin/*` | Bearer JWT + admin | Chỉ admin được truy cập |
| ALL | `/api/orders/*` | Bearer JWT + approved | Chỉ user hợp lệ |
| ALL | `/api/debts/*`, `/api/payments/*` | Bearer JWT + approved | Chỉ user hợp lệ |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin middleware
- **Giao thức:** REST guard
- **Microservice / Micro-frontend liên quan:** Tất cả service backend và các route admin/user

#### Yêu cầu bảo mật
- [ ] Xác thực token ở đầu request
- [ ] Tách rõ lỗi `401` và `403`
- [ ] Không cho bypass kiểm tra approved qua query hay header phụ

#### Yêu cầu phi chức năng
- **Hiệu năng:** Middleware thêm độ trễ tối thiểu
- **Khả năng mở rộng:** Tái sử dụng trên mọi route nhóm
- **Logging & Monitoring:** Log các lần bị chặn do role/status
- **Xử lý lỗi:** Trả response chuẩn hoá, không panic

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Middleware dùng được cho toàn bộ route đã chốt
- [ ] Test bao phủ case token sai, role sai, status sai

---

### TASK-004: API Admin quản lý tài khoản

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** TASK-003

#### Mô tả
Cho phép admin xem danh sách tài khoản, duyệt, từ chối có lý do, và xóa tài khoản theo quy tắc nghiệp vụ. Không cho xóa tài khoản admin.

#### Yêu cầu chức năng
- [ ] `GET /api/admin/users` có filter theo `status` và tìm kiếm cơ bản
- [ ] `PATCH /api/admin/users/:id/approve` cập nhật `status = approved`
- [ ] `PATCH /api/admin/users/:id/reject` bắt buộc có `reject_reason`
- [ ] `DELETE /api/admin/users/:id` xóa user thường, chặn xóa admin
- [ ] Ghi nhận thời điểm xử lý để bám SLA 24 giờ

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Auth Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `users` | `status`, `is_approved`, `reject_reason`, `approved_at`, `rejected_at`, `updated_by` | không cho xóa admin | Quản lý vòng đời tài khoản |

- **Index cần tạo:** `users.status`, `users.role`
- **Migration cần thiết:** Có thể cần bổ sung cột audit

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/admin/users?status=` | Bearer JWT + admin | Danh sách user |
| PATCH | `/api/admin/users/:id/approve` | Bearer JWT + admin | Duyệt tài khoản |
| PATCH | `/api/admin/users/:id/reject` | Bearer JWT + admin | Từ chối tài khoản |
| DELETE | `/api/admin/users/:id` | Bearer JWT + admin | Xóa user thường |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Auth Service, Admin Shell

#### Yêu cầu bảo mật
- [ ] Chỉ admin được truy cập
- [ ] Reject phải có lý do hợp lệ 5-500 ký tự
- [ ] Không xóa tài khoản admin hoặc tài khoản hệ thống

#### Yêu cầu phi chức năng
- **Hiệu năng:** Load danh sách có phân trang
- **Khả năng mở rộng:** Có thể thêm filter theo trạng thái sau
- **Logging & Monitoring:** Ghi log hành động duyệt/từ chối/xóa
- **Xử lý lỗi:** Trả thông báo rõ khi user không tồn tại

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Admin thao tác được trên UI quản trị
- [ ] Reject lưu được lý do và thời điểm xử lý
- [ ] Không thể xóa user admin

---

### TASK-005: UI đăng nhập, đăng ký, chờ duyệt

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 6h
**Người nhận:** —
**Phụ thuộc:** TASK-002, TASK-006

#### Mô tả
Xây dựng các màn hình đăng nhập, đăng ký và chờ duyệt theo design system đã chốt, bao gồm lưu token, điều hướng theo vai trò và trạng thái tài khoản.

#### Yêu cầu chức năng
- [ ] Form login dùng `phone` + `password`
- [ ] Form register dùng `phone`, `password`, `full_name`
- [ ] Hiển thị màn hình pending/rejected sau khi login đúng nhưng chưa được duyệt
- [ ] Lưu JWT an toàn vào storage theo quy ước dự án
- [ ] Protected route redirect về `login` nếu chưa đăng nhập

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh dữ liệu riêng
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/login` | Không | Đăng nhập |
| POST | `/api/auth/register` | Không | Đăng ký |
| GET | `/api/auth/me` | Bearer JWT | Lấy hồ sơ hiện tại |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React + React Router + Axios
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Auth MFE, Shell App

#### Yêu cầu bảo mật
- [ ] Không lưu thông tin nhạy cảm trên UI
- [ ] Không hiển thị chi tiết nội bộ của backend ở thông báo lỗi
- [ ] Tự động xóa phiên khi token hết hạn

#### Yêu cầu phi chức năng
- **Hiệu năng:** First paint nhanh trên mobile và desktop
- **Khả năng mở rộng:** Component form tái sử dụng cho các màn hình khác
- **Logging & Monitoring:** Có telemetry cơ bản cho submit/login fail
- **Xử lý lỗi:** Giữ nguyên dữ liệu form khi submit lỗi

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] 3 trạng thái default/loading/error hoạt động rõ
- [ ] Điều hướng đúng theo approved/admin/pending/rejected
- [ ] Màn hình đạt yêu cầu responsive và accessibility cơ bản

---

### TASK-006: Design system và token giao diện

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** —

#### Mô tả
Chuẩn hóa bộ token màu, typography, spacing, trạng thái và component nền cho toàn bộ UI MVP, ưu tiên đúng design system đã chốt.

#### Yêu cầu chức năng
- [ ] Khai báo token màu hồng-vàng, neutral, success, warning, error
- [ ] Chuẩn hóa font `Be Vietnam Pro` và thang cỡ chữ
- [ ] Xây dựng style nền cho button, input, card, table, modal, status chip
- [ ] Đảm bảo layout responsive cho desktop, tablet, mobile

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

- **Không có API riêng**; module này cung cấp nền giao diện cho mọi màn hình.

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript + CSS
- **Framework:** React + CSS Variables
- **Giao thức:** Nội bộ frontend
- **Microservice / Micro-frontend liên quan:** Tất cả MFE

#### Yêu cầu bảo mật
- [ ] Không ảnh hưởng tới dữ liệu nhạy cảm
- [ ] Mọi trạng thái màu phải đi kèm nhãn chữ hoặc icon

#### Yêu cầu phi chức năng
- **Hiệu năng:** Tệp CSS gọn, không làm tăng đáng kể bundle
- **Khả năng mở rộng:** Token dùng được cho toàn bộ module
- **Logging & Monitoring:** Không áp dụng
- **Xử lý lỗi:** Không làm gãy layout khi thiếu dữ liệu

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Token và component cơ bản dùng được trên Login, Order, Payment, Dashboard
- [ ] Đạt tương phản tối thiểu theo tài liệu design

---

### TASK-007: Docker Compose và môi trường chạy chuẩn

**Trạng thái:** ⬜ TODO
**Loại:** DevOps
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** —

#### Mô tả
Chuẩn hóa môi trường chạy local/staging bằng Docker Compose, bảo đảm frontend, backend và database khởi động thống nhất.

#### Yêu cầu chức năng
- [ ] Khai báo service frontend, backend, database
- [ ] Thiết lập biến môi trường qua `.env`
- [ ] Có healthcheck và order khởi động hợp lý
- [ ] Có volume cho PostgreSQL để giữ dữ liệu dev

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

- **Không có API riêng**; task này chỉ chuẩn hóa vận hành.

#### Giao thức & Công nghệ
- **Ngôn ngữ:** YAML / Docker Compose
- **Framework:** Docker + Nginx
- **Giao thức:** HTTP nội bộ container
- **Microservice / Micro-frontend liên quan:** Toàn bộ hệ thống

#### Yêu cầu bảo mật
- [ ] Không hard-code secret vào file compose
- [ ] Mỗi service chỉ mở port cần thiết
- [ ] Network nội bộ tách biệt khỏi host khi không cần thiết

#### Yêu cầu phi chức năng
- **Hiệu năng:** Startup ổn định, không treo do phụ thuộc vòng
- **Khả năng mở rộng:** Dễ thêm service mới khi tách module
- **Logging & Monitoring:** Có log container rõ ràng
- **Xử lý lỗi:** Service lỗi phải báo dễ đọc trong compose logs

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] `docker compose up` chạy được toàn bộ stack
- [ ] Không lộ secret trong file cấu hình
- [ ] Có hướng dẫn môi trường rõ ràng cho dev mới

<!--

---

### TASK-001: Setup database schema & migrations

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 3h
**Người nhận:** —
**Phụ thuộc:** —

#### Mô tả
Tạo schema cơ sở dữ liệu cho toàn bộ hệ thống via GORM AutoMigrate. Đảm bảo tất cả bảng, index và ràng buộc được thiết lập đúng.

#### Yêu cầu chức năng
- [ ] Tạo model `User` (id, email, password_hash, name, role, is_approved, created_at)
- [ ] Tạo model `MealSession` (id, title, date, deadline, status, created_by, created_at)
- [ ] Tạo model `MenuCategory` (id, session_id, name, order)
- [ ] Tạo model `MenuItem` (id, category_id, name, price, description, image_url)
- [ ] Tạo model `Order` (id, user_id, session_id, total, subsidy, debt, is_home_cook, status, created_at)
- [ ] Tạo model `OrderItem` (id, order_id, item_id, quantity, note, price)
- [ ] Tạo model `Debt` (id, user_id, order_id, amount, is_paid, created_at)
- [ ] Tạo model `Payment` (id, user_id, amount, status, reference, created_at)
- [ ] Tạo model `Settings` (key, value)
- [ ] Chạy AutoMigrate trong `db/migrate.go`

#### Thiết kế cơ sở dữ liệu

**Bảng `users`:**
| Trường | Kiểu | Ràng buộc | Mô tả |
|--------|------|-----------|-------|
| id | UUID / SERIAL | PK | ID tự tăng |
| email | VARCHAR(255) | UNIQUE, NOT NULL | Email đăng nhập |
| password_hash | TEXT | NOT NULL | Bcrypt hash |
| name | VARCHAR(100) | NOT NULL | Tên hiển thị |
| role | VARCHAR(20) | DEFAULT 'user' | 'user' \| 'admin' |
| is_approved | BOOLEAN | DEFAULT false | Admin duyệt |
| created_at | TIMESTAMP | DEFAULT NOW() | Ngày tạo |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** GORM v2
- **Giao thức:** Internal (không expose API)

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Tất cả model đã được định nghĩa trong `internal/models/`
- [ ] AutoMigrate thành công khi chạy `go run main.go`
- [ ] Kiểm tra bảng tạo đúng trong PostgreSQL

---

### TASK-002: API Auth — Register, Login, Me

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** TASK-001

#### Mô tả
Triển khai 3 endpoint xác thực cơ bản: đăng ký tài khoản, đăng nhập lấy JWT, và lấy thông tin người dùng hiện tại.

#### Yêu cầu chức năng
- [ ] `POST /api/auth/register` — Tạo tài khoản mới (is_approved = false)
- [ ] `POST /api/auth/login` — Trả về JWT token nếu credentials đúng
- [ ] `GET /api/auth/me` — Trả về thông tin user hiện tại (cần JWT)
- [ ] Hash password bằng bcrypt
- [ ] Validate email format và password không rỗng
- [ ] Return 401 nếu chưa duyệt tài khoản khi login

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| POST | `/api/auth/register` | Không | Đăng ký tài khoản |
| POST | `/api/auth/login` | Không | Đăng nhập |
| GET | `/api/auth/me` | Bearer JWT | Lấy thông tin user |

```
POST /api/auth/register
Request:  { "email": "string", "password": "string", "name": "string" }
Response: { "message": "Đăng ký thành công, chờ admin duyệt" }
Errors:   400 (validation), 409 (email đã tồn tại)

POST /api/auth/login
Request:  { "email": "string", "password": "string" }
Response: { "token": "jwt_string", "user": { "id", "email", "name", "role" } }
Errors:   400, 401 (sai password | chưa duyệt)

GET /api/auth/me
Response: { "id", "email", "name", "role", "is_approved", "created_at" }
Errors:   401 (không có token | token hết hạn)
```

#### Tiêu chí hoàn thành
- [ ] 3 endpoint hoạt động đúng
- [ ] Unit test cho service layer (mock DB)
- [ ] Xử lý đầy đủ error case

---

### TASK-003: Middleware JWT + Role Admin/User

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 2h
**Người nhận:** —
**Phụ thuộc:** TASK-002

#### Mô tả
Tạo 2 middleware Gin: (1) xác thực JWT và gán user vào context; (2) kiểm tra quyền admin.

#### Yêu cầu chức năng
- [ ] `middleware.JWTAuth(cfg)` — Parse và validate JWT, set user_id vào context
- [ ] `middleware.RequireAdmin()` — Kiểm tra role = 'admin', reject 403 nếu không đủ quyền
- [ ] `middleware.RequireApproved()` — Kiểm tra is_approved = true

#### Tiêu chí hoàn thành
- [ ] Middleware hoạt động chính xác với các route đã khai báo trong `main.go`
- [ ] Unit test cho từng middleware

---

### TASK-004: API Admin — Duyệt/Từ chối/Xóa tài khoản

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 2h
**Người nhận:** —
**Phụ thuộc:** TASK-003

#### Yêu cầu chức năng
- [ ] `GET /api/admin/users` — Danh sách user (filter by is_approved)
- [ ] `PATCH /api/admin/users/:id/approve` — Duyệt tài khoản
- [ ] `PATCH /api/admin/users/:id/reject` — Từ chối (set is_approved = false)
- [ ] `DELETE /api/admin/users/:id` — Xóa tài khoản

#### Tiêu chí hoàn thành
- [ ] 4 endpoint hoạt động, chỉ admin được gọi
- [ ] Không thể xóa tài khoản admin

---

### TASK-005: Trang Login & Register UI

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Auth
**Sprint:** 1
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-002, TASK-006

#### Mô tả
Xây dựng 2 trang Login và Register với design hồng-vàng nhạt. Lưu JWT vào localStorage. Redirect sau khi đăng nhập.

#### Yêu cầu chức năng
- [ ] Form Login: email + password, validate phía client
- [ ] Form Register: email + password + name
- [ ] Hiển thị thông báo lỗi từ API
- [ ] Sau login thành công → redirect về trang đặt món
- [ ] Nếu chưa được duyệt → hiển thị màn hình chờ duyệt
- [ ] Lưu token vào localStorage
- [ ] Protected route: redirect về /login nếu chưa đăng nhập

#### Tiêu chí hoàn thành
- [ ] UI đẹp đúng design system
- [ ] Xử lý loading và error state
- [ ] Route guard hoạt động

---
