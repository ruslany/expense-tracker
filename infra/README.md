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

All deployment commands require environment variables to be loaded first. Create a `.env` file (gitignored) with your secrets:

```bash
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
ALLOWED_EMAILS="user1@example.com,user2@example.com"
```

### First-time deployment

```bash
source .env && just initial-deploy
```

This will:

1. Create the resource group
2. Build and push Docker image
3. Deploy Azure infrastructure with all secrets

### Deploy code changes

```bash
just build-push update-app
```

### Full redeployment

```bash
source .env && just deploy-all
```

## Commands Reference

| Command | Description |
| --------- | ------------- |
| `source .env && just initial-deploy` | First-time deployment |
| `just build-push` | Build and push Docker image |
| `just update-app` | Update container with new image |
| `source .env && just deploy-all` | Full redeployment |
| `just status` | Check deployment status |
| `just logs` | Stream container logs |
| `just app-url` | Get application URL |
| `just revisions` | List container revisions |
| `just restart` | Restart the container |
| `source .env && just what-if` | Preview infrastructure changes |
| `source .env && just validate` | Validate Bicep templates |
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
| ---------- | --------- |
| Container Apps Environment | Managed Kubernetes hosting |
| Container App | The running application |

## Secrets

All secrets are stored encrypted in Azure Container Apps and passed via Bicep parameters at deploy time:

| Secret | Environment Variable | Description |
| ------ | -------------------- | ----------- |
| `database-url` | `DATABASE_URL` | PostgreSQL connection string |
| `auth-secret` | `AUTH_SECRET` | Auth.js session encryption key |
| `auth-google-id` | `AUTH_GOOGLE_ID` | Google OAuth client ID |
| `auth-google-secret` | `AUTH_GOOGLE_SECRET` | Google OAuth client secret |
| `allowed-emails` | `ALLOWED_EMAILS` | Comma-separated list of allowed emails |
