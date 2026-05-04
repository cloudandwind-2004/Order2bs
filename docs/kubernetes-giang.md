# Kubernetes — Bài Giảng Chi Tiết

> Áp dụng thực tế vào dự án **Order2bs**

---

## Vấn Đề K8s Giải Quyết

Giả sử bạn deploy app bằng Docker thủ công:

- App crash lúc 3am → không ai biết → downtime
- Traffic tăng đột ngột → server chịu không nổi → crash
- Update version mới → phải tắt app → user bị gián đoạn

**Kubernetes tự động giải quyết tất cả những điều trên.**

---

## 1. Kiến Trúc Cơ Bản

K8s gồm 2 loại máy:

```
┌──────────────────────────────────────────────┐
│  Control Plane (não của cluster)             │
│  - API Server: nhận lệnh kubectl             │
│  - Scheduler: quyết định pod chạy node nào  │
│  - etcd: database lưu toàn bộ state         │
└──────────────────────────────────────────────┘
          ↕ ra lệnh
┌──────────────────────────────────────────────┐
│  Worker Nodes (tay chân - chạy app thực tế) │
│  - kubelet: agent nhận lệnh từ Control Plane │
│  - container runtime: chạy Docker container │
│  - kube-proxy: xử lý network                │
└──────────────────────────────────────────────┘
```

> Trong Order2bs dùng **Minikube** = 1 máy đóng vai cả Control Plane lẫn Worker Node (môi trường học/dev).

---

## 2. Các Khái Niệm Cốt Lõi

### Pod — Đơn Vị Nhỏ Nhất

```
Pod = 1 hoặc nhiều container chạy cùng nhau trên 1 node
```

- Pod có IP riêng trong cluster
- Pod **có thể bị xóa/tạo lại bất kỳ lúc nào** → IP thay đổi
- Không deploy Pod trực tiếp → dùng **Deployment** quản lý

---

### Deployment — Quản Lý Pod

```yaml
spec:
  replicas: 2           # Luôn duy trì 2 pod
  strategy:
    type: RollingUpdate # Update không downtime
```

Deployment đảm bảo: **"Luôn phải có đúng N pod đang chạy"**

Nếu pod crash → Deployment tự tạo pod mới thay thế ngay lập tức.

**RollingUpdate hoạt động thế nào?**

```
Trước deploy:  [Pod v1] [Pod v1]
Đang deploy:   [Pod v1] [Pod v1] [Pod v2]  ← tạo thêm 1 pod mới
               [Pod v1] [Pod v2] [Pod v2]  ← tắt 1 pod cũ
Sau deploy:    [Pod v2] [Pod v2]
→ User không bao giờ bị gián đoạn!
```

Trong Order2bs backend:

```yaml
rollingUpdate:
  maxSurge: 1       # Tạo thêm tối đa 1 pod mới trước khi tắt pod cũ
  maxUnavailable: 0 # Không được tắt pod cũ khi chưa có pod mới ready
```

---

### Service — Địa Chỉ Cố Định

Vì Pod IP thay đổi liên tục, Service tạo ra **tên cố định**:

```
backend-svc:8080  →  luôn trỏ đúng vào pod backend đang sống
```

**3 loại Service:**

| Type | Truy cập từ | Dùng khi nào |
|---|---|---|
| **ClusterIP** | Trong cluster | Internal (DB, API nội bộ) |
| **NodePort** | Ngoài cluster qua IP:port | Dev/staging |
| **LoadBalancer** | Internet qua domain | Production trên cloud |

Trong Order2bs, **tất cả đều dùng ClusterIP**:
- `backend-svc` → Ingress gọi backend
- `frontend-svc` → Ingress gọi frontend
- `postgres-svc` → Backend gọi DB

> Postgres **không bao giờ expose ra ngoài** → bảo mật.

---

### Ingress — Router Cho HTTP Traffic

```
Người dùng → /api  → backend-svc:8080
           → /ws   → backend-svc:8080  (WebSocket)
           → /     → frontend-svc:80
```

Ingress = **1 entry point duy nhất**, phân chia traffic theo path hoặc domain.

Trong Order2bs (`k8s/base/ingress/ingress.yaml`):

