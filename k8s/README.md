# 🚀 Kubernetes Deployment — 2BS LunchOrder

## Kiến trúc tổng quan

```
Internet
   │
   ▼
[Ingress Controller (nginx)]
   ├─ /api/*  ──► [Backend Service] ──► [Backend Pod x2/3]
   ├─ /ws     ──► [Backend Service]         │
   └─ /*      ──► [Frontend Service] ──► [Frontend Pod x2]
                                        [PostgreSQL StatefulSet]
                                               │
                                        [PersistentVolumeClaim]
```

## Cấu trúc thư mục

```
k8s/
├── base/                      # Base configs (không môi trường cụ thể)
│   ├── namespace/             # Namespace definition
│   ├── configmap/             # Non-sensitive config
│   ├── secret/                # Secret template (KHÔNG commit!)
│   ├── database/              # PostgreSQL StatefulSet + Service + PVC
│   ├── backend/               # Backend Deployment + HPA + Service
│   ├── frontend/              # Frontend Deployment + Service
│   ├── ingress/               # Ingress rules
│   └── kustomization.yaml
├── overlays/
│   ├── dev/                   # Dev override (1 replica, dev images)
│   └── prod/                  # Prod override (3 replicas, larger resources)
├── deploy.sh                  # Helper script
└── README.md
```

## 🔧 Cài đặt ban đầu (Một lần duy nhất)

### 1. Yêu cầu
- `kubectl` >= 1.29
- `kustomize` >= 5.x
- Kubernetes cluster (minikube / GKE / EKS / AKS)
- Container registry (GitHub Container Registry đã được cấu hình)

### 2. Cài Ingress Controller
```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
```

### 3. Cài cert-manager (HTTPS tự động)
```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.14.5/cert-manager.yaml
```

### 4. Tạo Secrets (thủ công, KHÔNG commit!)
```bash
# Tạo secret cho app
kubectl create secret generic lunchorder-secrets \
  --namespace=lunchorder \
  --from-literal=DB_PASSWORD='your-strong-password-123' \
  --from-literal=JWT_SECRET='your-256-bit-random-secret-key'

# Tạo secret cho PostgreSQL
kubectl create secret generic postgres-secret \
  --namespace=lunchorder \
  --from-literal=POSTGRES_PASSWORD='your-strong-password-123'
```

### 5. Đổi image name trong các file YAML
```bash
# Tìm và đổi YOURUSER thành GitHub username của bạn
grep -r "YOURUSER" k8s/base/
# Sau đó đổi trong:
# - k8s/base/backend/backend.yaml
# - k8s/base/frontend/frontend.yaml
# - k8s/overlays/*/kustomization.yaml
```

### 6. Đổi domain name
```bash
# Trong file k8s/base/ingress/ingress.yaml
# Đổi your-domain.com thành domain thật
```

---

## 🚀 Deploy

### Deploy Development
```bash
./k8s/deploy.sh dev
```

### Deploy Production
```bash
./k8s/deploy.sh prod
```

### Kiểm tra trạng thái
```bash
./k8s/deploy.sh status
```

### Rollback
```bash
./k8s/deploy.sh rollback backend       # rollback backend
./k8s/deploy.sh rollback frontend      # rollback frontend
```

---

## 📋 Lệnh hữu ích

```bash
# Xem tất cả pods trong namespace
kubectl get pods -n lunchorder

# Xem logs backend
kubectl logs -f deployment/backend -n lunchorder

# Xem logs theo pod cụ thể
kubectl logs -f pod/<pod-name> -n lunchorder

# Xem resource usage
kubectl top pods -n lunchorder

# Truy cập vào pod backend
kubectl exec -it deployment/backend -n lunchorder -- sh

# Scale thủ công
kubectl scale deployment/backend --replicas=4 -n lunchorder

# Xem events nếu có lỗi
kubectl get events -n lunchorder --sort-by=.metadata.creationTimestamp
```

---

## 🔄 CI/CD Flow

```
git push main
     │
     ▼
[GitHub Actions]
  ├─ Build Docker image (backend + frontend)
  ├─ Push to ghcr.io
  ├─ Update image tag với Kustomize
  └─ kubectl apply -k k8s/overlays/prod
         │
         ▼
  [K8s Rolling Update]
  (Zero downtime — maxUnavailable: 0)
```

### GitHub Secrets cần cấu hình
| Secret | Mô tả |
|--------|-------|
| `KUBE_CONFIG_PROD` | base64-encoded kubeconfig của cluster prod |
| `KUBE_CONFIG_DEV` | base64-encoded kubeconfig của cluster dev |
| `VITE_API_URL` | URL của API cho frontend build (vd: https://your-domain.com) |
| `VITE_WS_URL` | WebSocket URL (vd: wss://your-domain.com/ws) |

```bash
# Lấy kubeconfig và encode base64
cat ~/.kube/config | base64 -w0
```

---

## ⚠️ Lưu ý Production

1. **Không bao giờ** commit file secret thật lên git
2. Dùng **Sealed Secrets** hoặc **External Secrets Operator** cho production thật
3. Đổi `storageClassName` theo cloud provider:
   - AWS EKS: `gp3`
   - GKE: `standard-rwo`
   - AKS: `managed-premium`
4. Uploads volume cần `ReadWriteMany` (RWX) — dùng EFS (AWS) hoặc Filestore (GCP)
5. Luôn dùng **image tag cụ thể** (sha hoặc semver), tránh dùng `:latest` trong production
