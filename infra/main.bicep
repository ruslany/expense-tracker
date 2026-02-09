@description('Base name for all resources')
param appName string

@description('Azure region for resources')
param location string

@description('Auth.js secret key')
@secure()
param authSecret string

@description('Google OAuth client ID')
@secure()
param authGoogleId string

@description('Google OAuth client secret')
@secure()
param authGoogleSecret string

@description('Admin email address (bootstraps the first admin user)')
param adminEmail string

@description('Auth.js base URL for OAuth redirects')
param authUrl string

@description('Docker image to deploy (e.g., docker.io/username/expense-tracker:latest)')
param dockerImage string

@description('List of IP addresses allowed to access PostgreSQL')
param postgresAllowedIpAddresses array = []

@description('Custom domain name for the Container App (optional)')
param customDomainName string = ''

@description('Managed certificate ID for custom domain (optional)')
param customDomainCertificateId string = ''

var tags = {
  application: appName
  managedBy: 'bicep'
}

// 1. User-Assigned Managed Identity
module managedIdentity 'modules/managed-identity.bicep' = {
  name: '${appName}-identity-deployment'
  params: {
    name: '${appName}-identity'
    location: location
    tags: tags
  }
}

// 2. Key Vault (with RBAC for managed identity)
module keyVault 'modules/key-vault.bicep' = {
  name: '${appName}-kv-deployment'
  params: {
    name: '${appName}-kv'
    location: location
    managedIdentityPrincipalId: managedIdentity.outputs.principalId
    tags: tags
  }
}

// 3. PostgreSQL Flexible Server
module postgresql 'modules/postgresql.bicep' = {
  name: '${appName}-postgres-deployment'
  params: {
    name: '${appName}-postgres'
    location: location
    databaseName: 'expense_tracker'
    allowedIpAddresses: postgresAllowedIpAddresses
    tags: tags
  }
}

// 4. Key Vault Secrets
module keyVaultSecrets 'modules/key-vault-secrets.bicep' = {
  name: '${appName}-secrets-deployment'
  params: {
    keyVaultName: keyVault.outputs.name
    secrets: {
      'auth-secret': authSecret
      'auth-google-id': authGoogleId
      'auth-google-secret': authGoogleSecret
    }
  }
}

// 5. Container Apps Environment
module containerAppEnv 'modules/container-app-env.bicep' = {
  name: '${appName}-env-deployment'
  params: {
    name: '${appName}-env'
    location: location
    tags: tags
  }
}

// 6. Container App (with identity + Key Vault secret references)
module containerApp 'modules/container-app.bicep' = {
  name: '${appName}-app-deployment'
  params: {
    name: appName
    location: location
    containerAppEnvId: containerAppEnv.outputs.id
    dockerImage: dockerImage
    managedIdentityName: managedIdentity.outputs.name
    keyVaultUri: keyVault.outputs.uri
    postgresServerFqdn: postgresql.outputs.fqdn
    postgresDatabaseName: postgresql.outputs.databaseName
    adminEmail: adminEmail
    authUrl: authUrl
    tags: tags
    customDomainName: customDomainName
    customDomainCertificateId: customDomainCertificateId
  }
  dependsOn: [
    keyVaultSecrets
  ]
}

@description('The URL of the deployed application')
output appUrl string = containerApp.outputs.url

@description('The FQDN of the deployed application')
output appFqdn string = containerApp.outputs.fqdn
