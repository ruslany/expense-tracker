# Azure Container Apps Deployment

Deploy expense-tracker to Azure Container Apps using Bicep infrastructure-as-code.

## Prerequisites

```bash
# Azure CLI with Bicep
az login
az bicep install
az extension add --name containerapp --upgrade

# Docker Hub login
docker login
```

## Configuration

Environment variables (optional - defaults shown):

| Variable | Default | Description |
| ---------- | --------- | ------------- |
| `APP_NAME` | `expense-tracker` | Container App name |
| `RESOURCE_GROUP` | `expense-tracker-rg` | Azure resource group |
| `LOCATION` | `canadacentral` | Azure region |
| `DOCKER_IMAGE` | `ruslany/yoet` | Docker Hub image |

## Deployment

### First-time deployment

```bash
just initial-deploy 'postgresql://user:pass@host:5432/db?sslmode=require'
```

This will:

1. Create the resource group
2. Build and push Docker image (tagged with `latest` and commit ID)
3. Deploy Azure infrastructure

### Deploy code changes

```bash
just build-push update-app
```

### Full redeployment

```bash
just deploy-all 'postgresql://...'
```

## Commands Reference

| Command | Description |
| --------- | ------------- |
| `just initial-deploy '<db_url>'` | First-time deployment |
| `just build-push` | Build and push Docker image |
| `just update-app` | Update container with new image |
| `just deploy-all '<db_url>'` | Full redeployment |
| `just status` | Check deployment status |
| `just logs` | Stream container logs |
| `just app-url` | Get application URL |
| `just revisions` | List container revisions |
| `just restart` | Restart the container |
| `just what-if '<db_url>'` | Preview infrastructure changes |
| `just validate '<db_url>'` | Validate Bicep templates |
| `just destroy` | Delete all resources |

## Architecture

```bash
Azure Resource Group
└── Container Apps Environment
    └── Container App
        ├── Ingress: External HTTPS on port 3000
        ├── Scaling: 0-3 replicas (HTTP-based)
        └── Resources: 0.5 vCPU, 1Gi memory
```

## Resources Created

| Resource | Purpose |
|----------|---------|
| Container Apps Environment | Managed Kubernetes hosting |
| Container App | The running application |

## Secrets

- `DATABASE_URL` - Stored as Container Apps secret, passed via Bicep parameter
