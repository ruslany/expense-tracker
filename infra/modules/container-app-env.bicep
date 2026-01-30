@description('Name of the Container Apps Environment')
param name string

@description('Azure region for resources')
param location string

@description('Tags to apply to resources')
param tags object = {}

resource containerAppEnv 'Microsoft.App/managedEnvironments@2024-03-01' = {
  name: name
  location: location
  tags: tags
  properties: {
    zoneRedundant: false
  }
}

@description('The resource ID of the Container Apps Environment')
output id string = containerAppEnv.id

@description('The name of the Container Apps Environment')
output name string = containerAppEnv.name
