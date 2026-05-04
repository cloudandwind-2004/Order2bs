# Design System MVP - Lunch Order System

## 1. Phạm vi áp dụng
- Áp dụng cho giao diện Web MVP trong phạm vi SRS Auth, Order, Payment, Dashboard và TASK-006.
- Ưu tiên tính rõ ràng nghiệp vụ, tốc độ triển khai FE, và tính nhất quán giữa màn hình user/admin.
- Định hướng thị giác: hồng-vàng (thương hiệu nội bộ), tương phản cao, không hy sinh khả năng đọc.

## 2. Design Principles
1. Nhanh để thao tác: Mọi tác vụ thường xuyên (đăng nhập, đặt món, duyệt đơn) đạt trong tối đa 3 bước.
2. Rõ trạng thái hệ thống: Luôn hiển thị trạng thái loading, empty, error, success rõ ràng.
3. Ưu tiên dữ liệu vận hành: Bảng và chip trạng thái phải đọc nhanh, lọc nhanh, hành động ngay.
4. An toàn thao tác: Hành động rủi ro (reject, cancel, confirm payment) có xác nhận và thông điệp hậu quả.
5. Nhất quán nhưng thực dụng: Dùng một bộ token chung, chỉ tùy biến tối thiểu theo vai trò user/admin.

## 3. Color Tokens

| Token | Giá trị | Mô tả sử dụng |
|---|---|---|
| `color-brand-pink-700` | `#B62459` | Nút primary hover, nhấn mạnh hành động chính |
| `color-brand-pink-600` | `#CC3569` | Nút primary mặc định |
| `color-brand-pink-100` | `#FFE4EE` | Nền highlight nhẹ cho khu vực quan trọng |
| `color-brand-yellow-700` | `#B57A00` | Border/label cảnh báo mức cao |
| `color-brand-yellow-600` | `#D89600` | Nút secondary hover |
| `color-brand-yellow-500` | `#F2B63D` | Nút secondary mặc định, accent |
| `color-brand-yellow-100` | `#FFF4D8` | Nền badge warning, empty state minh họa |
| `color-neutral-0` | `#FFFFFF` | Nền card, modal |
| `color-neutral-50` | `#FFFCF7` | Nền trang mặc định |
| `color-neutral-100` | `#F4ECE3` | Nền section phụ, row zebra |
| `color-neutral-300` | `#D8CEC3` | Border input/table |
| `color-neutral-700` | `#5E534A` | Text phụ, placeholder |
| `color-neutral-900` | `#2E2722` | Text chính |
| `color-success-500` | `#2E7D32` | Thành công (approved, delivered, confirmed) |
| `color-warning-500` | `#B26A00` | Cảnh báo (pending, gần cutoff) |
| `color-error-500` | `#C62828` | Lỗi, rejected, action nguy hiểm |
| `color-info-500` | `#1565C0` | Thông tin trung tính, loading phụ |
| `color-overlay` | `rgba(46, 39, 34, 0.48)` | Overlay cho modal/drawer |

## 4. Typography

Font hệ thống đã chốt:
- Primary UI: `Be Vietnam Pro`, `sans-serif`
- Fallback: khi chưa tải được webfont, dùng sans-serif mặc định của hệ điều hành.
- Token typography:
  - `font-family-base`: `Be Vietnam Pro`, `sans-serif`
  - `font-family-heading`: `Be Vietnam Pro`, `sans-serif`

| Tên style | Font | Size | Weight | Line height | Dùng cho |
|---|---|---|---|---|---|
| `display` | Be Vietnam Pro, sans-serif | 36px | 700 | 44px | Tiêu đề trang lớn |
| `h1` | Be Vietnam Pro, sans-serif | 30px | 700 | 38px | Tiêu đề màn hình |
| `h2` | Be Vietnam Pro, sans-serif | 24px | 700 | 32px | Tiêu đề section |
| `h3` | Be Vietnam Pro, sans-serif | 20px | 600 | 28px | Tiêu đề card/module |
| `body-lg` | Be Vietnam Pro, sans-serif | 16px | 400 | 24px | Nội dung chính |
| `body-md` | Be Vietnam Pro, sans-serif | 14px | 400 | 22px | Nội dung bảng/form |
| `body-sm` | Be Vietnam Pro, sans-serif | 12px | 400 | 18px | Mô tả phụ |
| `label` | Be Vietnam Pro, sans-serif | 14px | 600 | 20px | Label input, button text |

## 5. Spacing, Radius, Shadow

### 5.1 Spacing tokens
- Đơn vị cơ bản: `4px`
- Scale: `space-1=4`, `space-2=8`, `space-3=12`, `space-4=16`, `space-5=20`, `space-6=24`, `space-8=32`, `space-10=40`

### 5.2 Grid & breakpoints
- Desktop: 12 cột, gutter 24px, margin 32px.
- Tablet: 8 cột, gutter 16px, margin 20px.
- Mobile: 4 cột, gutter 12px, margin 16px.

