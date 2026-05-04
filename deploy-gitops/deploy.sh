#!/bin/bash
# ==============================================================================
# Order2bs - Auto Build & Deploy Script (GitOps Pattern)
# Dựa trên khuôn mẫu của argocd-deploy
# ==============================================================================

set -e

# ------------------------------------------------------------------------------
# Tham số & Cấu hình
# ------------------------------------------------------------------------------
BRANCH="${1:-main}"
HARBOR_REGISTRY="${HARBOR_REGISTRY:-harbor.2bsystem.com.vn}"
HARBOR_PROJECT="${HARBOR_PROJECT:-order2bs}"
REPO_URL="${REPO_URL:-https://github.com/Anab821/Order2bs.git}"

# Tag: YYYYMMDD-BRANCH-SHORT_SHA
DATE_TAG=$(date +%Y%m%d)
SHA_TAG=$(git rev-parse --short HEAD || echo "unknown")
TAG="${DATE_TAG}-${BRANCH}-${SHA_TAG}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)" # Giả sử script nằm trong folder con của dự án
SOURCE_DIR="$PROJECT_ROOT"
HELM_VALUES="$SCRIPT_DIR/helm/order2bs/values.yaml"

echo "======================================================================"
echo "  🚀 ORDER2BS AUTO DEPLOY"
echo "  Branch : $BRANCH"
echo "  Tag    : $TAG"
echo "  Harbor : $HARBOR_REGISTRY/$HARBOR_PROJECT"
echo "======================================================================"

# ------------------------------------------------------------------------------
# Bước 1: Build & Push Backend (Golang)
# ------------------------------------------------------------------------------
echo ">>> Bước 1: Build & Push Backend image..."
BACKEND_IMG="$HARBOR_REGISTRY/$HARBOR_PROJECT/backend:$TAG"

cd "$SOURCE_DIR/backend"
docker build -t "$BACKEND_IMG" .
docker push "$BACKEND_IMG"
echo "    ✅ Backend image pushed: $BACKEND_IMG"

# ------------------------------------------------------------------------------
# Bước 2: Build & Push Frontend (React)
# ------------------------------------------------------------------------------
echo ">>> Bước 2: Build & Push Frontend image..."
FRONTEND_IMG="$HARBOR_REGISTRY/$HARBOR_PROJECT/frontend:$TAG"

cd "$SOURCE_DIR/frontend"
# Build Docker (Frontend build thường tốn RAM, nên build trong Dockerfile stage)
docker build -t "$FRONTEND_IMG" .
docker push "$FRONTEND_IMG"
echo "    ✅ Frontend image pushed: $FRONTEND_IMG"

# ------------------------------------------------------------------------------
# Bước 3: Cập nhật Helm Values (GitOps)
# ------------------------------------------------------------------------------
echo ">>> Bước 3: Cập nhật tag mới vào Helm values.yaml..."

# Sử dụng sed để update tag (đơn giản hơn Python nếu cấu hình YAML không quá phức tạp)
sed -i "s/backendTag: .*/backendTag: \"$TAG\"/" "$HELM_VALUES"
sed -i "s/frontendTag: .*/frontendTag: \"$TAG\"/" "$HELM_VALUES"

echo "    ✅ Updated values.yaml with tag: $TAG"

# ------------------------------------------------------------------------------
# Bước 4: Commit & Push thay đổi (Nếu script nằm trong repo deploy riêng)
# ------------------------------------------------------------------------------
# cd "$SCRIPT_DIR"
# git add .
# git commit -m "deploy: update images to $TAG"
# git push origin HEAD
# echo "    ✅ GitOps repository updated. ArgoCD will sync shortly."

echo "======================================================================"
echo "  🎉 HOÀN TẤT!"
echo "======================================================================"
