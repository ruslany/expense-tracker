@description('Name of the Container App')
param name string

@description('Azure region for resources')
param location string

@description('Resource ID of the Container Apps Environment')
param containerAppEnvId string

@description('Docker image to deploy')
param dockerImage string

@description('Name of the user-assigned managed identity')
param managedIdentityName string

@description('URI of the Key Vault')
param keyVaultUri string

@description('FQDN of the PostgreSQL server')
param postgresServerFqdn string

@description('Name of the PostgreSQL database')
param postgresDatabaseName string

@description('Auth.js base URL for OAuth redirects')
param authUrl string

@description('Tags to apply to resources')
param tags object = {}

@description('Custom domain name (optional)')
param customDomainName string = ''

@description('Managed certificate ID for custom domain (optional)')
param customDomainCertificateId string = ''

// Reference existing managed identity to get its properties
resource managedIdentity 'Microsoft.ManagedIdentity/userAssignedIdentities@2023-01-31' existing = {
  name: managedIdentityName
}

// Construct DATABASE_URL for Azure AD authentication
// Format: postgresql://<identity-name>@<server-fqdn>:5432/<database>?sslmode=require
var databaseUrl = 'postgresql://${managedIdentityName}@${postgresServerFqdn}:5432/${postgresDatabaseName}?sslmode=require'

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  tags: tags
  identity: {
    type: 'UserAssigned'
    userAssignedIdentities: {
      '${managedIdentity.id}': {}
    }
  }
  properties: {
    managedEnvironmentId: containerAppEnvId
    configuration: {
      maxInactiveRevisions: 3
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
        customDomains: !empty(customDomainName) ? [
          {
            name: customDomainName
            certificateId: customDomainCertificateId
            bindingType: 'SniEnabled'
          }
        ] : []
      }
      secrets: [
        {
          name: 'auth-secret'
          keyVaultUrl: '${keyVaultUri}secrets/auth-secret'
          identity: managedIdentity.id
        }
        {
          name: 'auth-google-id'
          keyVaultUrl: '${keyVaultUri}secrets/auth-google-id'
          identity: managedIdentity.id
        }
        {
          name: 'auth-google-secret'
          keyVaultUrl: '${keyVaultUri}secrets/auth-google-secret'
          identity: managedIdentity.id
        }
        {
          name: 'allowed-emails'
          keyVaultUrl: '${keyVaultUri}secrets/allowed-emails'
          identity: managedIdentity.id
        }
      ]
    }
    template: {
      containers: [
        {
          name: name
          image: dockerImage
          resources: {
            cpu: json('0.5')
            memory: '1Gi'
          }
          env: [
            {
              name: 'DATABASE_URL'
              value: databaseUrl
            }
            {
              name: 'AZURE_CLIENT_ID'
              value: managedIdentity.properties.clientId
            }
            {
              name: 'AUTH_SECRET'
              secretRef: 'auth-secret'
            }
            {
              name: 'AUTH_GOOGLE_ID'
              secretRef: 'auth-google-id'
            }
            {
              name: 'AUTH_GOOGLE_SECRET'
              secretRef: 'auth-google-secret'
            }
            {
              name: 'ALLOWED_EMAILS'
              secretRef: 'allowed-emails'
            }
            {
              name: 'AUTH_TRUST_HOST'
              value: 'true'
            }
            {
              name: 'AUTH_URL'
              value: authUrl
            }
          ]
        }
      ]
      scale: {
        minReplicas: 0
        maxReplicas: 3
        rules: [
          {
            name: 'http-scaling'
            http: {
              metadata: {
                concurrentRequests: '10'
              }
            }
          }
        ]
      }
    }
  }
}

@description('The FQDN of the Container App')
output fqdn string = containerApp.properties.configuration.ingress.fqdn

@description('The URL of the Container App')
output url string = 'https://${containerApp.properties.configuration.ingress.fqdn}'

@description('The resource ID of the Container App')
output id string = containerApp.id
