# Screen Spec - PAYMENT

## 1. Mục tiêu màn hình
- Mục tiêu: cho user xem công nợ, xem QR thanh toán, tạo yêu cầu thanh toán và theo dõi trạng thái payment.
- Actor: User đã được duyệt.
- Luồng chính:
  1. Mở trang công nợ.
  2. Xem danh sách debt và tổng nợ.
  3. Quét QR, upload bằng chứng thanh toán và gửi yêu cầu.
  4. Theo dõi payment ở trạng thái pending/confirmed.

## 2. Cấu trúc layout

```mermaid
block-beta
  columns 1
  Header[Header: tổng nợ + trạng thái thanh toán]
  TwoCol[2 cột: Debt summary | QR + proof upload]
  History[Payment history table]
```

## 3. Danh sách component trên màn hình

| Component | Vị trí | Variant | Hành vi | Ghi chú |
|---|---|---|---|---|
| `DebtSummaryCard` | Header/TwoCol | surface | Hiển thị tổng nợ và số khoản chưa thanh toán | Số tiền định dạng VND |
| `DebtListTable` | TwoCol | table | Liệt kê debt theo thứ tự cũ đến mới | Phục vụ quy tắc FIFO |
| `QRCodePanel` | TwoCol | preview | Hiển thị QR ngân hàng active | Có nút phóng to |
| `ProofUploadField` | TwoCol | file-upload | Upload JPG/PNG/WEBP/PDF | Bắt buộc có proof |
| `PaymentRequestModal` | Overlay | modal-md | Nhập amount/note rồi gửi request | Kiểm tra dung lượng file |
| `PaymentHistoryTable` | History | table | Hiển thị payment pending/confirmed | Có status chip |

## 4. Trạng thái và tương tác quan trọng
- Loading: skeleton cho debt, QR, history.
- Empty debt: hiển thị thông báo không có công nợ cần thanh toán.
- Proof thiếu/không hợp lệ: báo lỗi ngay tại vùng upload.
- Gửi payment thành công: hiển thị trạng thái pending và cập nhật history.
- Admin confirm xong: status đổi sang confirmed và debt được cấn trừ theo FIFO.

## 5. Validation + thông báo lỗi chính

| Trường/Ngữ cảnh | Rule | Thông báo lỗi đề xuất |
|---|---|---|
| `amount` | > 0 | Số tiền thanh toán không hợp lệ |
| `proof_file` | bắt buộc, đúng định dạng, <= 5MB | Vui lòng tải lên bằng chứng hợp lệ |
| `proof_file` | chỉ JPG/PNG/WEBP/PDF | Định dạng tệp không được hỗ trợ |
| API `403` | user chưa approved | Bạn chưa có quyền thao tác thanh toán |
| API `409` | payment đã confirm | Thanh toán đã được xác nhận trước đó |

## 6. Mapping API/SRS liên quan

| Tác vụ UI | Endpoint/API | Tham chiếu SRS |
|---|---|---|
| Xem debt cá nhân | `GET /api/debts/my` | `SRS-payment.md` - PAY-02 |
| Xem QR active | `GET /api/bank-qr` | `SRS-payment.md` - PAY-04 |
| Tạo payment pending | `POST /api/payments` | `SRS-payment.md` - PAY-05 |
| Xem lịch sử payment | `GET /api/payments/my` | `SRS-payment.md` - API 5.1 |

## 7. Acceptance checklist cho Frontend

- [ ] User approved truy cập được màn hình và xem đúng công nợ của mình.
- [ ] Proof thanh toán là bắt buộc trước khi gửi payment.
- [ ] Xử lý đúng trạng thái pending và confirmed.
- [ ] File upload chặn đúng định dạng và giới hạn 5MB.
- [ ] Hiển thị rõ thứ tự debt để phù hợp quy tắc FIFO phía backend.

---

Cập nhật lần cuối: 2026-04-23