```yaml
rules:
  - host: 192.168.49.2.nip.io
    http:
      paths:
        - path: /api     → backend-svc:8080
        - path: /ws      → backend-svc:8080
        - path: /        → frontend-svc:80
```

---

### ConfigMap — Biến Môi Trường Không Bí Mật

```yaml
# k8s/base/configmap/configmap.yaml
data:
  APP_ENV: "production"
  DB_HOST: "postgres-svc"   # Tên Service, không phải IP!
  DB_PORT: "5432"
  DB_NAME: "lunchorder"
  TZ: "Asia/Ho_Chi_Minh"
```

Pod đọc ConfigMap:

```yaml
envFrom:
  - configMapRef:
      name: lunchorder-config
```

> ConfigMap lưu Git được. Không chứa thông tin nhạy cảm.

---

### Secret — Biến Môi Trường Bí Mật

```bash
# Tạo bằng kubectl — KHÔNG commit lên Git!
kubectl create secret generic lunchorder-secrets \
  --from-literal=DB_PASSWORD="mypassword" \
  --from-literal=JWT_SECRET="myjwtsecret"
```

Pod đọc Secret:

```yaml
env:
  - name: DB_PASSWORD
    valueFrom:
      secretKeyRef:
        name: lunchorder-secrets
        key: DB_PASSWORD
  - name: JWT_SECRET
    valueFrom:
      secretKeyRef:
        name: lunchorder-secrets
        key: JWT_SECRET
```

> Secret được encode base64, không lưu plaintext trong Git.

---

### StatefulSet — Deployment Đặc Biệt Cho Database

| | Deployment | StatefulSet |
|---|---|---|
| Tên Pod | `backend-abc123` (random) | `postgres-0` (cố định) |
| Thứ tự start | Song song | Lần lượt (0 → 1 → 2) |
| Khi restart | Pod mới, gắn volume bất kỳ | Pod mới gắn lại **đúng volume cũ** |
| Dùng cho | Stateless (backend, frontend) | Stateful (database) |

**Quy tắc vàng**: Database luôn dùng StatefulSet.

Trong Order2bs:

```yaml
# k8s/base/database/postgres.yaml
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: postgres-svc
  replicas: 1
```

---

### PersistentVolumeClaim (PVC) — Ổ Cứng Cho Pod

Container bị xóa → data bên trong mất → **cần PVC** để lưu bền vững.

```
postgres Pod  ←mount→  PVC (10Gi)  ←→  Physical disk trên node
```

PVC tồn tại **độc lập** với Pod. Pod xóa → data vẫn còn.

Trong Order2bs có 2 PVC:

```yaml
# postgres-pvc: lưu data database
storage: 10Gi  (base) / 50Gi  (prod overlay)

# backend-uploads-pvc: lưu file user upload
storage: 5Gi
```

---

### InitContainer — Chờ Dependency Sẵn Sàng

```yaml
# backend.yaml
initContainers:
  - name: wait-for-db
    image: busybox:1.36
    command:
      - sh
      - -c
      - |
        until nc -z postgres-svc 5432; do
          echo "Waiting for PostgreSQL..."
          sleep 2
        done
```

Backend Pod sẽ **không start** cho đến khi PostgreSQL sẵn sàng.
Tránh lỗi "connection refused" khi cả backend và DB khởi động cùng lúc.

---

### Health Check (Probe) — Kiểm Tra Sức Khỏe Pod

```
livenessProbe  → "Pod còn sống không?"       → fail = RESTART pod
readinessProbe → "Pod sẵn sàng nhận traffic?" → fail = tạm thời tách ra, KHÔNG restart
```

Ví dụ backend Order2bs:

```yaml
livenessProbe:
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 20  # Chờ 20s sau khi start mới bắt đầu check
  periodSeconds: 15         # Check mỗi 15s
  failureThreshold: 3       # Fail 3 lần liên tiếp mới restart

readinessProbe:
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
  failureThreshold: 3
```

---

### HPA — Horizontal Pod Autoscaler (Tự Động Scale)

```yaml
# backend.yaml
kind: HorizontalPodAutoscaler
spec:
  minReplicas: 2
  maxReplicas: 5
  metrics:
    - resource:
        name: cpu
        target:
          averageUtilization: 70   # CPU > 70% → scale up
    - resource:
        name: memory
        target:
          averageUtilization: 80   # RAM > 80% → scale up
```

