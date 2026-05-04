# Kubernetes trong Dự Án Order2bs — Giảng Chi Tiết

## 1. Kubernetes là gì? (Nói ngắn)

Kubernetes (K8s) là **hệ thống tự động quản lý container**. Thay vì chạy `docker run` thủ công trên 1 máy, K8s giúp bạn:
- Chạy app trên **nhiều máy (node)** cùng lúc
- **Tự restart** khi app crash
- **Tự scale** khi tải cao
- **Zero-downtime deploy** khi update code

---

## 2. Kiến Trúc Tổng Quan Cluster Order2bs

```
┌─────────────────────────────────────────────────────────────┐
│                  Kubernetes Cluster (Minikube)               │
│                                                             │
│  Namespace: lunchorder                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                                                      │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │ frontend │  │ backend  │  │    postgres       │   │   │
│  │  │  Pod x1  │  │  Pod x1  │  │  StatefulSet x1  │   │   │
│  │  │  :80     │  │  :8080   │  │  :5432           │   │   │
│  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │   │
│  │       │             │                 │             │   │
│  │  frontend-svc  backend-svc      postgres-svc        │   │
│  │  (ClusterIP)   (ClusterIP)      (ClusterIP)         │   │
│  │       │             │                               │   │
│  │  ┌────┴─────────────┴──────────────────────────┐    │   │
│  │  │           lunchorder-ingress                │    │   │
│  │  │  /api, /ws → backend-svc:8080               │    │   │
│  │  │  /        → frontend-svc:80                 │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  Namespace: argocd                                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  ArgoCD Server — watch GitHub → sync cluster         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
          ↑
   Nginx Reverse Proxy (192.168.100.161)
   order2bs.2bsystem.com.vn → NodePort → Ingress
```

---

## 3. Các Khái Niệm Cốt Lõi (có ví dụ từ project)

### 3.1 Namespace — "Phòng riêng"

```yaml
# k8s/base/namespace/namespace.yaml
kind: Namespace
metadata:
  name: lunchorder
```

**Tác dụng**: Tách biệt môi trường trong cùng 1 cluster.
- `lunchorder` = production
- `lunchorder-dev` = development
- `argocd` = ArgoCD tools

> Giống như folder trên máy tính — cùng tên file nhưng khác folder thì không đụng nhau.

---

### 3.2 Deployment — "Bản mô tả cách chạy app"

```yaml
# k8s/base/backend/backend.yaml
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 2              # Chạy 2 bản đồng thời
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1          # Tạo thêm 1 pod mới trước
      maxUnavailable: 0    # Không tắt pod cũ cho đến khi pod mới ready
```

**Deployment quản lý**:
- Số lượng Pod cần chạy (`replicas`)
- Chiến lược update (`RollingUpdate` = không downtime)
- Image nào dùng
- Biến môi trường, volume

**RollingUpdate hoạt động thế nào?**
```
Trước deploy:  [Pod v1] [Pod v1]
Đang deploy:   [Pod v1] [Pod v1] [Pod v2]  ← tạo thêm 1
               [Pod v1] [Pod v2] [Pod v2]  ← tắt 1 cái cũ
Sau deploy:    [Pod v2] [Pod v2]
→ User không bao giờ bị gián đoạn!
```

---

### 3.3 InitContainer — "Chờ DB trước khi start"

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

**Tác dụng**: Backend pod sẽ **không start** cho đến khi PostgreSQL sẵn sàng.
Tránh lỗi "connection refused" khi cả backend và DB start cùng lúc.

---

### 3.4 Service — "Địa chỉ cố định cho Pod"

Pod có IP **thay đổi** mỗi khi restart. Service tạo ra **IP/tên cố định**.

```yaml
# backend-svc: ClusterIP
kind: Service
metadata:
  name: backend-svc
spec:
  type: ClusterIP      # Chỉ truy cập được từ bên trong cluster
  selector:
    app: backend       # Tìm tất cả Pod có label app=backend
  ports:
    - port: 8080
      targetPort: 8080
```

**3 loại Service trong project**:

| Service | Type | Truy cập từ đâu |
|---|---|---|
| `backend-svc` | ClusterIP | Chỉ trong cluster (Ingress → backend) |
| `frontend-svc` | ClusterIP | Chỉ trong cluster (Ingress → frontend) |
| `postgres-svc` | ClusterIP | Chỉ trong cluster (backend → postgres) |

> Postgres **không expose** ra ngoài — bảo mật!

---

### 3.5 Ingress — "Bộ định tuyến traffic vào cluster"

```yaml
# k8s/base/ingress/ingress.yaml
kind: Ingress
spec:
  rules:
    - host: 192.168.49.2.nip.io
      http:
        paths:
          - path: /api     # → backend-svc:8080
          - path: /ws      # → backend-svc:8080 (WebSocket)
          - path: /        # → frontend-svc:80
```

**Luồng request**:
```
User → Nginx (server ngoài) → NodePort → Ingress Controller → Service → Pod
```

> Ingress giống **receptionist** của tòa nhà: nhận request, xem địa chỉ, rồi dẫn đến đúng phòng.

---

### 3.6 ConfigMap — "Biến môi trường không bí mật"

```yaml
# k8s/base/configmap/configmap.yaml
kind: ConfigMap
data:
  APP_ENV: "production"
  DB_HOST: "postgres-svc"   # Tên service, không phải IP!
  DB_PORT: "5432"
  DB_NAME: "lunchorder"
  TZ: "Asia/Ho_Chi_Minh"
```

