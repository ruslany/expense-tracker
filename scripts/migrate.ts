import { exec } from 'child_process';
import { DefaultAzureCredential } from '@azure/identity';

async function runMigration() {
  const credential = new DefaultAzureCredential();
  const token = await credential.getToken('https://ossrdbms-aad.database.windows.net/.default');

  const host = process.env.PROD_DB_HOST;
  const database = process.env.PROD_DB_NAME;
  const user = process.env.PROD_DB_USER; // Your Azure AD user/identity name

  // Construct the connection URL with the token as password
  const url = `postgresql://${encodeURIComponent(user!)}:${encodeURIComponent(token.token)}@${host}:5432/${database}?sslmode=verify-full`;

  // Run prisma migrate with the constructed URL
  exec(`DATABASE_URL="${url}" npx prisma migrate deploy`, (error, stdout, stderr) => {
    console.log(stdout);
    if (stderr) console.error(stderr);
    if (error) process.exit(1);
  });
}

runMigration();
