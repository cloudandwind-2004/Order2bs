---
description: Khởi động và tiếp tục phát triển dự án Lunch Order System
---

# 🚀 Workflow: Bắt Đầu Phiên Làm Việc (Start Session)

Đây là workflow **bắt buộc** khi bắt đầu một phiên làm việc mới với GitHub Copilot Agents.
Thực hiện **đúng thứ tự** các bước dưới đây.

---

## Bước 1 — Đọc tài liệu dự án

Đọc các file sau **trước khi làm bất cứ điều gì**:

```
docs/README.md
docs/tasks/ARCHITECTURE.md
docs/tasks/TASK-INDEX.md
```

Mục tiêu: hiểu kiến trúc hệ thống, công nghệ sử dụng, và trạng thái hiện tại của tất cả task.

---

## Bước 2 — Xác định task cần làm

Mở `docs/tasks/TASK-INDEX.md` và tìm task có trạng thái `⬜ TODO` theo thứ tự ưu tiên:

1. **Sprint 1** (ưu tiên cao nhất — nền tảng)
2. **Sprint 2** (sau khi Sprint 1 hoàn thành)
3. **Sprint 3** (sau khi Sprint 2 hoàn thành)

> ⚠️ Không bắt đầu task mới nếu task phụ thuộc (`Phụ thuộc:`) chưa có trạng thái `🟢 DONE`.

---

## Bước 3 — Chọn đúng Agent

Dựa vào cột **Loại** của task, gọi agent phù hợp:

| Loại task | Agent cần dùng |
|-----------|---------------|
| Backend | `@senior-backend-programmer` |
| Frontend | `@senior-frontend-programmer` |
| DevOps / Docker / CI | `@senior-devops` |
| Testing | `@senior-qa` |
| UI/UX Design | `@ui-ux-designer` |
| Architecture / DB Design | `@technical-leader` |
| Business / Requirements | `@business-analyst` |
| Product planning | `@product-owner` |

---

## Bước 4 — Prompt mẫu để giao task cho Agent

Dùng prompt sau khi chat với agent trong GitHub Copilot:

```
@<tên-agent> Hãy thực hiện <MÃ-TASK> trong dự án Lunch Order System.

Đọc tài liệu tại:
- docs/tasks/ARCHITECTURE.md (kiến trúc tổng thể)
- docs/tasks/TASK-INDEX.md (trạng thái task)
- docs/tasks/modules/TASKS-<module>.md (chi tiết task)

Cập nhật trạng thái task sang 🔵 IN PROGRESS ngay khi bắt đầu.
Sau khi hoàn thành, cập nhật trạng thái sang 🟡 REVIEW.
```

**Ví dụ cụ thể:**

```
@senior-backend-programmer Hãy thực hiện TASK-001 trong dự án Lunch Order System.

Đọc tài liệu tại:
- docs/tasks/ARCHITECTURE.md
- docs/tasks/TASK-INDEX.md
- docs/tasks/modules/TASKS-auth.md

Tech stack: Golang + GORM + PostgreSQL.
Cập nhật trạng thái TASK-001 sang 🔵 IN PROGRESS ngay khi bắt đầu.
```

---

## Bước 5 — Kiểm tra kết quả

Sau khi agent hoàn thành:

1. Kiểm tra code được tạo/sửa
2. Chạy lệnh kiểm tra nhanh:

```bash
# Backend — kiểm tra build
cd backend && go build ./...

# Frontend — kiểm tra build
cd frontend && npm run build

# Docker — khởi động toàn bộ stack
docker compose up -d
```

3. Nếu OK → đổi trạng thái sang `🟢 DONE` trong `docs/tasks/TASK-INDEX.md`

---

## Bước 6 — Commit & Push lên GitHub

```bash
git add .
git commit -m "<loại>(<module>): <mô tả ngắn>

Task: TASK-<ID>
Status: ✅ DONE"
git push origin master
```

**Convention commit message:**
- `feat(auth): add JWT login endpoint` — Tính năng mới
- `fix(order): resolve null pointer in order creation` — Sửa bug
- `chore(docker): update compose file` — Cấu hình, tooling
- `test(auth): add unit tests for auth service` — Test

---

## ⚡ Quick Start — Phiên đầu tiên

Nếu đây là lần đầu tiên chạy dự án, thực hiện theo thứ tự:

### 1. Cài đặt môi trường
```bash
# Copy file env
cp .env.example .env
# Chỉnh sửa .env với giá trị thực tế của bạn
```

### 2. Khởi động Docker
```bash
docker compose up -d
# Kiểm tra services đang chạy
docker compose ps
```

### 3. Kiểm tra backend
```bash
curl http://localhost:8080/api/auth/login
# Kỳ vọng: 400 Bad Request (thiếu body) — backend đang hoạt động
```

### 4. Mở frontend
```
http://localhost:3000
```

---

## 📂 Cấu Trúc Tài Liệu Tham Khảo

```
docs/
├── README.md                          ← Mục lục tổng hợp (đọc đầu tiên)
├── tasks/
│   ├── ARCHITECTURE.md               ← Kiến trúc, tech stack, ADR
│   ├── TASK-INDEX.md                 ← Bảng theo dõi TẤT CẢ task
│   ├── modules/
│   │   ├── TASKS-auth.md             ← Task module Auth
│   │   ├── TASKS-order.md            ← Task module Order
│   │   ├── TASKS-payment.md          ← Task module Payment
│   │   └── TASKS-dashboard.md        ← Task module Dashboard
│   └── sprints/
│       ├── TASKS-SPRINT-1.md         ← Sprint 1
│       ├── TASKS-SPRINT-2.md         ← Sprint 2
│       └── TASKS-SPRINT-3.md         ← Sprint 3
├── srs/                               ← Đặc tả yêu cầu
└── design/                            ← UI/UX Design specs
```

---

*Workflow này được duy trì bởi @project-manager agent. Cập nhật lần cuối: 2026-04-23*