Backend pod đọc ConfigMap:
```yaml
envFrom:
  - configMapRef:
      name: lunchorder-config
```

> Lưu cấu hình **không bí mật** — ai đọc code cũng thấy được.

---

### 3.7 Secret — "Biến môi trường bí mật"

```yaml
# Tạo bằng kubectl (không commit lên Git!)
kubectl create secret generic lunchorder-secrets \
  --from-literal=DB_PASSWORD="mypassword" \
  --from-literal=JWT_SECRET="myjwtsecret"
```

Backend đọc Secret:
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

> Secret được **encode base64**, không lưu plaintext trong Git.

---

### 3.8 StatefulSet — "Deployment đặc biệt cho Database"

```yaml
# k8s/base/database/postgres.yaml
kind: StatefulSet
metadata:
  name: postgres
spec:
  replicas: 1
  serviceName: postgres-svc
```

**Tại sao Postgres dùng StatefulSet chứ không phải Deployment?**

| | Deployment | StatefulSet |
|---|---|---|
| Tên Pod | `backend-abc123` (random) | `postgres-0` (cố định) |
| Khi restart | Xóa cũ, tạo mới | Giữ nguyên tên, gắn lại volume cũ |
| Dữ liệu | Không quan trọng | **Phải giữ dữ liệu** |

Database **bắt buộc** dùng StatefulSet vì cần đảm bảo data không mất khi Pod restart.

---

### 3.9 PersistentVolumeClaim (PVC) — "Ổ cứng cho Pod"

```yaml
# Postgres PVC — lưu data DB
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce   # 1 node đọc/ghi cùng lúc
  resources:
    requests:
      storage: 10Gi   # (prod: 50Gi — xem overlay)

# Backend PVC — lưu file upload
kind: PersistentVolumeClaim
metadata:
  name: backend-uploads-pvc
spec:
  storage: 5Gi
```

> PVC = "đặt chỗ ổ cứng". Pod bị xóa nhưng data vẫn còn.

---

### 3.10 HPA — "Tự động scale theo tải"

```yaml
# k8s/base/backend/backend.yaml
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    name: backend
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

**Ví dụ**:
- Bình thường: 2 pod backend
- Giờ ăn trưa nhiều request: CPU tăng → HPA tự tạo thêm → 4 pod
- Xong giờ ăn: CPU giảm → HPA scale down → 2 pod

---

### 3.11 Probe — "Kiểm tra sức khỏe Pod"

```yaml
# backend.yaml
livenessProbe:      # Nếu fail → restart pod
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 20
  periodSeconds: 15
  failureThreshold: 3

readinessProbe:     # Nếu fail → không nhận traffic (nhưng không restart)
  httpGet:
    path: /api/health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
```

| Probe | Nếu fail thì... |
|---|---|
| `livenessProbe` | Restart pod |
| `readinessProbe` | Tạm thời không route traffic vào pod này |

---

## 4. Kustomize — "Quản lý config nhiều môi trường"

```
k8s/
├── base/                 ← Config chung (dev + prod dùng chung)
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   ├── configmap/
│   └── ingress/
└── overlays/
    ├── dev/              ← Override cho dev
    │   └── kustomization.yaml
    └── prod/             ← Override cho prod
        └── kustomization.yaml
```

**`overlays/prod/kustomization.yaml`** ghi đè lên base:
```yaml
patches:
  - patch: |-              # Giảm replica (Minikube ít RAM)
      - op: replace
        path: /spec/replicas
        value: 1
    target:
      kind: Deployment
      name: backend

  - patch: |-              # DB prod: tăng CPU, RAM, storage
      - op: replace
        path: /spec/resources/requests/storage
        value: "50Gi"
    target:
      kind: PersistentVolumeClaim
      name: postgres-pvc
```

> Base = template chung. Overlay = điều chỉnh cho từng môi trường.

---

## 5. Luồng Traffic Đầy Đủ

```
👤 User
  → HTTPS → order2bs.2bsystem.com.vn
  → Nginx (192.168.100.161) [reverse proxy]
  → NodePort (192.168.100.170:30xxx)
  → Ingress Controller (trong cluster)
  → /api/* → backend-svc → backend Pod → postgres-svc → postgres Pod
  → /*     → frontend-svc → frontend Pod
```

---

## 6. Tóm Tắt Các Thành Phần

| Thành phần | File | Vai trò |
|---|---|---|
| Namespace | `namespace.yaml` | Tách biệt môi trường |
| Deployment (backend) | `backend.yaml` | Chạy & quản lý backend pods |
| Deployment (frontend) | `frontend.yaml` | Chạy & quản lý frontend pods |
| StatefulSet (postgres) | `postgres.yaml` | Chạy DB với data bền vững |
| Service x3 | trong mỗi yaml | Địa chỉ cố định cho pods |
| Ingress | `ingress.yaml` | Route /api → backend, / → frontend |
| ConfigMap | `configmap.yaml` | Biến môi trường không bí mật |
| Secret | tạo bằng kubectl | Mật khẩu DB, JWT secret |
| PVC x2 | backend + postgres | Lưu trữ file & data DB |
| HPA | `backend.yaml` | Auto-scale backend theo tải |
| Kustomize overlay | `overlays/prod/` | Override config cho production |
