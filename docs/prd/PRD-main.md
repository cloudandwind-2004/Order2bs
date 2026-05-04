# PRD chính — Lunch Order System

## 1. Bối cảnh bài toán

Việc đặt cơm trưa nội bộ hiện đang rời rạc qua nhiều kênh (chat, form thủ công), gây ra các vấn đề:
- Khó kiểm soát phiên đặt món theo ngày và hạn chót đặt.
- Tốn thời gian tổng hợp đơn cho admin.
- Thiếu minh bạch về nợ, trợ cấp công ty và trạng thái thanh toán.
- Thiếu dữ liệu tổng hợp để theo dõi chi tiêu và vận hành.

Hệ thống Lunch Order System được đề xuất để chuẩn hóa toàn bộ quy trình từ đăng ký tài khoản đến đặt món, theo dõi nợ và xác nhận thanh toán.

## 2. Mục tiêu sản phẩm

- Chuẩn hóa quy trình đặt cơm trưa nội bộ theo phiên (meal session).
- Giảm thao tác thủ công cho admin trong duyệt tài khoản, quản lý menu và đơn hàng.
- Minh bạch công nợ từng người dùng, hỗ trợ thanh toán bằng QR.
- Cung cấp dashboard cơ bản để theo dõi vận hành theo tháng.

## 3. Đối tượng người dùng

- Người dùng nhân viên (User): đăng ký tài khoản, đặt món, theo dõi nợ, thanh toán.
- Quản trị viên (Admin): duyệt tài khoản, quản lý phiên ăn/menu, theo dõi và cập nhật đơn, cấu hình QR, xem dashboard.

## 4. Phân tích đối thủ/tương tự (khảo sát web ngày 2026-04-23)

### 4.1 Sản phẩm tham chiếu

1. Fooda
- Nổi bật: mô hình workplace food program, đa lựa chọn nhà hàng, app đặt món.
- Điểm mạnh: trải nghiệm người dùng tốt, mạng lưới nhà hàng lớn.
- Điểm yếu so với bài toán nội bộ: thiên về dịch vụ bên thứ ba, ít tập trung vào nợ nội bộ theo nhân sự.

2. Cater2.me
- Nổi bật: group ordering, chương trình bữa ăn định kỳ, quản lý ngân sách/subsidy.
- Điểm mạnh: phù hợp vận hành doanh nghiệp, có luồng quản trị đội nhóm.
- Điểm yếu so với bài toán nội bộ: phụ thuộc hệ sinh thái đối tác catering và mô hình dịch vụ.

3. Foodsby
- Nổi bật: mô hình giao đồ ăn theo tòa nhà, cutoff time, lựa chọn luân phiên hằng ngày.
- Điểm mạnh: luồng đặt món đơn giản, tập trung hiệu quả vận hành giờ trưa.
- Điểm yếu so với bài toán nội bộ: chưa nhấn mạnh quản trị công nợ và phê duyệt tài khoản nội bộ.

4. Lunchbox
- Nổi bật: order management ở quy mô lớn, open API, catering management.
- Điểm mạnh: nền tảng mở, hỗ trợ tích hợp tốt.
- Điểm yếu so với bài toán nội bộ: định vị enterprise cho chuỗi nhà hàng, phạm vi rộng hơn nhu cầu nội bộ công ty.

5. MealSuite
- Nổi bật: nền tảng quản lý vận hành suất ăn toàn diện, forecasting, procurement.
- Điểm mạnh: quản trị vận hành sâu.
- Điểm yếu so với bài toán nội bộ: tập trung vào healthcare/senior living, độ phức tạp cao cho MVP nội bộ.

### 4.2 Cơ hội khác biệt hóa

- Tập trung đúng bài toán nội bộ công ty: duyệt tài khoản theo vai trò, trợ cấp công ty, công nợ từng nhân viên.
- Triển khai nhanh theo kiến trúc gọn: React + Golang + PostgreSQL + WebSocket.
- Luồng admin tối giản, dễ vận hành hằng ngày, không phụ thuộc đối tác bên ngoài.

## 5. Scope MVP và Out-of-Scope

### 5.1 Scope MVP (theo TASK-INDEX hiện tại)

- Nền tảng người dùng và bảo mật:
  - Đăng ký/đăng nhập/lấy thông tin cá nhân.
  - JWT + phân quyền Admin/User + duyệt tài khoản (SLA tối đa 24h).
- Vận hành đặt món:
  - Quản lý phiên ăn, menu, tạo đơn và cập nhật trạng thái đơn.
  - Hạn chót đặt món cấu hình cố định toàn công ty.
  - Realtime thông báo đơn mới qua WebSocket.
- Công nợ và thanh toán:
  - Tính nợ tự động theo đơn.
  - Thanh toán QR bắt buộc đính kèm bằng chứng thanh toán trước khi admin xác nhận.
- Báo cáo cơ bản:
  - Dashboard tổng hợp theo tháng.
- Nền tảng triển khai:
  - Docker Compose (frontend + backend + database) và CI/CD cơ bản.

### 5.2 Out-of-Scope giai đoạn này

- Tích hợp cổng thanh toán tự động (bank API/PG trung gian).
- Ứng dụng di động native.
- Hệ thống loyalty/reward/phân tích nâng cao bằng AI.
- Multi-tenant đa công ty.

## 6. Danh sách tính năng theo mức ưu tiên

