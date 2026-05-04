# 📝 Task Module: Order

## Tổng quan module

Module Order chịu trách nhiệm phiên ăn, menu, tạo đơn, sửa/hủy đơn, cập nhật trạng thái và realtime cho admin. Phạm vi phải bám sát SRS-order và screen ORDER/ADMIN, trong đó hạn chót đặt món cố định toàn công ty và trợ cấp áp dụng chung cho toàn bộ người dùng.

---

### TASK-008: API Meal Session

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-003

#### Mô tả
Cho phép admin tạo, cập nhật, đóng và xóa meal session; user chỉ được xem session đang active.

#### Yêu cầu chức năng
- [ ] CRUD session cho admin
- [ ] Trả session active cho user đã approved
- [ ] Lưu `cutoff_at`, `meal_date`, `is_active`
- [ ] Bảo đảm chỉ một session active chính tại một thời điểm theo quy ước vận hành

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Order Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `meal_sessions` | `title`, `meal_date`, `cutoff_at`, `is_active`, `created_by` | index theo `meal_date` | Phiên ăn |

- **Index cần tạo:** `meal_sessions.meal_date`, `meal_sessions.is_active`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/sessions/active` | Bearer JWT + approved | Session đang mở |
| GET | `/api/admin/sessions` | Bearer JWT + admin | Danh sách session |
| POST | `/api/admin/sessions` | Bearer JWT + admin | Tạo session |
| PATCH | `/api/admin/sessions/:id` | Bearer JWT + admin | Cập nhật session |
| DELETE | `/api/admin/sessions/:id` | Bearer JWT + admin | Xóa/đóng session |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Order Service, Order/Admin MFE

#### Yêu cầu bảo mật
- [ ] Chỉ admin được ghi dữ liệu session
- [ ] User chỉ xem session active
- [ ] Validate thời gian cutoff không vượt quy tắc toàn công ty

#### Yêu cầu phi chức năng
- **Hiệu năng:** Danh sách session trả nhanh, hỗ trợ filter theo ngày
- **Khả năng mở rộng:** Có thể thêm trạng thái session sau này
- **Logging & Monitoring:** Log session được tạo/cập nhật/đóng
- **Xử lý lỗi:** Trả 404 khi session không tồn tại

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Admin thao tác session được trên UI
- [ ] User nhìn thấy đúng session active
- [ ] Dữ liệu cutoff được dùng đúng ở luồng đặt món

---

### TASK-009: API Menu category và menu item

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-008

#### Mô tả
Tạo lớp API cho admin quản lý category và menu item theo từng session, đồng thời cung cấp dữ liệu menu cho user xem và chọn món.

#### Yêu cầu chức năng
- [ ] CRUD category theo session
- [ ] CRUD menu item theo category
- [ ] Hỗ trợ `display_order` để sắp xếp danh sách
- [ ] Validate giá, mô tả và trạng thái khả dụng

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Order Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `menu_categories` | `session_id`, `name`, `display_order` | unique theo session + tên | Nhóm món |
| `menu_items` | `category_id`, `name`, `price`, `description`, `image_url`, `is_available` | `price >= 0` | Món ăn |

- **Index cần tạo:** `menu_categories.session_id`, `menu_items.category_id`, `menu_items.is_available`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/sessions/:id/menu` | Bearer JWT + approved | Xem menu theo session |
| GET | `/api/admin/sessions/:id/menu` | Bearer JWT + admin | Xem menu quản trị |
| POST/PATCH/DELETE | `/api/admin/categories...` | Bearer JWT + admin | CRUD category |
| POST/PATCH/DELETE | `/api/admin/items...` | Bearer JWT + admin | CRUD item |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Order Service, Order/Admin MFE

#### Yêu cầu bảo mật
- [ ] Chỉ admin ghi menu
- [ ] User chỉ đọc menu của session được phép
- [ ] Không cho giá âm hoặc item rỗng

#### Yêu cầu phi chức năng
- **Hiệu năng:** Menu render dưới 300ms trong dữ liệu nội bộ
- **Khả năng mở rộng:** Có thể thêm tag/danh mục sau này
- **Logging & Monitoring:** Log thay đổi menu
- **Xử lý lỗi:** Trả 404 khi session hoặc category không tồn tại

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Menu hiển thị đúng theo session
- [ ] Thứ tự category ổn định
- [ ] UI admin thao tác menu không cần reload toàn trang

---

### TASK-010: API Order — tạo, sửa, hủy, xem, đổi trạng thái

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Cao
**Ước tính:** 8h
**Người nhận:** —
**Phụ thuộc:** TASK-009

#### Mô tả
Xây dựng nghiệp vụ tạo đơn trước cutoff, xem danh sách đơn cá nhân, sửa/hủy đơn đúng điều kiện và cho admin đổi trạng thái theo ma trận hợp lệ.

