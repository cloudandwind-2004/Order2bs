# Kubernetes — Bài Giảng Lý Thuyết

---

## Chương 1: Tại Sao Cần Kubernetes?

### 1.1 Thời Kỳ Trước Container

Ngày xưa, deploy app lên server vật lý:

```
Server A: cài Java, MySQL, Tomcat, chạy app
Server B: cài Node.js, MongoDB, chạy app khác
```

**Vấn đề**:
- "Chạy được trên máy tôi nhưng không chạy được trên server" (dependency conflict)
- Tốn tài nguyên: mỗi app chiếm cả server
- Scale khó: muốn thêm instance phải mua server mới, cài lại từ đầu

### 1.2 Container Ra Đời (Docker)

Docker đóng gói app + toàn bộ dependency vào 1 **image**:

```
Image = app + runtime + libraries + config
Container = image đang chạy
```

**Vẫn còn vấn đề** khi có nhiều container trên nhiều máy:
- Container crash → ai restart?
- Traffic tăng → ai tạo thêm container?
- Server chết → container chạy ở đâu?
- Cập nhật version → làm sao không downtime?

### 1.3 Kubernetes Ra Đời

Kubernetes (viết tắt **K8s**) là **container orchestration platform**:

> K8s tự động quản lý vòng đời container trên nhiều máy chủ.

**K8s làm được**:
- Tự restart container khi crash
- Tự tạo thêm container khi tải cao (scale out)
- Di chuyển container sang máy khác khi máy chết
- Deploy không downtime
- Quản lý config, secret, storage tập trung

---

## Chương 2: Kiến Trúc Kubernetes

### 2.1 Cluster

**Cluster** = tập hợp nhiều máy tính (node) làm việc cùng nhau dưới sự quản lý của K8s.

```
┌────────────────────── Cluster ──────────────────────────┐
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              Control Plane                      │   │
│  │   (não - ra quyết định, quản lý toàn cluster)  │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│         ┌───────────────┼───────────────┐               │
│         ▼               ▼               ▼               │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│   │  Node 1  │   │  Node 2  │   │  Node 3  │           │
│   │ (Worker) │   │ (Worker) │   │ (Worker) │           │
│   │  Pod Pod │   │  Pod Pod │   │  Pod Pod │           │
│   └──────────┘   └──────────┘   └──────────┘           │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Control Plane

**Control Plane** là bộ não của cluster, gồm các thành phần:

| Thành phần | Vai trò |
|---|---|
| **API Server** | Cổng giao tiếp duy nhất. Mọi lệnh (kubectl, ArgoCD) đều đi qua đây |
| **etcd** | Database phân tán lưu toàn bộ trạng thái cluster |
| **Scheduler** | Quyết định Pod chạy trên Node nào (dựa trên tài nguyên) |
| **Controller Manager** | Vòng lặp kiểm tra: "thực tế có khớp với mong muốn không?" |

**Ví dụ Controller Manager hoạt động:**

```
Mong muốn (trong YAML): replicas: 3
Thực tế trên cluster:   2 pod đang chạy (1 vừa crash)

Controller Manager phát hiện → ra lệnh tạo thêm 1 pod → về đúng 3
```

### 2.3 Worker Node

Mỗi **Worker Node** là 1 máy tính (vật lý hoặc VM) chạy các container thực tế:

| Thành phần | Vai trò |
|---|---|
| **kubelet** | Agent nhận lệnh từ Control Plane, quản lý Pod trên node |
| **kube-proxy** | Xử lý network rules, routing traffic đến đúng Pod |
| **Container Runtime** | Chạy container thực tế (Docker, containerd, CRI-O) |

### 2.4 kubectl — Công Cụ Dòng Lệnh

```bash
kubectl            = công cụ CLI để giao tiếp với API Server

kubectl get pods           # xem danh sách pods
kubectl apply -f app.yaml  # áp dụng config
kubectl logs backend-xxx   # xem logs
kubectl describe pod xxx   # xem chi tiết
kubectl exec -it xxx -- sh # vào bên trong pod
```

---

## Chương 3: Các Đối Tượng Cơ Bản (K8s Objects)

K8s quản lý app qua các **object** được định nghĩa bằng file YAML.
Cấu trúc chung của mọi YAML trong K8s:

```yaml
apiVersion: apps/v1      # phiên bản API
kind: Deployment         # loại object
metadata:
  name: my-app           # tên
  namespace: default     # namespace chứa object
