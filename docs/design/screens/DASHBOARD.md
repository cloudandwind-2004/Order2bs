# Screen Spec - DASHBOARD

## 1. Mục tiêu màn hình
- Mục tiêu: cho admin xem nhanh KPI vận hành và biểu đồ theo tháng.
- Actor: Admin.
- Luồng chính:
  1. Mở dashboard trong shell admin.
  2. Xem KPI cards và chart 12 tháng.
  3. Đổi năm để xem dữ liệu năm khác.

## 2. Cấu trúc layout

```mermaid
block-beta
  columns 1
  Header[Header: dashboard title + year filter]
  KpiRow[KPI cards: users, pending, orders, debt, spent]
  Chart[Monthly chart area]
  Note[Note: không có KPI mới ngoài bộ hiện tại]
```

## 3. Danh sách component trên màn hình

| Component | Vị trí | Variant | Hành vi | Ghi chú |
|---|---|---|---|---|
| `YearFilter` | Header | select | Chọn năm thống kê | Mặc định năm hiện tại |
| `KpiCard` | KpiRow | surface | Hiển thị số liệu tổng hợp | Không mở rộng KPI mới |
| `MonthlyChart` | Chart | chart | Hiển thị 12 tháng, tháng rỗng = 0 | Chuẩn timezone `Asia/Ho_Chi_Minh` |
| `EmptyState` | Chart | empty | Hiển thị khi toàn năm không có dữ liệu | Có CTA reload |
| `ErrorPanel` | Chart | error | Báo lỗi API dashboard | Có nút thử lại |

## 4. Trạng thái và tương tác quan trọng
- Loading: skeleton cho KPI và chart.
- Đổi năm: chỉ reload dataset chart, không làm mất KPI summary.
- Không có dữ liệu: chart vẫn hiển thị 12 tháng với giá trị 0.
- Lỗi API: hiển thị panel lỗi cục bộ và cho phép tải lại.

## 5. Validation + thông báo lỗi chính

| Trường/Ngữ cảnh | Rule | Thông báo lỗi đề xuất |
|---|---|---|
| `year` | số 4 chữ số hợp lệ | Năm thống kê không hợp lệ |
| API `403` | không phải admin | Bạn không có quyền truy cập dashboard |
| API `500` | lỗi tổng hợp dữ liệu | Hệ thống đang bận, vui lòng thử lại |

## 6. Mapping API/SRS liên quan

| Tác vụ UI | Endpoint/API | Tham chiếu SRS |
|---|---|---|
| Xem KPI summary | `GET /api/admin/dashboard/summary` | `SRS-dashboard.md` - DASH-01 |
| Xem dữ liệu tháng | `GET /api/admin/dashboard/monthly?year=` | `SRS-dashboard.md` - DASH-02 |

## 7. Acceptance checklist cho Frontend

- [ ] Hiển thị đầy đủ KPI cards theo dữ liệu backend.
- [ ] Chart luôn có 12 tháng, tháng rỗng hiển thị 0.
- [ ] Filter năm hoạt động đúng và giữ nguyên KPI summary.
- [ ] Xử lý đầy đủ loading, empty, error state.
- [ ] Giao diện phù hợp route admin hiện có.

---

Cập nhật lần cuối: 2026-04-23