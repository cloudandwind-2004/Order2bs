#!/usr/bin/env bash
# =============================================================
# argocd-setup.sh — Cài ArgoCD vào Minikube và đăng ký apps
# Cách dùng: ./k8s/argocd/setup.sh
# =============================================================
set -euo pipefail

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; exit 1; }

# ── Kiểm tra cluster trước khi bắt đầu ───────────────────────
if ! kubectl cluster-info &>/dev/null; then
  error "Kubernetes cluster chưa sẵn sàng!\n\
  Hãy chạy: minikube start --driver=docker --cpus=4 --memory=6144\n\
  Chờ khoảng 3-5 phút rồi chạy lại script này."
fi
info "Cluster OK: $(kubectl cluster-info | head -1)"
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }

# ── 1. Cài ArgoCD ─────────────────────────────────────────────
info "==> Bước 1: Cài ArgoCD"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml --validate=false

info "Chờ ArgoCD pods ready (có thể mất 2-3 phút)..."
kubectl wait --for=condition=Available deployment/argocd-server -n argocd --timeout=5m
info "ArgoCD ready! ✅"

# ── 2. Lấy mật khẩu admin ────────────────────────────────────
info "==> Bước 2: Lấy mật khẩu admin"
ARGOCD_PASS=$(kubectl get secret argocd-initial-admin-secret -n argocd -o jsonpath='{.data.password}' | base64 -d)
echo ""
warn "============================================"
warn "  ArgoCD Admin Password: $ARGOCD_PASS"
warn "  Lưu lại password này!"
warn "============================================"
echo ""

# ── 3. Expose ArgoCD UI ───────────────────────────────────────
info "==> Bước 3: Expose ArgoCD UI"
# Dùng port-forward cho local testing
echo ""
info "Chạy lệnh này trong terminal khác để truy cập UI:"
echo ""
echo "  kubectl port-forward svc/argocd-server -n argocd 8443:443"
echo "  Rồi mở: https://localhost:8443"
echo "  User: admin | Password: $ARGOCD_PASS"
echo ""

# ── 4. Cài ArgoCD CLI ────────────────────────────────────────
info "==> Bước 4: Cài ArgoCD CLI"
ARGOCD_VERSION=$(curl --silent "https://api.github.com/repos/argoproj/argo-cd/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/')
curl -sSL -o /tmp/argocd "https://github.com/argoproj/argo-cd/releases/download/${ARGOCD_VERSION}/argocd-linux-amd64"
chmod +x /tmp/argocd && sudo mv /tmp/argocd /usr/local/bin/argocd
argocd version --client

# ── 5. Đăng ký AppProject và Applications ─────────────────────
info "==> Bước 5: Tạo Secrets và đăng ký cho lunchorder"
warn "Bạn cần tạo Secrets trước khi đăng ký Application:"
echo ""
echo "  kubectl apply -f k8s/argocd/project.yaml"
echo "  kubectl apply -f k8s/argocd/application-prod.yaml"
echo "  kubectl apply -f k8s/argocd/application-dev.yaml"
echo ""
read -rp "Tạo Secrets cho lunchorder rồi? (y/n): " ok
if [ "$ok" == "y" ]; then
  kubectl apply -f k8s/argocd/project.yaml
  kubectl apply -f k8s/argocd/application-prod.yaml
  kubectl apply -f k8s/argocd/application-dev.yaml
  info "Apps đã đăng ký! ArgoCD sẽ bắt đầu sync..."
  kubectl get applications -n argocd
fi

info "=== Hoàn thành setup ArgoCD! ==="
echo ""
echo "Các lệnh hữu ích:"
echo "  kubectl get applications -n argocd"
echo "  kubectl get pods -n argocd"
echo "  argocd app list  (sau khi login CLI)"