#### Yêu cầu chức năng
- [ ] `POST /api/orders` tạo đơn trước cutoff
- [ ] `GET /api/orders/my` xem danh sách đơn của tôi
- [ ] `PATCH /api/orders/:id` sửa đơn của chính mình khi còn `pending`
- [ ] `PATCH /api/orders/:id/cancel` hủy đơn của chính mình khi còn `pending`
- [ ] `GET /api/admin/orders` xem toàn bộ đơn theo filter session/date
- [ ] `PATCH /api/admin/orders/:id/status` đổi trạng thái theo ma trận chốt
- [ ] Tính `debt_amount = max(item_price - company_subsidy, 0)` và snapshot giá/trợ cấp

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Order Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `orders` | `user_id`, `session_id`, `status`, `subtotal`, `subsidy`, `debt_amount`, `is_self_cook`, `cancelled_at`, `cancelled_by` | index theo `user_id`, `session_id` | Đơn hàng |
| `order_items` | `order_id`, `item_id`, `quantity`, `note`, `price_snapshot` | `quantity > 0` | Chi tiết món |
| `order_status_history` | `order_id`, `from_status`, `to_status`, `changed_by` | index theo `order_id` | Lịch sử trạng thái |

- **Index cần tạo:** `orders.user_id`, `orders.session_id`, `orders.status`, `order_items.order_id`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/orders` | Bearer JWT + approved | Tạo đơn |
| GET | `/api/orders/my` | Bearer JWT + approved | Đơn của tôi |
| PATCH | `/api/orders/:id` | Bearer JWT + approved | Sửa đơn |
| PATCH | `/api/orders/:id/cancel` | Bearer JWT + approved | Hủy đơn |
| GET | `/api/admin/orders` | Bearer JWT + admin | Danh sách đơn |
| PATCH | `/api/admin/orders/:id/status` | Bearer JWT + admin | Đổi trạng thái |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Order Service, Order User/Admin MFE

#### Yêu cầu bảo mật
- [ ] User chỉ sửa/hủy đơn của chính mình
- [ ] Chặn tạo hoặc sửa sau cutoff
- [ ] Chỉ cho phép trạng thái chuyển đúng ma trận

#### Yêu cầu phi chức năng
- **Hiệu năng:** Tạo đơn phản hồi nhanh trong tải nội bộ
- **Khả năng mở rộng:** Có thể thêm item snapshot hoặc order note sau này
- **Logging & Monitoring:** Log tạo/sửa/hủy/đổi trạng thái
- **Xử lý lỗi:** Trả `403`, `404`, `409`, `422` rõ ràng theo tình huống

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Tạo đơn ra đúng debt và snapshot
- [ ] User sửa/hủy đúng điều kiện
- [ ] Admin đổi trạng thái đúng ma trận

---

### TASK-011: WebSocket hub và broadcast sự kiện order/payment

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Trung bình
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** TASK-010

#### Mô tả
Thiết lập lớp realtime để admin nhận đơn mới, đổi trạng thái đơn và thay đổi liên quan tới thanh toán theo thời gian thực.

#### Yêu cầu chức năng
- [ ] Kết nối `WebSocket /ws` hoặc endpoint realtime tương đương
- [ ] Broadcast `new_order`
- [ ] Broadcast `order_status_changed`
- [ ] Sẵn sàng nhận thêm `payment_confirmed` từ Payment Service

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Realtime Hub / dùng chung PostgreSQL nếu cần log tối thiểu
- **Bảng / Collection:** Không bắt buộc thêm bảng
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không bắt buộc

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/ws` | Bearer JWT | Kết nối realtime |
| POST | `/api/internal/realtime/events` | Service-to-service | Nhận event từ service khác nếu cần |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gorilla WebSocket hoặc tương đương
- **Giao thức:** WebSocket
- **Microservice / Micro-frontend liên quan:** Order Service, Payment Service, Admin MFE

#### Yêu cầu bảo mật
- [ ] Chỉ client đã đăng nhập mới được kết nối
- [ ] Token handshake phải được kiểm tra
- [ ] Không phát tán dữ liệu nhạy cảm trong payload event

#### Yêu cầu phi chức năng
- **Hiệu năng:** Broadcast dưới 1 giây trong mạng nội bộ
- **Khả năng mở rộng:** Có thể thêm topic mới mà không sửa nhiều code client
- **Logging & Monitoring:** Ghi số lượng client và reconnect
- **Xử lý lỗi:** Mất kết nối thì client có cơ chế fallback

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Admin nhận event đơn mới realtime
- [ ] Event đổi trạng thái cập nhật đúng màn hình
- [ ] Có đường fallback nếu WebSocket chập chờn

---

### TASK-012: MFE user đặt món và danh sách đơn của tôi

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Cao
**Ước tính:** 8h
**Người nhận:** —
**Phụ thuộc:** TASK-005, TASK-010

#### Mô tả
Xây dựng màn hình user cho phép xem session active, xem menu, tạo đơn và xem/sửa/hủy đơn của chính mình.