spec:                    # mô tả trạng thái mong muốn
  ...
```

### 3.1 Pod

**Pod** là đơn vị triển khai nhỏ nhất trong K8s.

- Chứa 1 hoặc nhiều container chạy **cùng node**, **cùng network namespace**
- Các container trong 1 pod giao tiếp qua `localhost`
- Pod có IP riêng, **nhưng IP thay đổi mỗi lần tạo lại**
- Pod là **ephemeral** (tạm thời) — không tự heal, không tự restart

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: app
      image: nginx:latest
      ports:
        - containerPort: 80
```

> **Lưu ý**: Trong thực tế, **không bao giờ tạo Pod trực tiếp**. Dùng Deployment để K8s tự quản lý.

### 3.2 ReplicaSet

**ReplicaSet** đảm bảo luôn có đúng N pod đang chạy:

```yaml
spec:
  replicas: 3          # Luôn duy trì 3 pod
  selector:
    matchLabels:
      app: my-app      # Quản lý các pod có label này
```

Nếu 1 pod crash → ReplicaSet tự tạo pod mới thay thế.

> **Lưu ý**: Cũng không tạo ReplicaSet trực tiếp — dùng Deployment.

### 3.3 Deployment

**Deployment** bọc ngoài ReplicaSet, thêm tính năng **update & rollback**:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  strategy:
    type: RollingUpdate       # Chiến lược update
    rollingUpdate:
      maxSurge: 1             # Tạo thêm tối đa 1 pod mới
      maxUnavailable: 0       # Không tắt pod cũ khi chưa có pod mới
  template:                   # Template để tạo pod
    metadata:
      labels:
        app: my-app
    spec:
      containers:
        - name: my-app
          image: my-image:v2
```

**Các chiến lược update:**

| Strategy | Cách hoạt động | Downtime |
|---|---|---|
| **RollingUpdate** | Tạo pod mới dần dần, tắt pod cũ dần dần | Không |
| **Recreate** | Tắt tất cả pod cũ, rồi tạo pod mới | Có |

**Rollback:**

```bash
kubectl rollout undo deployment/my-app          # về version trước
kubectl rollout undo deployment/my-app --to-revision=2  # về version cụ thể
kubectl rollout history deployment/my-app       # xem lịch sử
```

### 3.4 StatefulSet

**StatefulSet** dành cho **stateful application** (database, cache):

**Khác biệt so với Deployment:**

| | Deployment | StatefulSet |
|---|---|---|
| Tên Pod | `app-abc123` (random hash) | `app-0`, `app-1`, `app-2` (thứ tự cố định) |
| Thứ tự tạo | Song song | Tuần tự: 0 → 1 → 2 |
| Thứ tự xóa | Song song | Ngược lại: 2 → 1 → 0 |
| Volume | Chia sẻ hoặc không có | Mỗi pod có volume **riêng** gắn cố định |
| DNS | Không có hostname riêng | Mỗi pod có DNS riêng: `app-0.svc-name` |

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
spec:
  serviceName: "postgres-svc"  # Headless service
  replicas: 1
  template:
    spec:
      containers:
        - name: postgres
          image: postgres:16
```

### 3.5 DaemonSet

**DaemonSet** đảm bảo mỗi node chạy đúng 1 pod của loại đó:

```
Node 1 → log-collector pod
Node 2 → log-collector pod
Node 3 → log-collector pod
```

Dùng cho: log agent, monitoring agent, network plugin.

### 3.6 Job & CronJob

**Job**: chạy task 1 lần đến khi hoàn thành (database migration, batch processing)

**CronJob**: chạy Job theo lịch:

```yaml
kind: CronJob
spec:
  schedule: "0 2 * * *"    # Mỗi ngày lúc 2am
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: backup-tool
              command: ["./backup.sh"]
```

---

## Chương 4: Network Trong Kubernetes

### 4.1 Service

Vì Pod IP thay đổi liên tục, **Service** cung cấp địa chỉ ổn định:

```
Service = Load Balancer nội bộ, tự động tìm pod theo label
```

**Cách Service hoạt động:**