| Breakpoint | Kích thước |
|---|---|
| `sm` | `< 576px` |
| `md` | `>= 576px` |
| `lg` | `>= 768px` |
| `xl` | `>= 1024px` |
| `2xl` | `>= 1280px` |

### 5.3 Radius tokens

| Token | Giá trị | Dùng cho |
|---|---|---|
| `radius-sm` | 6px | Input nhỏ, chip |
| `radius-md` | 10px | Button, card nhỏ |
| `radius-lg` | 14px | Card chính, panel |
| `radius-xl` | 18px | Modal |
| `radius-pill` | 999px | Status chip |

### 5.4 Shadow tokens

| Token | Giá trị | Dùng cho |
|---|---|---|
| `shadow-xs` | `0 1px 2px rgba(46,39,34,0.08)` | Input focus nhẹ |
| `shadow-sm` | `0 4px 10px rgba(46,39,34,0.10)` | Card mặc định |
| `shadow-md` | `0 10px 24px rgba(46,39,34,0.14)` | Dropdown/Popover |
| `shadow-lg` | `0 18px 40px rgba(46,39,34,0.18)` | Modal |

## 6. Component Foundations

### 6.1 Button
- Variants: `primary`, `secondary`, `outline`, `danger`, `ghost`.
- States bắt buộc: `default`, `hover`, `focus-visible`, `disabled`, `loading`.
- Props chuẩn: `variant`, `size` (`sm/md/lg`), `fullWidth`, `leadingIcon`, `trailingIcon`, `isLoading`.
- Quy tắc: chỉ 1 nút primary mỗi cụm hành động để tránh cạnh tranh thị giác.

### 6.2 Input
- Loại: `text`, `password`, `number`, `search`, `textarea`, `select`.
- States: `default`, `focus`, `error`, `disabled`, `readOnly`.
- Props chuẩn: `label`, `placeholder`, `helperText`, `errorText`, `required`, `maxLength`.
- Quy tắc: lỗi hiển thị ngay dưới field, không chỉ đổi màu border.

### 6.3 Card
- Variants: `surface`, `outlined`, `interactive`.
- Props chuẩn: `title`, `subtitle`, `actions`, `isClickable`.
- Quy tắc: card interactive phải có hover elevation và focus ring rõ ràng.

### 6.4 Table
- Thành phần: header sticky, row hover, pagination, filter bar.
- States: `loading rows`, `empty`, `error`, `selected row`.
- Props chuẩn: `columns`, `dataSource`, `sort`, `filter`, `rowActions`.
- Quy tắc: cột trạng thái luôn dùng Status Chip thay vì text thuần.

### 6.5 Modal
- Kích thước: `sm` (xác nhận nhanh), `md` (form), `lg` (preview proof/payment).
- Thành phần: header, body, footer action, close icon.
- Props chuẩn: `title`, `open`, `onConfirm`, `onCancel`, `confirmVariant`.
- Quy tắc: hành động nguy hiểm phải có nút nhấn màu danger + nội dung cảnh báo hậu quả.

### 6.6 Status Chip
- Nhóm semantic: `pending`, `approved`, `rejected`, `confirmed`, `shipping`, `delivered`, `cancelled`, `error`.
- Màu mặc định:
  - `pending`: nền vàng nhạt, text warning.
  - `approved/delivered/confirmed`: nền xanh nhạt, text success.
  - `rejected/cancelled/error`: nền đỏ nhạt, text error.
- Props chuẩn: `status`, `label`, `icon`, `size`.

## 7. Trạng thái UX chuẩn

| Trạng thái | Mẫu hiển thị | Quy tắc |
|---|---|---|
| Loading | Skeleton cho bảng/card, spinner cho nút | Nếu > 400ms mới hiển thị spinner toàn vùng để tránh giật |
| Empty | Icon + tiêu đề + mô tả + CTA | Luôn có hành động kế tiếp (tạo mới, thử lại, liên hệ admin) |
| Error | Banner inline hoặc panel lỗi | Cung cấp thông điệp dễ hiểu + nút retry |
| Success | Toast ngắn hoặc inline success | Dùng cho thao tác hoàn tất: đặt món, duyệt tài khoản, confirm payment |

## 8. Accessibility cơ bản
- Tương phản: text thường đạt tối thiểu 4.5:1, text lớn đạt 3:1.
- Focus keyboard: mọi control tương tác có vòng focus rõ (`2px` + offset).
- Điều hướng bàn phím: Tab order đúng luồng nhìn từ trên xuống.
- Kích thước vùng bấm tối thiểu: `44x44px` cho button/icon action.
- Form accessibility: input bắt buộc có label rõ, liên kết helper/error text bằng `aria-describedby`.
- Không truyền nghĩa chỉ bằng màu: trạng thái phải có icon hoặc nhãn text đi kèm.
- Motion: animation ngắn 120-200ms, hỗ trợ `prefers-reduced-motion`.

---

Cập nhật lần cuối: 2026-04-23
