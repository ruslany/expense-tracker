@description('Name of the PostgreSQL server')
param name string

@description('Azure region for resources')
param location string

@description('Name of the database to create')
param databaseName string = 'expense_tracker'

@description('Tags to apply to resources')
param tags object = {}

@description('List of IP addresses to allow access (each entry should be a single IP or a range with startIp and endIp)')
param allowedIpAddresses array = []

resource postgresServer 'Microsoft.DBforPostgreSQL/flexibleServers@2023-12-01-preview' = {
  name: name
  location: location
  tags: tags
  sku: {
    name: 'Standard_B1ms'
    tier: 'Burstable'
  }
  properties: {
    version: '16'
    storage: {
      storageSizeGB: 32
    }
    backup: {
      backupRetentionDays: 7
      geoRedundantBackup: 'Disabled'
    }
    highAvailability: {
      mode: 'Disabled'
    }
    authConfig: {
      activeDirectoryAuth: 'Enabled'
      passwordAuth: 'Disabled'
    }
  }
}

resource database 'Microsoft.DBforPostgreSQL/flexibleServers/databases@2023-12-01-preview' = {
  parent: postgresServer
  name: databaseName
  properties: {
    charset: 'UTF8'
    collation: 'en_US.utf8'
  }
}

// Firewall rules for allowed IP addresses
resource firewallRules 'Microsoft.DBforPostgreSQL/flexibleServers/firewallRules@2023-12-01-preview' = [
  for (ip, i) in allowedIpAddresses: {
    parent: postgresServer
    name: 'AllowedIP-${i}'
    properties: {
      startIpAddress: ip
      endIpAddress: ip
    }
  }
]

@description('The resource ID of the PostgreSQL server')
output id string = postgresServer.id

@description('The name of the PostgreSQL server')
output name string = postgresServer.name

@description('The FQDN of the PostgreSQL server')
output fqdn string = postgresServer.properties.fullyQualifiedDomainName

@description('The name of the database')
output databaseName string = database.name
