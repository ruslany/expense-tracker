# Azure Container Apps deployment for expense-tracker

# Automatically load .env file and export to subshells
set dotenv-load
set export

# Configuration (override via environment variables)
app_name := env_var_or_default("APP_NAME", "et-app")
resource_group := env_var_or_default("RESOURCE_GROUP", "et-rg")
location := env_var_or_default("LOCATION", "canadacentral")

# Default recipe - show available commands
default:
    @just --list

# Deploy infrastructure with specified image
# Usage: just deploy <image:tag>
# Example: just deploy ruslany/yoet:abc1234
deploy image:
    az deployment group create \
        --resource-group {{resource_group}} \
        --template-file infra/main.bicep \
        --parameters appName='{{app_name}}' \
        --parameters location='{{location}}' \
        --parameters dockerImage='docker.io/{{image}}' \
        --parameters postgresAdminPassword="$POSTGRES_ADMIN_PASSWORD" \
        --parameters authSecret="$AUTH_SECRET" \
        --parameters authGoogleId="$AUTH_GOOGLE_ID" \
        --parameters authGoogleSecret="$AUTH_GOOGLE_SECRET" \
        --parameters allowedEmails="$ALLOWED_EMAILS" \
        --parameters authUrl="$AUTH_URL"
