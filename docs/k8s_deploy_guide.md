# 🚀 Hướng Dẫn Deploy K8s — Từng Bước Cụ Thể

> **Môi trường của bạn**: Ubuntu 22.04 · 15GB RAM · Docker 29 ✅ · Git: `Anab821/Order2bs`

---

## BƯỚC 1 — Cài kubectl, Minikube, Kustomize

### Cài kubectl
```bash
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl && sudo mv kubectl /usr/local/bin/
kubectl version --client
```

### Cài Minikube
```bash
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
chmod +x minikube-linux-amd64 && sudo mv minikube-linux-amd64 /usr/local/bin/minikube
minikube version
```

### Cài Kustomize
```bash
curl -s "https://raw.githubusercontent.com/kubernetes-sigs/kustomize/master/hack/install_kustomize.sh" | bash
sudo mv kustomize /usr/local/bin/ && kustomize version
```

### Khởi động Minikube
```bash
minikube start \
  --driver=docker \
  --cpus=4 \
  --memory=6144 \
  --disk-size=30g \
  --kubernetes-version=v1.29.0

kubectl cluster-info
kubectl get nodes
```

### Bật Addons
```bash
minikube addons enable ingress
minikube addons enable metrics-server
kubectl get pods -n ingress-nginx
```

---

## BƯỚC 2 — Thiết lập GHCR

### Tạo Personal Access Token
1. GitHub → **Settings** → **Developer settings** → **Tokens (classic)**
2. **Generate new token** → tick `write:packages`, `read:packages`
3. Copy token!

### Đăng nhập GHCR
```bash
export GHCR_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxx"
echo $GHCR_TOKEN | docker login ghcr.io -u anab821 --password-stdin
# → Login Succeeded
```

---

## BƯỚC 3 — Cập nhật cấu hình K8s

### Đổi YOURUSER → anab821
```bash
cd /home/truongsonkmhd/DATN/Order2bs

sed -i 's/YOURUSER/anab821/g' \
  k8s/base/backend/backend.yaml \
  k8s/base/frontend/frontend.yaml \
  k8s/overlays/dev/kustomization.yaml \
  k8s/overlays/prod/kustomization.yaml

grep "anab821" k8s/base/backend/backend.yaml
```

### Đổi domain bằng nip.io
```bash
MINIKUBE_IP=$(minikube ip)
sed -i "s/your-domain.com/${MINIKUBE_IP}.nip.io/g" k8s/base/ingress/ingress.yaml
grep "host:" k8s/base/ingress/ingress.yaml
```

> **nip.io**: domain `192.168.49.2.nip.io` tự resolve về IP `192.168.49.2` - hoàn toàn miễn phí!

---

## BƯỚC 4 — Build & Push Docker Images

```bash
cd /home/truongsonkmhd/DATN/Order2bs
VERSION=$(git rev-parse --short HEAD)
MINIKUBE_IP=$(minikube ip)

# Build Backend
docker build \
  -t ghcr.io/anab821/lunchorder-backend:$VERSION \
  -t ghcr.io/anab821/lunchorder-backend:latest \
  ./backend

# Build Frontend
docker build \
  --build-arg VITE_API_URL="http://${MINIKUBE_IP}.nip.io" \
  --build-arg VITE_WS_URL="ws://${MINIKUBE_IP}.nip.io/ws" \
  -t ghcr.io/anab821/lunchorder-frontend:$VERSION \
  -t ghcr.io/anab821/lunchorder-frontend:latest \
  ./frontend

# Push lên GHCR
docker push ghcr.io/anab821/lunchorder-backend:$VERSION
docker push ghcr.io/anab821/lunchorder-backend:latest
docker push ghcr.io/anab821/lunchorder-frontend:$VERSION
docker push ghcr.io/anab821/lunchorder-frontend:latest

# Cập nhật tag trong Kustomize
cd k8s/overlays/prod
kustomize edit set image \
  ghcr.io/anab821/lunchorder-backend=ghcr.io/anab821/lunchorder-backend:$VERSION \
  ghcr.io/anab821/lunchorder-frontend=ghcr.io/anab821/lunchorder-frontend:$VERSION
cd ../..
```

