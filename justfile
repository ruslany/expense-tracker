# Azure Container Apps deployment for expense-tracker

# Configuration (override via environment variables)
app_name := env_var_or_default("APP_NAME", "expense-tracker")
resource_group := env_var_or_default("RESOURCE_GROUP", "expense-tracker-rg")
location := env_var_or_default("LOCATION", "canadacentral")
docker_image := env_var_or_default("DOCKER_IMAGE", "ruslany/yoet")

# Default recipe - show available commands
default:
    @just --list

# Create resource group
create-rg:
    az group create --name {{resource_group}} --location {{location}}

# Validate Bicep templates (requires: source .env first)
validate:
    az deployment group validate \
        --resource-group {{resource_group}} \
        --template-file infra/main.bicep \
        --parameters appName='{{app_name}}' \
        --parameters location='{{location}}' \
        --parameters databaseUrl="$DATABASE_URL" \
        --parameters authSecret="$AUTH_SECRET" \
        --parameters authGoogleId="$AUTH_GOOGLE_ID" \
        --parameters authGoogleSecret="$AUTH_GOOGLE_SECRET" \
        --parameters allowedEmails="$ALLOWED_EMAILS" \
        --parameters dockerImage='{{docker_image}}:latest'

# Preview infrastructure changes (requires: source .env first)
what-if:
    az deployment group what-if \
        --resource-group {{resource_group}} \
        --template-file infra/main.bicep \
        --parameters appName='{{app_name}}' \
        --parameters location='{{location}}' \
        --parameters databaseUrl="$DATABASE_URL" \
        --parameters authSecret="$AUTH_SECRET" \
        --parameters authGoogleId="$AUTH_GOOGLE_ID" \
        --parameters authGoogleSecret="$AUTH_GOOGLE_SECRET" \
        --parameters allowedEmails="$ALLOWED_EMAILS" \
        --parameters dockerImage='{{docker_image}}:latest'

# Deploy infrastructure (requires: source .env first)
deploy-infra:
    az deployment group create \
        --resource-group {{resource_group}} \
        --template-file infra/main.bicep \
        --parameters appName='{{app_name}}' \
        --parameters location='{{location}}' \
        --parameters databaseUrl="$DATABASE_URL" \
        --parameters authSecret="$AUTH_SECRET" \
        --parameters authGoogleId="$AUTH_GOOGLE_ID" \
        --parameters authGoogleSecret="$AUTH_GOOGLE_SECRET" \
        --parameters allowedEmails="$ALLOWED_EMAILS" \
        --parameters dockerImage='{{docker_image}}:latest'

# Build Docker image
build:
    docker build -t {{docker_image}}:latest .

# Push Docker image to Docker Hub
push:
    docker push {{docker_image}}:latest

# Build and push Docker image
build-push: build push

# Update Container App with new image
update-app:
    az containerapp update \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --image {{docker_image}}:latest

# Initial deployment (create RG + deploy infra + build + push)
# Requires: source .env first
initial-deploy: create-rg build-push deploy-infra

# Full deployment (infra + build + push + update)
# Requires: source .env first
deploy-all: build-push deploy-infra

# Stream container logs
logs:
    az containerapp logs show \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --follow

# Check deployment status
status:
    @echo "=== Container App Status ==="
    az containerapp show \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --query "{name:name, state:properties.runningStatus, url:properties.configuration.ingress.fqdn, replicas:properties.template.scale}" \
        --output table

# Get application URL
app-url:
    @az containerapp show \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --query "properties.configuration.ingress.fqdn" \
        --output tsv | xargs -I {} echo "https://{}"

# Delete all resources
destroy:
    az group delete --name {{resource_group}} --yes --no-wait

# Show current revisions
revisions:
    az containerapp revision list \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --output table

# Restart the container app
restart:
    az containerapp revision restart \
        --name {{app_name}} \
        --resource-group {{resource_group}} \
        --revision $(az containerapp revision list --name {{app_name}} --resource-group {{resource_group}} --query "[0].name" -o tsv)
