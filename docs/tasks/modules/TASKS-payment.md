# 📝 Task Module: Payment

## Tổng quan module

Module Payment phụ trách công nợ, yêu cầu thanh toán QR, xác nhận thanh toán và cấu hình QR ngân hàng. Tất cả yêu cầu phải bám sát SRS-payment, trong đó bằng chứng thanh toán là bắt buộc và số tiền được phân bổ vào debt theo FIFO khi admin confirm.

---

### TASK-015: API Debt và tổng hợp công nợ

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Payment
**Sprint:** 3
**Ưu tiên:** Cao
**Ước tính:** 5h
**Người nhận:** —
**Phụ thuộc:** TASK-010

#### Mô tả
Phát sinh debt tự động từ order hợp lệ, cho user xem công nợ cá nhân và cho admin xem tổng nợ chưa thanh toán để đối soát.

#### Yêu cầu chức năng
- [ ] Tự động tạo debt khi order có `debt_amount > 0`
- [ ] `GET /api/debts/my` cho user đã approved
- [ ] `GET /api/admin/debts` cho admin đối soát
- [ ] Hỗ trợ trạng thái paid/unpaid và số tiền đã cấn trừ

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Payment Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `debts` | `user_id`, `order_id`, `amount`, `paid_amount`, `is_paid`, `paid_at` | index theo `user_id`, `is_paid` | Công nợ |
| `debt_ledger` (nếu cần) | `debt_id`, `source`, `amount`, `created_at` | dùng cho audit | Nhật ký cấn trừ |

- **Index cần tạo:** `debts.user_id`, `debts.is_paid`, `debts.order_id`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/debts/my` | Bearer JWT + approved | Công nợ cá nhân |
| GET | `/api/admin/debts` | Bearer JWT + admin | Công nợ hệ thống |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Payment Service, Payment MFE, Dashboard Service

#### Yêu cầu bảo mật
- [ ] User chỉ xem debt của chính mình
- [ ] Admin-only cho danh sách hệ thống
- [ ] Không cho sửa debt thủ công ngoài luồng thanh toán

#### Yêu cầu phi chức năng
- **Hiệu năng:** Danh sách debt có phân trang hoặc giới hạn mặc định
- **Khả năng mở rộng:** Có thể thêm nguồn debt khác sau này
- **Logging & Monitoring:** Log mỗi lần debt được sinh hoặc cấn trừ
- **Xử lý lỗi:** Đảm bảo idempotent khi order event được đẩy lặp

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Debt sinh đúng theo order
- [ ] User xem đúng dữ liệu của mình
- [ ] Admin có thể đối soát theo trạng thái

---

### TASK-016: API Payment — tạo yêu cầu, confirm và phân bổ FIFO

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Payment
**Sprint:** 3
**Ưu tiên:** Cao
**Ước tính:** 8h
**Người nhận:** —
**Phụ thuộc:** TASK-015

#### Mô tả
Cho phép user tạo yêu cầu thanh toán kèm bằng chứng, admin duyệt payment pending và hệ thống phân bổ số tiền vào debt theo FIFO.

#### Yêu cầu chức năng
- [ ] `POST /api/payments` tạo yêu cầu thanh toán với proof bắt buộc
- [ ] `GET /api/payments/my` xem lịch sử payment của user
- [ ] `POST /api/admin/payments/:id/confirm` xác nhận payment
- [ ] Phân bổ tiền vào debt cũ trước mới sau theo FIFO
- [ ] Lưu metadata chứng từ và thời gian giữ 12 tháng

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Payment Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `payments` | `user_id`, `amount`, `status`, `note`, `proof_url`, `confirmed_by`, `confirmed_at` | `amount > 0` | Payment request |
| `payment_proofs` | `payment_id`, `file_name`, `mime_type`, `size`, `storage_key` | giữ 12 tháng | Metadata chứng từ |
| `payment_allocations` | `payment_id`, `debt_id`, `amount_allocated` | FIFO trace | Phân bổ tiền |

- **Index cần tạo:** `payments.user_id`, `payments.status`, `payment_allocations.debt_id`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/payments` | Bearer JWT + approved | Tạo payment pending |
| GET | `/api/payments/my` | Bearer JWT + approved | Lịch sử payment |
| GET | `/api/admin/payments` | Bearer JWT + admin | Danh sách payment pending |
| POST | `/api/admin/payments/:id/confirm` | Bearer JWT + admin | Xác nhận payment |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Payment Service, Payment MFE, Admin Shell

#### Yêu cầu bảo mật
- [ ] Proof thanh toán là bắt buộc
- [ ] Kiểm tra mime type và dung lượng file
- [ ] Chỉ admin xác nhận payment
- [ ] Không confirm trùng payment đã confirmed

#### Yêu cầu phi chức năng
- **Hiệu năng:** Xử lý xác nhận payment ổn định trong giờ cao điểm
- **Khả năng mở rộng:** Có thể thêm phương thức thanh toán khác sau này
- **Logging & Monitoring:** Log mọi lần confirm và số debt được cấn trừ
- **Xử lý lỗi:** Giao dịch confirm phải nguyên tử, không cấn trừ nửa chừng

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Tạo payment luôn ở trạng thái pending
- [ ] Confirm thành công cấn trừ debt theo FIFO
- [ ] UI nhận được cập nhật kịp thời sau confirm