#### Yêu cầu chức năng
- [ ] Chỉ hiển thị cho user approved
- [ ] Chọn session active và menu tương ứng
- [ ] Tạo đơn trong tối đa 3 bước
- [ ] Hiển thị debt phát sinh ngay sau khi đặt
- [ ] Cho phép xem và thao tác đơn của tôi khi còn pending

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh dữ liệu riêng
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/sessions/active` | Bearer JWT + approved | Lấy session active |
| GET | `/api/sessions/:id/menu` | Bearer JWT + approved | Lấy menu |
| POST | `/api/orders` | Bearer JWT + approved | Tạo đơn |
| GET | `/api/orders/my` | Bearer JWT + approved | Danh sách đơn |
| PATCH | `/api/orders/:id` | Bearer JWT + approved | Sửa đơn |
| PATCH | `/api/orders/:id/cancel` | Bearer JWT + approved | Hủy đơn |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React + Router + Query client
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Order MFE, Auth MFE

#### Yêu cầu bảo mật
- [ ] Chỉ user approved truy cập
- [ ] Không cho sửa/hủy nếu không phải chủ đơn
- [ ] Khóa action sau cutoff rõ ràng trên UI

#### Yêu cầu phi chức năng
- **Hiệu năng:** Tải menu và danh sách đơn mượt trên mobile
- **Khả năng mở rộng:** Component card/table tái sử dụng được
- **Logging & Monitoring:** Theo dõi error submit và timeout
- **Xử lý lỗi:** Giữ nguyên dữ liệu form khi call API fail

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Đặt món thành công trong luồng ngắn gọn
- [ ] Sửa/hủy chỉ hiện khi đủ điều kiện
- [ ] UI bám sát screen ORDER

---

### TASK-013: MFE admin quản lý session, menu và order board

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Cao
**Ước tính:** 8h
**Người nhận:** —
**Phụ thuộc:** TASK-009, TASK-010

#### Mô tả
Xây dựng giao diện vận hành cho admin gồm quản lý session/menu và bảng đơn để cập nhật trạng thái theo nghiệp vụ.

#### Yêu cầu chức năng
- [ ] CRUD session và menu trên từng route rõ ràng
- [ ] Hiển thị order board theo session/date
- [ ] Chuyển trạng thái đơn theo ma trận hợp lệ
- [ ] Hiển thị badge trạng thái đồng nhất với design system

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh dữ liệu riêng
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET/POST/PATCH/DELETE | `/api/admin/sessions...` | Bearer JWT + admin | CRUD session |
| GET/POST/PATCH/DELETE | `/api/admin/categories...` | Bearer JWT + admin | CRUD category |
| GET/POST/PATCH/DELETE | `/api/admin/items...` | Bearer JWT + admin | CRUD item |
| GET | `/api/admin/orders` | Bearer JWT + admin | Danh sách đơn |
| PATCH | `/api/admin/orders/:id/status` | Bearer JWT + admin | Cập nhật trạng thái |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React + Router + Table UI
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Order/Admin MFE

#### Yêu cầu bảo mật
- [ ] Chỉ admin truy cập được route
- [ ] Action nguy hiểm phải có confirm dialog
- [ ] Không cho chuyển trạng thái sai ma trận

#### Yêu cầu phi chức năng
- **Hiệu năng:** Bảng lớn vẫn thao tác được mượt
- **Khả năng mở rộng:** Có thể tách từng route thành micro-frontend riêng
- **Logging & Monitoring:** Ghi lỗi cập nhật trạng thái
- **Xử lý lỗi:** Hiển thị fallback khi API lỗi

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Route admin vận hành ổn định
- [ ] Bảng order phản ánh đúng trạng thái mới
- [ ] UI đúng chuẩn ADMIN screen

---

### TASK-014: Client realtime và cơ chế fallback refresh

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Order
**Sprint:** 2
**Ưu tiên:** Trung bình
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** TASK-011, TASK-013

#### Mô tả
Kết nối WebSocket ở phía frontend, nhận thông báo realtime cho admin và tự động fallback sang refresh thủ công khi kết nối mất ổn định.

#### Yêu cầu chức năng
- [ ] Kết nối websocket sau khi login
- [ ] Nhận event `new_order`, `order_status_changed`, `payment_confirmed`
- [ ] Tự reconnect khi mất kết nối
- [ ] Cho phép refresh thủ công danh sách khi realtime gián đoạn

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/ws` | Bearer JWT | Kết nối realtime |
| GET | `/api/admin/orders` | Bearer JWT + admin | Fallback refresh dữ liệu |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React hook + WebSocket client
- **Giao thức:** WebSocket + REST fallback
- **Microservice / Micro-frontend liên quan:** Order/Admin MFE

#### Yêu cầu bảo mật
- [ ] Không mở websocket nếu token không hợp lệ
- [ ] Không lưu payload nhạy cảm vào local state dài hạn

#### Yêu cầu phi chức năng
- **Hiệu năng:** Reconnect có backoff hợp lý
- **Khả năng mở rộng:** Dễ thêm event mới
- **Logging & Monitoring:** Theo dõi số lần reconnect và lỗi socket
- **Xử lý lỗi:** Fallback polling khi websocket không ổn định

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Realtime hoạt động trên admin board
- [ ] Có fallback rõ ràng khi mất kết nối
- [ ] User không bị đơ giao diện khi socket chập chờn