```
Client → Service (IP cố định) → [Pod A, Pod B, Pod C] (round-robin)
```

**4 loại Service:**

#### ClusterIP (mặc định)

```yaml
spec:
  type: ClusterIP      # Chỉ truy cập được từ trong cluster
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
```

Dùng cho: giao tiếp nội bộ giữa các service.

#### NodePort

```yaml
spec:
  type: NodePort
  ports:
    - port: 80
      targetPort: 8080
      nodePort: 30080   # Port mở trên mỗi node (30000-32767)
```

Truy cập: `<NodeIP>:30080` từ bên ngoài cluster.
Dùng cho: dev/staging, expose tạm thời.

#### LoadBalancer

```yaml
spec:
  type: LoadBalancer   # Yêu cầu cloud provider tạo external LB
```

Dùng cho: production trên cloud (AWS ELB, GCP LB...).

#### Headless Service

```yaml
spec:
  clusterIP: None     # Không tạo IP ảo, trả về IP của các pod
```

Dùng cho: StatefulSet — để pod có DNS riêng (`postgres-0.postgres-svc`).

### 4.2 Ingress

**Ingress** là HTTP/HTTPS router cho cluster:

```
Internet → Ingress Controller → Ingress Rules → Service → Pod
```

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
spec:
  rules:
    - host: myapp.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-svc
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-svc
                port:
                  number: 80
```

**Ingress Controller** là thành phần thực thi Ingress rules (phải cài riêng):
- `ingress-nginx` (phổ biến nhất)
- `traefik`
- `HAProxy Ingress`

---

## Chương 5: Config & Storage

### 5.1 ConfigMap

Lưu cấu hình **không bí mật** dưới dạng key-value:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  DB_HOST: "postgres-svc"
  DB_PORT: "5432"
  MAX_CONN: "100"
```

**Cách sử dụng trong Pod:**

```yaml
# Cách 1: inject toàn bộ thành env vars
envFrom:
  - configMapRef:
      name: app-config

# Cách 2: chọn từng key
env:
  - name: DATABASE_HOST
    valueFrom:
      configMapKeyRef:
        name: app-config
        key: DB_HOST

# Cách 3: mount thành file
volumes:
  - name: config-vol
    configMap:
      name: app-config
volumeMounts:
  - name: config-vol
    mountPath: /etc/config
```

### 5.2 Secret

Lưu thông tin **nhạy cảm** (password, token, certificate):

```bash
# Tạo Secret
kubectl create secret generic my-secret \
  --from-literal=DB_PASSWORD="s3cr3t" \
  --from-literal=JWT_KEY="myjwtkey"
```

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: my-secret
type: Opaque
data:
  DB_PASSWORD: czNjcjN0   # base64 encode
```

> **Lưu ý**: Secret chỉ encode base64, **không phải mã hóa**. Cần dùng thêm Sealed Secrets hoặc Vault để bảo mật thực sự.

### 5.3 Volumes & PersistentVolume

**Volume** = thư mục chia sẻ dữ liệu cho container trong Pod.
Vấn đề: Volume gắn với Pod — Pod xóa, data mất.

**PersistentVolume (PV)** = "ổ cứng" tồn tại độc lập với Pod.

**PersistentVolumeClaim (PVC)** = "đơn đặt hàng" ổ cứng:

```yaml
# Bước 1: Admin tạo PV (hoặc StorageClass tự động tạo)
kind: PersistentVolume
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: /data/postgres

# Bước 2: Developer tạo PVC (claim)
kind: PersistentVolumeClaim
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi

# Bước 3: Pod dùng PVC
volumes:
  - name: data
    persistentVolumeClaim:
      claimName: my-pvc
```

**Access Modes:**

| Mode | Viết tắt | Ý nghĩa |
|---|---|---|
| ReadWriteOnce | RWO | 1 node đọc/ghi |
| ReadOnlyMany | ROX | Nhiều node đọc |
| ReadWriteMany | RWX | Nhiều node đọc/ghi |

**StorageClass**: tự động tạo PV khi có PVC (dynamic provisioning).

---

## Chương 6: Quản Lý Tài Nguyên

### 6.1 Resource Requests & Limits

```yaml
resources:
  requests:          # Tài nguyên đảm bảo được cấp (Scheduler dùng để chọn node)
    cpu: 100m        # 100 millicores = 0.1 CPU
    memory: 128Mi
  limits:            # Tài nguyên tối đa được dùng
    cpu: 500m
    memory: 512Mi
