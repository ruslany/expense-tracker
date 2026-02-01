@description('Name of the Key Vault')
param keyVaultName string

@description('Secrets to create as key-value pairs')
@secure()
param secrets object

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' existing = {
  name: keyVaultName
}

resource keyVaultSecrets 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = [for secret in items(secrets): {
  parent: keyVault
  name: secret.key
  properties: {
    value: secret.value
  }
}]