---

## BƯỚC 5 — Tạo K8s Secrets

```bash
kubectl create namespace lunchorder

kubectl create secret generic lunchorder-secrets \
  --namespace=lunchorder \
  --from-literal=DB_PASSWORD='Order2bs@2026!' \
  --from-literal=JWT_SECRET="$(openssl rand -hex 32)"

kubectl create secret generic postgres-secret \
  --namespace=lunchorder \
  --from-literal=POSTGRES_PASSWORD='Order2bs@2026!'

kubectl create secret docker-registry ghcr-secret \
  --namespace=lunchorder \
  --docker-server=ghcr.io \
  --docker-username=anab821 \
  --docker-password=$GHCR_TOKEN

kubectl get secrets -n lunchorder
```

---

## BƯỚC 6 — Load image vào Minikube

```bash
minikube image load ghcr.io/anab821/lunchorder-backend:latest
minikube image load ghcr.io/anab821/lunchorder-frontend:latest
minikube image ls | grep lunchorder
```

---

## BƯỚC 7 — DEPLOY

```bash
cd /home/truongsonkmhd/DATN/Order2bs

kubectl apply -k k8s/overlays/prod

kubectl rollout status deployment/backend  -n lunchorder --timeout=3m
kubectl rollout status deployment/frontend -n lunchorder --timeout=3m

watch kubectl get pods -n lunchorder
```

---

## BƯỚC 8 — Kiểm tra

```bash
MINIKUBE_IP=$(minikube ip)
curl http://${MINIKUBE_IP}.nip.io/api/health
# → {"status":"healthy"}

echo "App: http://${MINIKUBE_IP}.nip.io"
minikube dashboard
```

---

## BƯỚC 9 — GitHub Actions CI/CD

### Lấy kubeconfig
```bash
cat ~/.kube/config | base64 -w0
```

### Vào `github.com/Anab821/Order2bs` → Settings → Secrets → Actions → New secret

| Tên Secret | Giá trị |
|---|---|
| `KUBE_CONFIG_DEV` | Output base64 ở trên |
| `KUBE_CONFIG_PROD` | Output base64 ở trên |
| `VITE_API_URL` | `http://192.168.49.2.nip.io` |
| `VITE_WS_URL` | `ws://192.168.49.2.nip.io/ws` |

### Push code
```bash
git add k8s/ .github/ backend/main.go .gitignore
git commit -m "feat: Kubernetes deployment with CI/CD"
git push origin main
```

Xem pipeline: `https://github.com/Anab821/Order2bs/actions`

---

## Troubleshooting

```bash
# Pod lỗi
kubectl describe pod <pod-name> -n lunchorder
kubectl logs <pod-name> -n lunchorder --previous

# Events
kubectl get events -n lunchorder --sort-by=.metadata.creationTimestamp

# Xóa và deploy lại
kubectl delete -k k8s/overlays/prod
kubectl apply -k k8s/overlays/prod
```

---

## Checklist

- [ ] Bước 1: kubectl, Minikube, Kustomize OK
- [ ] Bước 2: docker login ghcr.io OK
- [ ] Bước 3: Đổi YOURUSER + domain xong
- [ ] Bước 4: Build & push images xong
- [ ] Bước 5: Tạo 3 Secrets trong namespace lunchorder
- [ ] Bước 6: Load image vào Minikube
- [ ] Bước 7: kubectl apply xong - tất cả pods Running
- [ ] Bước 8: Truy cập http://<minikube-ip>.nip.io OK
- [ ] Bước 9: GitHub Actions Secrets set - push code tự động deploy
