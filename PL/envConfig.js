import dotenv from 'dotenv';
dotenv.config();

function maskSecret(secret) {
  if (!secret) return undefined;
  return '*'.repeat(secret.length);
}

export function getTestEnv() {
  const env = (process.env.TEST_ENV || 'BP').toUpperCase();       // "BP" or "PROD"
  const conn = (process.env.CONNECTION_TYPE || 'EBU').toUpperCase(); // "EBU" or "CBU"

  // Build keys dynamically
  const baseUrlKey = `${env}_BASE_URL`;
  const crmUrlKey = `${env}_CRM_BASE_URL`;
  const msisdnKey = `${env}_${conn}_MSISDN`;
  const creatorUserKey = `${env}_CREATOR_USER`;
  const creatorPassKey = `${env}_CREATOR_PASS`;
  const approverUserKey = `${env}_APPROVER_USER`;
  const approverPassKey = `${env}_APPROVER_PASS`;

  const config = {
    env,
    conn,
    baseUrl: process.env[baseUrlKey],
    crmUrl: process.env[crmUrlKey],
    msisdn: process.env[msisdnKey],
    creatorUser: process.env[creatorUserKey],
    creatorPass: process.env[creatorPassKey],
    approverUser: process.env[approverUserKey],
    approverPass: process.env[approverPassKey],
  };

  // Log once, with secrets masked
  if (!global._envConfigLogged) {
    console.log('Loaded env config:', {
      env: config.env,
      conn: config.conn,
      baseUrl: config.baseUrl,
      crmUrl: config.crmUrl,
      msisdn: config.msisdn,
      creatorUser: config.creatorUser,
      creatorPass: maskSecret(config.creatorPass),
      approverUser: config.approverUser,
      approverPass: maskSecret(config.approverPass),
    });
    global._envConfigLogged = true;
  }

  return config;
}

export const testEnv = getTestEnv();