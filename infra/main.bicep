@description('Base name for all resources')
param appName string

@description('Azure region for resources')
param location string

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

@description('Auth.js base URL for OAuth redirects')
param authUrl string

@description('Docker image to deploy (e.g., docker.io/username/expense-tracker:latest)')
param dockerImage string

var tags = {
  application: appName
  managedBy: 'bicep'
}

module containerAppEnv 'modules/container-app-env.bicep' = {
  name: '${appName}-env-deployment'
  params: {
    name: '${appName}-env'
    location: location
    tags: tags
  }
}

module containerApp 'modules/container-app.bicep' = {
  name: '${appName}-app-deployment'
  params: {
    name: appName
    location: location
    containerAppEnvId: containerAppEnv.outputs.id
    dockerImage: dockerImage
    databaseUrl: databaseUrl
    authSecret: authSecret
    authGoogleId: authGoogleId
    authGoogleSecret: authGoogleSecret
    allowedEmails: allowedEmails
    authUrl: authUrl
    tags: tags
  }
}

@description('The URL of the deployed application')
output appUrl string = containerApp.outputs.url

@description('The FQDN of the deployed application')
output appFqdn string = containerApp.outputs.fqdn
