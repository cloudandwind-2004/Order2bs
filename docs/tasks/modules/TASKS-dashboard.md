# 📝 Task Module: Dashboard

## Tổng quan module

Module Dashboard cung cấp API tổng hợp và giao diện quản trị theo tháng. Phạm vi phải bám sát SRS-dashboard và screen DASHBOARD/ADMIN, đồng thời không mở rộng KPI mới ngoài bộ chỉ số hiện tại.

---

### TASK-019: API Dashboard summary và monthly dataset

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Dashboard
**Sprint:** 3
**Ưu tiên:** Trung bình
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-015

#### Mô tả
Tổng hợp KPI hiện tại và bộ dữ liệu 12 tháng cho biểu đồ dashboard, đảm bảo timezone và tháng rỗng được trả về với giá trị 0.

#### Yêu cầu chức năng
- [ ] `GET /api/admin/dashboard/summary`
- [ ] `GET /api/admin/dashboard/monthly?year=YYYY`
- [ ] Trả đủ 12 tháng, tháng không có dữ liệu = 0
- [ ] Bám timezone `Asia/Ho_Chi_Minh`

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Dashboard Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `dashboard_summary_snapshots` | `snapshot_at`, `total_users`, `pending_users`, `total_orders`, `total_debt`, `total_spent` | theo kỳ snapshot | KPI tổng quan |
| `dashboard_monthly_stats` | `year`, `month`, `order_count`, `total_spent`, `timezone` | unique `year+month` | Dữ liệu biểu đồ |

- **Index cần tạo:** `dashboard_monthly_stats.year`, `dashboard_monthly_stats.month`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Bearer JWT + admin | KPI tổng quan |
| GET | `/api/admin/dashboard/monthly?year=` | Bearer JWT + admin | Dữ liệu tháng |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Dashboard Service, Dashboard MFE, Admin Shell

#### Yêu cầu bảo mật
- [ ] Chỉ admin truy cập
- [ ] Không để lọt dữ liệu thô nhạy cảm từ các service nguồn
- [ ] Query year phải validate chặt

#### Yêu cầu phi chức năng
- **Hiệu năng:** Trả summary nhanh, monthly dataset ổn định
- **Khả năng mở rộng:** Dễ thêm biểu đồ khác nếu cần
- **Logging & Monitoring:** Log lỗi aggregate dữ liệu
- **Xử lý lỗi:** Trả 400 cho year không hợp lệ, 500 cho lỗi tổng hợp

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Summary trả đúng 5 chỉ số hiện tại
- [ ] Monthly luôn đủ 12 tháng
- [ ] Dashboard không sinh KPI mới ngoài phạm vi đã chốt

---

### TASK-020: MFE admin dashboard với KPI và biểu đồ tháng

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Dashboard
**Sprint:** 3
**Ưu tiên:** Trung bình
**Ước tính:** 6h
**Người nhận:** —
**Phụ thuộc:** TASK-019

#### Mô tả
Tạo màn hình dashboard cho admin với KPI cards, biểu đồ tháng và bộ lọc năm, tuân thủ design system đã chốt.

#### Yêu cầu chức năng
- [ ] Hiển thị 5 KPI hiện tại
- [ ] Hiển thị chart 12 tháng
- [ ] Đổi năm và reload dataset tháng
- [ ] Xử lý loading, empty, error state rõ ràng

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/admin/dashboard/summary` | Bearer JWT + admin | KPI summary |
| GET | `/api/admin/dashboard/monthly?year=` | Bearer JWT + admin | Dữ liệu chart |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React + chart component
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Dashboard MFE, Admin Shell

#### Yêu cầu bảo mật
- [ ] Chỉ admin xem dashboard
- [ ] Không hiển thị số liệu khi chưa có quyền

#### Yêu cầu phi chức năng
- **Hiệu năng:** Dashboard load mượt trên desktop và mobile
- **Khả năng mở rộng:** Có thể thêm card hoặc chart sau này
- **Logging & Monitoring:** Theo dõi lỗi fetch summary/monthly
- **Xử lý lỗi:** Giữ nguyên KPI khi chỉ monthly fail

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] KPI cards và biểu đồ hiển thị đúng
- [ ] Filter năm hoạt động độc lập
- [ ] UI đúng chuẩn screen DASHBOARD

---

### TASK-021: Admin shell, sidebar và route guard

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Dashboard
**Sprint:** 3
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-003, TASK-020

#### Mô tả
Xây dựng shell quản trị chung cho các route dashboard, users, sessions/menu, orders và payments, đồng thời bảo vệ route theo role.

#### Yêu cầu chức năng
- [ ] Sidebar điều hướng các route admin
- [ ] Route guard theo role admin
- [ ] Pending/rejected user không vào được admin shell
- [ ] Có layout thống nhất cho mọi màn hình vận hành

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/auth/me` | Bearer JWT | Xác định role hiện tại |
| ALL | `/api/admin/*` | Bearer JWT + admin | Bảo vệ route admin |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React Router + layout shell
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Admin Shell, Auth Service, tất cả MFE admin

#### Yêu cầu bảo mật
- [ ] Không render admin route nếu token không hợp lệ
- [ ] Không cho user thường truy cập bằng thao tác trực tiếp URL

#### Yêu cầu phi chức năng
- **Hiệu năng:** Chuyển route nhanh, không reload toàn app
- **Khả năng mở rộng:** Có thể tách từng route thành MFE riêng sau này
- **Logging & Monitoring:** Theo dõi các lần bị chặn do role sai
- **Xử lý lỗi:** Có fallback UI nếu `me` hoặc route data fail

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Admin shell bao phủ đủ route vận hành
- [ ] Route guard chặn đúng user không hợp lệ
- [ ] Layout đồng nhất theo design screen ADMIN