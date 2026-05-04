#!/usr/bin/env bash
# =============================================================
# deploy.sh — Script deploy nhanh cho môi trường local/staging
# Cách dùng:
#   ./k8s/deploy.sh dev     → deploy sang namespace dev
#   ./k8s/deploy.sh prod    → deploy sang namespace prod
#   ./k8s/deploy.sh status  → xem trạng thái tất cả pods
#   ./k8s/deploy.sh rollback backend → rollback deployment backend
# =============================================================
set -euo pipefail

OVERLAY="${1:-}"
NS_PROD="lunchorder"
NS_DEV="lunchorder-dev"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC} $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*" >&2; exit 1; }

# ── Kiểm tra công cụ ──────────────────────────────────────────
check_tools() {
  for tool in kubectl kustomize; do
    command -v "$tool" &>/dev/null || error "$tool chưa được cài. Hãy cài trước."
  done
}

# ── Tạo Secret (chạy lần đầu) ────────────────────────────────
create_secrets() {
  local ns="$1"
  info "Tạo Namespace: $ns"
  kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -

  if ! kubectl get secret lunchorder-secrets -n "$ns" &>/dev/null; then
    warn "Secret 'lunchorder-secrets' chưa có trong namespace $ns"
    read -rp "  DB_PASSWORD: " db_pass
    read -rp "  JWT_SECRET: " jwt_secret
    kubectl create secret generic lunchorder-secrets \
      --namespace="$ns" \
      --from-literal=DB_PASSWORD="$db_pass" \
      --from-literal=JWT_SECRET="$jwt_secret"
    info "Secret đã được tạo!"
  else
    info "Secret đã tồn tại, bỏ qua."
  fi

  if ! kubectl get secret postgres-secret -n "$ns" &>/dev/null; then
    local db_pass
    db_pass=$(kubectl get secret lunchorder-secrets -n "$ns" -o jsonpath='{.data.DB_PASSWORD}' | base64 -d)
    kubectl create secret generic postgres-secret \
      --namespace="$ns" \
      --from-literal=POSTGRES_PASSWORD="$db_pass"
  fi
}

# ── Deploy function ───────────────────────────────────────────
deploy() {
  local env="$1" ns="$2"
  info "==> Deploy $env (namespace: $ns)"
  create_secrets "$ns"

  info "Applying Kustomize overlay: $env"
  kubectl apply -k "$(dirname "$0")/overlays/$env"

  info "Chờ Backend rollout..."
  kubectl rollout status deployment/backend  -n "$ns" --timeout=120s

  info "Chờ Frontend rollout..."
  kubectl rollout status deployment/frontend -n "$ns" --timeout=120s

  info "✅ Deploy $env thành công!"
  kubectl get pods -n "$ns"
}

# ── Subcommands ───────────────────────────────────────────────
case "$OVERLAY" in
  dev)
    check_tools
    deploy "dev" "$NS_DEV"
    ;;
  prod)
    check_tools
    warn "Bạn sắp deploy lên PRODUCTION. Nhấn [Enter] để tiếp tục, Ctrl+C để hủy."
    read -r
    deploy "prod" "$NS_PROD"
    ;;
  status)
    echo ""
    info "=== Pods (prod) ==="
    kubectl get pods -n "$NS_PROD" 2>/dev/null || warn "Namespace $NS_PROD chưa tồn tại"
    echo ""
    info "=== Pods (dev) ==="
    kubectl get pods -n "$NS_DEV" 2>/dev/null || warn "Namespace $NS_DEV chưa tồn tại"
    echo ""
    info "=== Ingress ==="
    kubectl get ingress -n "$NS_PROD" 2>/dev/null || true
    ;;
  rollback)
    DEPLOYMENT="${2:-backend}"
    NS="${3:-$NS_PROD}"
    warn "Rollback $DEPLOYMENT trong namespace $NS..."
    kubectl rollout undo deployment/"$DEPLOYMENT" -n "$NS"
    kubectl rollout status deployment/"$DEPLOYMENT" -n "$NS" --timeout=60s
    info "✅ Rollback hoàn tất!"
    ;;
  *)
    echo "Cách dùng: $0 <dev|prod|status|rollback> [deployment_name]"
    exit 1
    ;;
esac