### Must
- Auth cơ bản: Register, Login, Me.
- Duyệt/từ chối tài khoản bởi Admin (SLA xử lý trong 24h).
- JWT middleware và role-based access.
- CRUD phiên ăn và menu.
- Tạo đơn và quản lý trạng thái đơn theo hạn chót đặt món cố định toàn công ty.
- Realtime thông báo đơn mới (WebSocket).
- Tính nợ tự động + màn hình nợ + QR thanh toán kèm bằng chứng bắt buộc.

### Should
- Dashboard tháng (tổng đơn, tổng chi, công nợ), chưa bổ sung KPI mới trong giai đoạn hiện tại.
- Cấu hình QR ngân hàng trong phần quản trị.
- Trải nghiệm Pending Approval rõ ràng cho tài khoản chưa duyệt.

### Could
- Nhắc thanh toán định kỳ (email/chat).
- Export báo cáo CSV cho admin.
- Bộ lọc dashboard theo phòng ban/nhóm người dùng.

## 7. Luồng nghiệp vụ chính cấp sản phẩm

1. Người dùng đăng ký tài khoản.
2. Admin duyệt hoặc từ chối tài khoản trong SLA tối đa 24h.
3. Người dùng đã duyệt đăng nhập và xem phiên ăn đang mở.
4. Người dùng chọn món từ menu và tạo đơn trước hạn chót cố định toàn công ty.
5. Hệ thống áp dụng trợ cấp công ty chung cho toàn bộ người dùng, phát sinh nợ và lưu đơn.
6. Admin theo dõi đơn realtime, cập nhật trạng thái xử lý.
7. Người dùng xem nợ, thanh toán qua QR và đính kèm bằng chứng; admin xác nhận thanh toán.
8. Hệ thống cập nhật dashboard tổng hợp theo kỳ với bộ chỉ số hiện tại.

## 8. Yêu cầu phi chức năng cơ bản

- Hiệu năng:
  - API trọng yếu (auth, order, debt) phản hồi mục tiêu p95 < 500ms trong tải nội bộ thông thường.
- Bảo mật:
  - JWT cho xác thực, phân quyền theo vai trò.
  - Mật khẩu lưu dưới dạng hash (bcrypt).
  - Chỉ admin mới truy cập endpoint quản trị.
- Khả năng mở rộng:
  - Kiến trúc monolith backend, tách rõ handlers/services/models để mở rộng theo module.
  - Cấu hình qua biến môi trường, triển khai Docker Compose.
- Độ tin cậy vận hành:
  - Dữ liệu đơn hàng và công nợ được lưu bền vững trong PostgreSQL.
  - Có khả năng phục hồi service qua container orchestration mức cơ bản (docker compose restart).

## 9. KPI / Success Metrics

- Trong giai đoạn hiện tại, dashboard tháng chưa bổ sung KPI mới ngoài bộ chỉ số dưới đây.
- Tỷ lệ đơn tạo thành công >= 98% trong 30 ngày sau go-live.
- Tỷ lệ tài khoản được duyệt trong 24h >= 95%.
- Tỷ lệ người dùng hoạt động hằng tuần (WAU) >= 70% trong tháng đầu.
- Tỷ lệ đơn có trạng thái được cập nhật đúng vòng đời >= 95%.
- Tỷ lệ công nợ được xác nhận thanh toán trong chu kỳ tháng >= 90%.

## 10. Rủi ro và giả định

### 10.1 Rủi ro

- Admin duyệt tài khoản chậm gây nghẽn onboarding.
- Dữ liệu menu/phiên ăn cập nhật muộn ảnh hưởng trải nghiệm đặt món.
- Realtime gián đoạn có thể làm admin bỏ lỡ đơn mới nếu không có fallback refresh.
- Xác nhận thanh toán thủ công có độ trễ hoặc sai sót thao tác.

### 10.2 Giả định

- Công ty có quy trình duyệt tài khoản rõ ràng và có người phụ trách.
- Mức trợ cấp công ty được cấu hình thống nhất và áp dụng chung cho toàn bộ người dùng (tham chiếu biến COMPANY_SUBSIDY).
- Hạn chót đặt món vận hành theo cấu hình cố định toàn công ty.
- Người dùng có kết nối nội bộ ổn định để sử dụng web app.
- Quy trình đối soát thanh toán hiện tại chấp nhận bước xác nhận thủ công.

## 11. Mốc phát hành đề xuất

- Mốc M0 (2026-04-23): Hoàn tất PRD + User Stories Sprint 1, đạt quality gate tài liệu.
- Mốc M1 (tuần 1-2): Hoàn thành Sprint 1 (nền tảng + auth + docker).
- Mốc M2 (tuần 3-4): Hoàn thành Sprint 2 (đặt món + realtime).
- Mốc M3 (tuần 5-6): Hoàn thành Sprint 3 (nợ + thanh toán QR + dashboard + test + CI/CD).
- Mốc RC/UAT (tuần 7): Kiểm thử chấp nhận người dùng và chốt điều kiện release.

## 12. Quyết định nghiệp vụ đã chốt

1. SLA duyệt tài khoản: tối đa 24h.
2. Trợ cấp công ty: áp dụng chung cho toàn bộ người dùng.
3. Hạn chót đặt món: cố định toàn công ty.
4. Thanh toán QR: bắt buộc đính kèm bằng chứng thanh toán trước khi admin xác nhận.
5. Dashboard tháng: chưa bổ sung KPI mới trong giai đoạn hiện tại; sẽ xem xét ở giai đoạn sau.

---

Cập nhật lần cuối: 2026-04-23