```

| | Requests | Limits |
|---|---|---|
| **Ý nghĩa** | "Tôi cần ít nhất..." | "Tôi dùng tối đa..." |
| **Dùng bởi** | Scheduler (chọn node) | Kubelet (cắt giảm nếu vượt) |
| **Nếu vượt** | Không áp dụng | CPU: throttle / RAM: OOMKill pod |

### 6.2 Horizontal Pod Autoscaler (HPA)

Tự động thay đổi số Pod theo mức sử dụng tài nguyên:

```yaml
kind: HorizontalPodAutoscaler
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: my-app
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70   # Scale up khi CPU trung bình > 70%
```

**HPA hoạt động:**

```
Số pod cần = ceil(current_pods × current_metric / target_metric)

Ví dụ:
  current_pods = 2, CPU hiện tại = 90%, target = 70%
  → cần = ceil(2 × 90 / 70) = ceil(2.57) = 3 pods
```

### 6.3 Vertical Pod Autoscaler (VPA)

Tự động điều chỉnh **requests/limits** của container (không thay đổi số pod).

### 6.4 Cluster Autoscaler

Tự động thêm/xóa **Node** khi không đủ tài nguyên cho Pod pending.

---

## Chương 7: Health Check

### 7.1 Liveness Probe

**"Pod còn sống không?"**

Nếu fail → **kubelet restart pod**.

```yaml
livenessProbe:
  httpGet:              # Gọi HTTP endpoint
    path: /healthz
    port: 8080
  initialDelaySeconds: 30   # Chờ 30s sau khi start mới bắt đầu check
  periodSeconds: 10         # Check mỗi 10s
  timeoutSeconds: 5         # Timeout sau 5s
  failureThreshold: 3       # Fail 3 lần liên tiếp mới restart
```

**3 loại probe:**

```yaml
# HTTP GET
httpGet:
  path: /healthz
  port: 8080

# TCP Socket
tcpSocket:
  port: 5432

# Exec Command
exec:
  command:
    - pg_isready
    - -U
    - postgres
```

### 7.2 Readiness Probe

**"Pod sẵn sàng nhận traffic chưa?"**

Nếu fail → **Service tạm thời không route traffic** vào pod này (nhưng KHÔNG restart).

```yaml
readinessProbe:
  httpGet:
    path: /ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 5
  failureThreshold: 3
```

**Khi nào readiness hữu ích?**

Khi app cần thời gian khởi tạo (load cache, warm up connection pool) — chưa sẵn sàng nhận request dù đã start xong.

### 7.3 Startup Probe

**"App đã finish startup chưa?"**

Dành cho app khởi động chậm. Trong thời gian startup probe chạy, liveness probe bị tắt:

```yaml
startupProbe:
  httpGet:
    path: /healthz
    port: 8080
  failureThreshold: 30     # Cho phép đến 30 × 10s = 5 phút để startup
  periodSeconds: 10
```

---

## Chương 8: Namespace & RBAC

### 8.1 Namespace

Phân chia cluster thành các **môi trường ảo**:

```
cluster
├── namespace: production    ← app thật
├── namespace: staging       ← test trước khi lên prod
├── namespace: development   ← dev
└── namespace: monitoring    ← Prometheus, Grafana
```

```bash
kubectl create namespace production
kubectl get pods -n production
kubectl apply -f app.yaml -n production
```

### 8.2 RBAC (Role-Based Access Control)

Phân quyền ai được làm gì trong K8s:

```yaml
# Role: quyền trong 1 namespace
kind: Role
rules:
  - apiGroups: ["apps"]
    resources: ["deployments"]
    verbs: ["get", "list", "watch"]   # chỉ đọc, không sửa

# ClusterRole: quyền trên toàn cluster
kind: ClusterRole

# RoleBinding: gán Role cho user/serviceaccount
kind: RoleBinding
subjects:
  - kind: User
    name: developer
roleRef:
  kind: Role
  name: read-deployments
