# Azure Container Apps deployment for expense-tracker

# Automatically load .env file and export to subshells
set dotenv-load
set export

# Configuration (override via environment variables)
app_name := env_var_or_default("APP_NAME", "et-app")
resource_group := env_var_or_default("RESOURCE_GROUP", "et-rg")
location := env_var_or_default("LOCATION", "canadacentral")

# Production database connection
prod_db_host := env_var_or_default("PROD_DB_HOST", "")
prod_db_name := env_var_or_default("PROD_DB_NAME", "postgres")
prod_db_user := env_var_or_default("PROD_DB_USER", "")

# Default recipe - show available commands
default:
    @just --list

# Build Docker image
build:
    docker build -t expense-tracker .

# Run Prisma migrations against production database using Azure managed identity
migrate:
    npx tsx scripts/migrate.ts

# Import categories from CSV to production database using Azure managed identity
import-categories:
    npx tsx scripts/import-categories.ts

# Connect to production PostgreSQL using Azure managed identity
pgconnect:
    PGPASSWORD="$(az account get-access-token --resource-type oss-rdbms --query accessToken -o tsv)" \
    psql "host={{prod_db_host}} dbname={{prod_db_name}} user={{prod_db_user}} sslmode=require"

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
        --parameters authSecret="$AUTH_SECRET" \
        --parameters authGoogleId="$AUTH_GOOGLE_ID" \
        --parameters authGoogleSecret="$AUTH_GOOGLE_SECRET" \
        --parameters allowedEmails="$ALLOWED_EMAILS" \
        --parameters authUrl="$AUTH_URL"
