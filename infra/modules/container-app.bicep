@description('Name of the Container App')
param name string

@description('Azure region for resources')
param location string

@description('Resource ID of the Container Apps Environment')
param containerAppEnvId string

@description('Docker image to deploy')
param dockerImage string

@description('Database connection URL')
@secure()
param databaseUrl string

@description('Auth.js secret key')
@secure()
param authSecret string

@description('Google OAuth client ID')
@secure()
param authGoogleId string

@description('Google OAuth client secret')
@secure()
param authGoogleSecret string

@description('Comma-separated list of allowed emails')
@secure()
param allowedEmails string = ''

@description('Tags to apply to resources')
param tags object = {}

resource containerApp 'Microsoft.App/containerApps@2024-03-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    managedEnvironmentId: containerAppEnvId
    configuration: {
      ingress: {
        external: true
        targetPort: 3000
        transport: 'http'
        allowInsecure: false
      }
      secrets: [
        {
          name: 'database-url'
          value: databaseUrl
        }
        {
          name: 'auth-secret'
          value: authSecret
        }
        {
          name: 'auth-google-id'
          value: authGoogleId
        }
        {
          name: 'auth-google-secret'
          value: authGoogleSecret
        }
        {
          name: 'allowed-emails'
          value: allowedEmails
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
              secretRef: 'database-url'
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