---

### TASK-017: API QR ngân hàng và quy tắc chứng từ thanh toán

**Trạng thái:** ⬜ TODO
**Loại:** Backend
**Module:** Payment
**Sprint:** 3
**Ưu tiên:** Cao
**Ước tính:** 4h
**Người nhận:** —
**Phụ thuộc:** TASK-003

#### Mô tả
Cho phép admin cấu hình QR ngân hàng đang active và cung cấp QR đó cho user xem khi thanh toán.

#### Yêu cầu chức năng
- [ ] Upload/cập nhật QR ngân hàng active
- [ ] Vô hiệu hóa QR cũ khi có QR mới
- [ ] Cho user lấy QR active để thanh toán
- [ ] Lưu lịch sử cấu hình cơ bản phục vụ truy xuất

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Payment Service
- **Bảng và trường:**

| Bảng | Trường | Ràng buộc | Mô tả |
|---|---|---|---|
| `bank_qr_settings` | `bank_name`, `account_no`, `account_name`, `qr_image_url`, `is_active`, `updated_by` | chỉ 1 bản ghi active | QR hiện tại |

- **Index cần tạo:** `bank_qr_settings.is_active`
- **Migration cần thiết:** Có

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/bank-qr` | Bearer JWT + approved | Lấy QR active |
| GET | `/api/admin/settings/bank-qr` | Bearer JWT + admin | Xem cấu hình QR |
| POST | `/api/admin/settings/bank-qr` | Bearer JWT + admin | Tạo/cập nhật QR |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** Go
- **Framework:** Gin + GORM
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Payment Service, Payment/Admin MFE

#### Yêu cầu bảo mật
- [ ] Chỉ admin thay QR
- [ ] User chỉ đọc QR active
- [ ] Không công khai dữ liệu nội bộ ngoài QR cần hiển thị

#### Yêu cầu phi chức năng
- **Hiệu năng:** Trả QR nhanh, ít truy vấn
- **Khả năng mở rộng:** Có thể thêm nhiều account/bank sau này
- **Logging & Monitoring:** Ghi log thay đổi QR
- **Xử lý lỗi:** Không được để trạng thái không có QR active mà không báo

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] Mỗi thời điểm chỉ có 1 QR active
- [ ] User xem được QR đúng trên màn hình thanh toán
- [ ] Admin cập nhật QR qua UI thành công

---

### TASK-018: MFE user xem nợ, QR và nộp chứng từ

**Trạng thái:** ⬜ TODO
**Loại:** Frontend
**Module:** Payment
**Sprint:** 3
**Ưu tiên:** Cao
**Ước tính:** 7h
**Người nhận:** —
**Phụ thuộc:** TASK-005, TASK-016, TASK-017

#### Mô tả
Xây dựng màn hình công nợ và thanh toán QR cho user, trong đó proof upload là bắt buộc trước khi gửi yêu cầu thanh toán.

#### Yêu cầu chức năng
- [ ] Hiển thị tổng nợ và danh sách debt cá nhân
- [ ] Hiển thị QR ngân hàng active
- [ ] Cho phép upload chứng từ thanh toán
- [ ] Tạo payment pending từ form UI
- [ ] Hiển thị lịch sử payment pending/confirmed

#### Thiết kế cơ sở dữ liệu

- **Service sở hữu data:** Không phát sinh
- **Bảng / Collection:** Không có
- **Index cần tạo:** Không có
- **Migration cần thiết:** Không

#### Thiết kế API

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/debts/my` | Bearer JWT + approved | Xem debt |
| GET | `/api/bank-qr` | Bearer JWT + approved | Xem QR |
| POST | `/api/payments` | Bearer JWT + approved | Gửi payment |
| GET | `/api/payments/my` | Bearer JWT + approved | Lịch sử payment |

#### Giao thức & Công nghệ
- **Ngôn ngữ:** TypeScript
- **Framework:** React + file upload UI
- **Giao thức:** REST
- **Microservice / Micro-frontend liên quan:** Payment MFE, Auth MFE

#### Yêu cầu bảo mật
- [ ] Chỉ user approved truy cập
- [ ] Bắt buộc proof trước khi submit
- [ ] Chặn file sai định dạng hoặc vượt dung lượng

#### Yêu cầu phi chức năng
- **Hiệu năng:** Upload rõ tiến trình và trạng thái
- **Khả năng mở rộng:** Component debt table tái sử dụng được
- **Logging & Monitoring:** Theo dõi lỗi upload và submit payment
- **Xử lý lỗi:** Giữ form khi API lỗi hoặc upload thất bại

#### Tiêu chí hoàn thành (Definition of Done)
- [ ] User xem được debt và QR đúng dữ liệu
- [ ] Proof upload bắt buộc hoạt động
- [ ] Payment history phản ánh pending/confirmed