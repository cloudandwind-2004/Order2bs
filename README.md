# 🍱 Lunch Order - Internal Food Ordering System

> Web nội bộ đặt đồ ăn realtime cho công ty với giao diện cute hồng-vàng nhạt 🌸

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Vite |
| Backend | Golang (Gin framework) |
| Database | PostgreSQL 16 |
| Realtime | WebSocket (gorilla/websocket) |
| Infra | Docker + Docker Compose |

## Tính Năng Chính

- 🔐 **Auth**: Đăng ký / Đăng nhập / Admin duyệt tài khoản
- 🍜 **Đặt món realtime**: Chủ đề buổi ăn + danh mục động + topping
- 💰 **Quản lý nợ**: Tự tính khi giá vượt mức hỗ trợ công ty
- 📱 **Thanh toán QR**: Admin upload QR ngân hàng, user quét để chuyển khoản
- 🏠 **Tự nấu cơm**: Tick "tự nấu" → được cộng credit bằng mức hỗ trợ
- 📊 **Dashboard**: Biểu đồ chi tiêu tháng, tổng hợp nợ, trạng thái đơn hàng

## Cấu Trúc Dự Án

```
.
├── frontend/          # React + TypeScript (Vite)
├── backend/           # Golang (Gin)
├── docker-compose.yml
├── .env.example
└── .github/
    ├── agents/        # AI agents cho từng role
    └── workflows/     # CI/CD pipelines
```

## Khởi Động Nhanh

```bash
# 1. Copy env file
cp .env.example .env

# 2. Chạy toàn bộ service
docker compose up -d

# 3. Truy cập
# Frontend: http://localhost:3000
# Backend API: http://localhost:8080
# API Docs: http://localhost:8080/swagger
```

## Phát Triển Local

### Backend (Golang)
```bash
cd backend
go mod tidy
go run main.go
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

## AI Agents

Dự án sử dụng các AI agents chuyên biệt trong `.github/agents/`:

| Agent | Vai Trò |
|-------|---------|
| `product-owner` | Quản lý yêu cầu, backlog |
| `business-analyst` | Phân tích nghiệp vụ |
| `technical-leader` | Kiến trúc hệ thống |
| `senior-frontend-programmer` | Code React/TS |
| `senior-backend-programmer` | Code Golang |
| `senior-devops` | Docker, CI/CD |
| `senior-qa` | Testing |
| `ui-ux-designer` | Thiết kế UI |
| `project-manager` | Quản lý dự án |

## Environment Variables

Xem `.env.example` để biết các biến cần thiết.

---
*Made with 🌸 for internal team use*