```

---

## Chương 9: GitOps & ArgoCD

### 9.1 GitOps là gì?

**GitOps** = dùng Git làm **source of truth** cho infrastructure:

```
Mọi thay đổi config → commit lên Git → tự động apply vào cluster
```

**Nguyên tắc GitOps:**
1. Toàn bộ config lưu trong Git
2. Cluster **luôn** phải khớp với Git
3. Mọi thay đổi phải qua Git (không sửa trực tiếp trên cluster)
4. Tự động sync liên tục

### 9.2 ArgoCD

ArgoCD là **GitOps controller** cho Kubernetes:

```
ArgoCD liên tục so sánh:
  Git repo (desired state) ←→ K8s cluster (actual state)

Nếu khác nhau → tự động sync → cluster = Git
```

```yaml
# ArgoCD Application
kind: Application
spec:
  source:
    repoURL: https://github.com/user/repo
    path: k8s/overlays/prod       # Kustomize path
    targetRevision: main
  destination:
    server: https://kubernetes.default.svc
    namespace: my-app
  syncPolicy:
    automated:
      prune: true      # Xóa resource không còn trong Git
      selfHeal: true   # Tự phục hồi nếu ai sửa tay trên cluster
```

---

## Chương 10: Kustomize

**Kustomize** = công cụ quản lý YAML K8s cho nhiều môi trường **mà không cần template engine**.

### Cấu Trúc

```
k8s/
├── base/                    ← Config chung
│   ├── deployment.yaml
│   ├── service.yaml
│   └── kustomization.yaml
└── overlays/
    ├── dev/                 ← Ghi đè cho dev
    │   └── kustomization.yaml
    └── prod/                ← Ghi đè cho prod
        └── kustomization.yaml
```

### base/kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization
resources:
  - deployment.yaml
  - service.yaml
```

### overlays/prod/kustomization.yaml

```yaml
apiVersion: kustomize.config.k8s.io/v1beta1
kind: Kustomization

namespace: my-app-prod

resources:
  - ../../base          # Kế thừa toàn bộ base

# Ghi đè replicas
patches:
  - patch: |-
      - op: replace
        path: /spec/replicas
        value: 5
    target:
      kind: Deployment
      name: my-app

# Ghi đè image tag
images:
  - name: my-image
    newTag: v2.1.0
```

**Chạy Kustomize:**

```bash
kubectl apply -k k8s/overlays/prod/
kustomize build k8s/overlays/prod/ | kubectl apply -f -
```

---

## Tổng Kết

### Bảng Tóm Tắt Các Object

| Object | Vai trò | Khi nào dùng |
|---|---|---|
| **Pod** | Đơn vị chạy container | Không dùng trực tiếp |
| **Deployment** | Quản lý stateless app | Backend, Frontend |
| **StatefulSet** | Quản lý stateful app | Database, Cache |
| **DaemonSet** | 1 pod mỗi node | Log agent, Monitor agent |
| **Job** | Task chạy 1 lần | Migration, Batch |
| **CronJob** | Task theo lịch | Backup, Report |
| **Service** | Địa chỉ cố định cho Pod | Luôn cần |
| **Ingress** | HTTP router | Expose web app |
| **ConfigMap** | Config không bí mật | App config |
| **Secret** | Config bí mật | Password, Token |
| **PVC** | Yêu cầu storage | DB, File storage |
| **HPA** | Auto-scale pod | Production app |
| **Namespace** | Tách môi trường | Multi-env |

### Luồng Học K8s Theo Thứ Tự

```
1. Hiểu Pod → Container chạy trong K8s
2. Hiểu Deployment → Quản lý Pod, rolling update
3. Hiểu Service → Network giữa các pod
4. Hiểu ConfigMap & Secret → Inject config
5. Hiểu PVC → Lưu trữ bền vững
6. Hiểu Ingress → Expose app ra ngoài
7. Hiểu Namespace → Tách môi trường
8. Hiểu HPA → Auto-scale
9. Hiểu StatefulSet → Deploy database
10. Hiểu RBAC → Phân quyền
11. Hiểu GitOps / ArgoCD → Tự động hóa deployment
```

### Câu Tóm Gọn

> **Kubernetes** = hệ thống tự động đảm bảo app luôn chạy đúng trạng thái mong muốn,
> tự phục hồi khi lỗi, tự scale theo tải — mà không cần người can thiệp thủ công.
