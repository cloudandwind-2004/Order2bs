---
description: Prompt mẫu để giao task cho từng loại Agent trong GitHub Copilot
---

# 💬 Prompt Templates — GitHub Copilot Agents

Copy các prompt sau vào **GitHub Copilot Chat** để giao việc cho agent phù hợp.

---

## 🔧 Backend — Senior Backend Programmer

### Prompt: Bắt đầu 1 task backend cụ thể
```
@senior-backend-programmer

Dự án: Lunch Order System (Golang + Gin + PostgreSQL + GORM)
Task cần làm: TASK-001

Hãy:
1. Đọc docs/tasks/ARCHITECTURE.md để hiểu tech stack
2. Đọc docs/tasks/modules/TASKS-auth.md để biết chi tiết TASK-001
3. Cập nhật trạng thái TASK-001 → 🔵 IN PROGRESS trong docs/tasks/TASK-INDEX.md
4. Triển khai code theo đúng cấu trúc thư mục trong ARCHITECTURE.md
5. Sau khi xong, cập nhật trạng thái → 🟡 REVIEW
```

### Prompt: Implement toàn bộ Sprint 1 Backend
```
@senior-backend-programmer

Dự án: Lunch Order System
Nhiệm vụ: Triển khai tất cả task Backend trong Sprint 1.

Đọc tài liệu:
- docs/tasks/ARCHITECTURE.md
- docs/tasks/TASK-INDEX.md (lấy danh sách TASK Backend Sprint 1)
- docs/tasks/modules/TASKS-auth.md

Thực hiện lần lượt theo thứ tự phụ thuộc:
TASK-001 → TASK-002 → TASK-003 → TASK-004

Với mỗi task: cập nhật trạng thái IN PROGRESS khi bắt đầu, REVIEW khi xong.
```

---

## 🎨 Frontend — Senior Frontend Programmer

### Prompt: Build trang Login/Register
```
@senior-frontend-programmer

Dự án: Lunch Order System (React 18 + TypeScript + Vite)
Task cần làm: TASK-005 — Trang Login & Register UI

Hãy:
1. Đọc docs/tasks/ARCHITECTURE.md (frontend structure)
2. Đọc docs/tasks/modules/TASKS-auth.md (chi tiết TASK-005)
3. Dùng design system màu hồng (#FF6B9D) và vàng nhạt (#FFF5CC)
4. Tạo components: LoginForm, RegisterForm, AuthLayout
5. Lưu JWT vào localStorage sau login thành công
6. Redirect về /dashboard sau khi login
7. Cập nhật trạng thái TASK-005 trong TASK-INDEX.md
```

### Prompt: Build toàn bộ UI Sprint 1
```
@senior-frontend-programmer

Dự án: Lunch Order System
Nhiệm vụ: Build tất cả UI trong Sprint 1.

Đọc: docs/tasks/ARCHITECTURE.md và docs/tasks/modules/TASKS-auth.md

Thực hiện:
- TASK-006: Setup design system (CSS variables, fonts Inter/Nunito, color palette)
- TASK-005: Build trang Login + Register (sau khi TASK-006 xong)

Design system:
- Primary: #FF6B9D (hồng)
- Secondary: #FFD93D (vàng)
- Background: #FFF5F8 (hồng nhạt)
- Font: 'Nunito' từ Google Fonts
```

---

## 🏗️ DevOps — Senior DevOps

### Prompt: Setup Docker Compose
```
@senior-devops

Dự án: Lunch Order System
Task cần làm: TASK-007 — Docker Compose setup

Đọc:
- docs/tasks/ARCHITECTURE.md (xem phần Infra)
- docs/tasks/modules/ (hiểu services cần chạy)
- docker-compose.yml hiện tại (để review và cải thiện)

Yêu cầu:
1. Service `db`: PostgreSQL 16, volume persist data
2. Service `backend`: Go app, build từ backend/Dockerfile
3. Service `frontend`: React app, build từ frontend/Dockerfile + Nginx
4. Health check cho db và backend
5. Đảm bảo thứ tự khởi động: db → backend → frontend
```

### Prompt: Setup GitHub Actions CI/CD
```
@senior-devops

Dự án: Lunch Order System
Task cần làm: TASK-023 — GitHub Actions CI/CD

Tạo workflow .github/workflows/ci.yml với các jobs:
1. `test-backend`: go test ./... (cần PostgreSQL service)
2. `test-frontend`: npm run build
3. `deploy` (nếu push master): docker build + push to registry

Điều kiện trigger: push vào master hoặc pull_request.
```

---

## 🧪 QA — Senior QA

### Prompt: Viết test cho backend Auth
```
@senior-qa

Dự án: Lunch Order System (Golang backend)
Task cần làm: TASK-022 — Unit test backend

Đọc:
- docs/tasks/ARCHITECTURE.md
- docs/tasks/modules/TASKS-auth.md

Viết unit test cho:
1. AuthService: Register, Login (mock DB với sqlmock hoặc testify/mock)
2. OrderService: CreateOrder, validation logic
3. PaymentService: ConfirmPayment

Yêu cầu:
- Coverage ≥ 80% cho service layer
- Test cả happy path và error cases
- Sử dụng `testing` package + `testify/assert`
```

---

## 🎭 UI/UX — Designer

### Prompt: Tạo design system
```
@ui-ux-designer

Dự án: Lunch Order System
Task cần làm: TASK-006 — Design System

Tạo file docs/design/DESIGN-SYSTEM.md với:
1. Color palette: hồng (#FF6B9D), vàng (#FFD93D), background (#FFF5F8), text (#2D2D2D)
2. Typography: Font Nunito (Google Fonts), size scale (12/14/16/20/24/32px)
3. Spacing scale: 4/8/12/16/24/32/48/64px
4. Border radius: 8/12/16/24px
5. Shadow tokens
6. Component specs: Button, Input, Card, Badge, Modal

Sau đó tạo file frontend/src/styles/design-tokens.css với CSS variables.
```

---

## 📊 Technical Leader

### Prompt: Bóc tách task cho module Order
```
@technical-leader

Dự án: Lunch Order System
Yêu cầu: Bóc tách task kỹ thuật chi tiết cho module Order (Đặt món realtime)

Đọc:
- docs/tasks/ARCHITECTURE.md (tech stack đã quyết định)
- docs/tasks/TASK-INDEX.md (task đã có, tránh trùng)

Tạo/cập nhật:
- docs/tasks/modules/TASKS-order.md với task TASK-008 đến TASK-015

Mỗi task cần có: mô tả, API design, DB design, tiêu chí hoàn thành.
```

---

## 📋 Prompt Toàn Cảnh — Bắt Đầu Dự Án Từ Đầu

Dùng khi muốn AI tự lên kế hoạch và bắt đầu dự án:

```
@project-manager

Tôi muốn bắt đầu phát triển dự án Lunch Order System.

Đọc toàn bộ tài liệu trong:
- docs/README.md
- docs/tasks/ARCHITECTURE.md
- docs/tasks/TASK-INDEX.md

Sau đó:
1. Cho tôi biết trạng thái hiện tại của dự án
2. Đề xuất 3 task tiếp theo cần làm (theo thứ tự ưu tiên và phụ thuộc)
3. Gợi ý agent phù hợp cho từng task
4. Tóm tắt những gì đã hoàn thành và còn thiếu
```

---

*Cập nhật lần cuối: 2026-04-23*