**Ví dụ thực tế:**

```
Bình thường (CPU 30%)  →  2 pod
Giờ ăn trưa (CPU 80%) →  HPA tạo thêm  →  4 pod
Sau giờ ăn (CPU 20%)  →  HPA xóa bớt  →  2 pod
```

Hoàn toàn tự động — không cần người can thiệp.

---

## 3. Namespace — Tách Biệt Môi Trường

```
cluster
├── namespace: lunchorder       ← production app
├── namespace: lunchorder-dev   ← development app
└── namespace: argocd           ← ArgoCD tool
```

Resource cùng tên trong namespace khác nhau không đụng nhau.

---

## 4. Kustomize — Quản Lý Nhiều Môi Trường

Thay vì copy-paste YAML cho từng môi trường, Kustomize dùng cách:

```
k8s/
├── base/          ← config chung (viết 1 lần)
└── overlays/
    ├── dev/       ← chỉ ghi những gì KHÁC với base
    └── prod/      ← chỉ ghi những gì KHÁC với base
```

Ví dụ prod override DB storage:

```yaml
# overlays/prod/kustomization.yaml
patches:
  - patch: |-
      - op: replace
        path: /spec/resources/requests/storage
        value: "50Gi"   # prod: 50Gi thay vì 10Gi ở base
    target:
      kind: PersistentVolumeClaim
      name: postgres-pvc
```

> Base = template chung. Overlay = chỉ điều chỉnh những gì khác biệt.

---

## 5. Luồng Deploy Đầy Đủ Trong Order2bs

```
1. Developer: git push code lên GitHub
         ↓
2. deploy.sh: docker build → push image lên Harbor
         ↓
3. deploy.sh: cập nhật image tag trong k8s/overlays/prod/
         ↓
4. git push → ArgoCD phát hiện thay đổi trong repo
         ↓
5. ArgoCD: apply kustomize overlays/prod/ lên cluster
         ↓
6. Deployment: tạo Pod mới (RollingUpdate — không downtime)
         ↓
7. InitContainer: chờ Postgres sẵn sàng (nc -z postgres-svc 5432)
         ↓
8. Backend Pod start → ReadinessProbe check /api/health
         ↓
9. Service route traffic vào Pod mới ✅
        ↓
10. HPA tự điều chỉnh số Pod theo tải thực tế
```

---

## 6. Luồng Traffic Từ User Đến Database

```
👤 User
  → HTTPS order2bs.2bsystem.com.vn
  → Nginx (server 192.168.100.161) — Reverse Proxy
  → NodePort (192.168.100.170:3xxxx) — vào cluster
  → Ingress Controller
  → /api → backend-svc → backend Pod
                              → postgres-svc → postgres Pod (StatefulSet)
  → /    → frontend-svc → frontend Pod
```

---

## 7. Tổng Hợp Tất Cả Thành Phần

| Thành phần | File trong project | Vai trò |
|---|---|---|
| Namespace | `namespace.yaml` | Tách môi trường prod/dev |
| Deployment (backend) | `backend.yaml` | Chạy & quản lý backend pods |
| Deployment (frontend) | `frontend.yaml` | Chạy & quản lý frontend pods |
| StatefulSet (postgres) | `postgres.yaml` | Chạy DB với data bền vững |
| Service x3 | trong mỗi yaml | Địa chỉ cố định cho pods |
| Ingress | `ingress.yaml` | Route /api → backend, / → frontend |
| ConfigMap | `configmap.yaml` | Biến môi trường không bí mật |
| Secret | tạo bằng kubectl | DB_PASSWORD, JWT_SECRET |
| PVC x2 | backend + postgres yaml | Lưu trữ file & data DB |
| HPA | trong `backend.yaml` | Auto-scale backend theo tải |
| InitContainer | trong `backend.yaml` | Chờ DB sẵn sàng trước khi start |
| Kustomize overlay | `overlays/prod/` | Override config cho production |
| ArgoCD Application | `argocd/application-prod.yaml` | GitOps auto-sync |

---

## 8. Câu Tóm Gọn

> **Kubernetes** là hệ thống đảm bảo app của bạn **luôn chạy đúng số lượng, đúng cấu hình, tự phục hồi khi lỗi** — mà không cần người trực 24/7.
