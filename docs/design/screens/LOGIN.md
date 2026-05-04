# Screen Spec - LOGIN

## 1. Mục tiêu màn hình
- Mục tiêu: cho người dùng đăng nhập nhanh, nhận phản hồi lỗi rõ ràng và điều hướng đúng vai trò/trạng thái tài khoản.
- Actor: User (chưa đăng nhập), Admin (đăng nhập vào khối quản trị).
- Luồng chính:
  1. Nhập số điện thoại + mật khẩu.
  2. Gửi đăng nhập.
  3. Điều hướng sau đăng nhập:
     - `approved + user` -> màn hình ORDER.
     - `approved + admin` -> màn hình ADMIN.
     - `pending/rejected` -> màn hình Pending Approval.

## 2. Cấu trúc layout

```mermaid
block-beta
  columns 1
  Brand[Brand + thông điệp ngắn]
  LoginForm[Form đăng nhập]
  Footer[Link đăng ký + hỗ trợ]
```

### Thành phần layout
- Header: logo, tên hệ thống, mô tả 1 dòng.
- Body: form đăng nhập 2 trường + CTA chính.
- Footer: link đăng ký, thông tin liên hệ admin khi tài khoản chưa được duyệt.

## 3. Danh sách component trên màn hình

| Component | Vị trí | Variant | Hành vi | Ghi chú |
|---|---|---|---|---|
| `TextInput(phone)` | Form body | default/error | Nhận số điện thoại, trim khoảng trắng đầu/cuối | Bắt buộc |
| `PasswordInput` | Form body | default/error | Toggle ẩn/hiện mật khẩu | Bắt buộc |
| `Button(Login)` | Form footer | primary | Submit form | Trạng thái `loading` khi gọi API |
| `InlineError` | Trên nút Login | error | Hiển thị lỗi API hoặc validate | Ưu tiên thông điệp ngắn |
| `Link(Register)` | Footer | ghost link | Điều hướng trang đăng ký | Không mở tab mới |

## 4. Trạng thái và tương tác quan trọng
- Default: form sẵn sàng nhập, nút Login enable khi đủ dữ liệu tối thiểu.
- Loading submit: khóa toàn bộ input + nút để tránh submit lặp.
- Sai thông tin (`401`): hiện lỗi ngay trên form, giữ nguyên dữ liệu phone.
- Bị khóa tạm (`423`): hiển thị thông báo có thời gian chờ 15 phút.
- Tài khoản pending/rejected: sau login thành công, route guard chuyển về màn hình Pending.
- Lỗi mạng: hiển thị thông báo retry, không xóa dữ liệu người dùng đã nhập.

## 5. Validation + thông báo lỗi chính

| Trường/Ngữ cảnh | Rule | Thông báo lỗi đề xuất |
|---|---|---|
| `phone` | required | Vui lòng nhập số điện thoại |
| `password` | required | Vui lòng nhập mật khẩu |
| API `401` | Sai thông tin đăng nhập | Số điện thoại hoặc mật khẩu không đúng |
| API `423` | Quá 5 lần sai/15 phút | Tài khoản đang tạm khóa 15 phút, vui lòng thử lại sau |
| API `500` | Lỗi hệ thống | Hệ thống đang bận, vui lòng thử lại |
| Network timeout | Không kết nối được API | Không thể kết nối máy chủ, vui lòng thử lại |

## 6. Mapping API/SRS liên quan

| Tác vụ UI | Endpoint/API | Tham chiếu SRS |
|---|---|---|
| Đăng nhập | `POST /api/auth/login` | `SRS-auth.md` - AUTH-03, mục API 5.1 |
| Lấy thông tin user hiện tại | `GET /api/auth/me` | `SRS-auth.md` - AUTH-04 |
| Điều hướng pending/rejected | Route guard theo `status` trong token/`me` | `SRS-auth.md` - AUTH-05, AUTH-07 |

## 7. Acceptance checklist cho Frontend

- [ ] Form có đầy đủ trạng thái `default/loading/error`.
- [ ] Không thể submit khi thiếu `phone` hoặc `password`.
- [ ] Xử lý đúng response `401`, `423`, `500`, timeout mạng.
- [ ] Login thành công điều hướng đúng theo role/status.
- [ ] Không lộ thông tin nhạy cảm trong thông báo lỗi.
- [ ] Truy cập bằng bàn phím (Tab/Enter) hoạt động đầy đủ.

---

Cập nhật lần cuối: 2026-04-23
