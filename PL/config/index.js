// config/index.js
import dotenv from 'dotenv';
dotenv.config({ path: './.env', debug: false });

// Decide ENV: use ENV var if set, otherwise default to BP
const RAW_ENV = (process.env.ENV || 'BP').toString().trim().toUpperCase();
const ENV = RAW_ENV.startsWith('PRO') ? 'PROD' : 'BP';

// helper to read and trim env vars
const get = (name) => {
  const v = process.env[name];
  return v === undefined ? undefined : v.toString().trim();
};

// Use the exact names you have in .env
const crmBaseUrl = ENV === 'BP'
  ? get('BP_BASE_URL')
  : get('PROD_BASE_URL');

const mapping = {
  crmBaseUrl,
  // creator credentials (prefers PROD_* when ENV=PROD)
  creatorUser: ENV === 'BP' ? get('CREATOR_USER') : get('PROD_CREATOR_USER') || get('CREATOR_USER'),
  creatorPass: ENV === 'BP' ? get('CREATOR_PASS') : get('PROD_CREATOR_PASS') || get('CREATOR_PASS'),

  // approver credentials
  approverUser: ENV === 'BP' ? get('APPROVER_USER') : get('PROD_APPROVER_USER') || get('APPROVER_USER'),
  approverPass: ENV === 'BP' ? get('APPROVER_PASS') : get('PROD_APPROVER_PASS') || get('APPROVER_PASS'),

  // msisdns
  cbuMsisdn: ENV === 'BP' ? get('BP_CBU_MSISDN') : get('PROD_CBU_MSISDN'),
  ebuMsisdn: ENV === 'BP' ? get('BP_EBU_MSISDN') : get('PROD_EBU_MSISDN'),

  connectionType: get('CONNECTION_TYPE') || 'EBU'
};

// auto-fix the typo RROD_APPROVER_PASS -> PROD_APPROVER_PASS if present
if (!mapping.approverPass && get('RROD_APPROVER_PASS')) {
     mapping.approverPass = get('RROD_APPROVER_PASS');
}

// diagnostics: print resolved values (creator/approver pass masked)
console.log('Resolved ENV:', ENV);
console.table({
  crmBaseUrl: mapping.crmBaseUrl || '<missing>',
  creatorUser: mapping.creatorUser || '<missing>',
  creatorPass: mapping.creatorPass ? '***' : '<missing>',
  approverUser: mapping.approverUser || '<missing>',
  approverPass: mapping.approverPass ? '***' : '<missing>',
  defaultMsisdn: mapping.ebuMsisdn || mapping.cbuMsisdn || '<missing>'
});

// Export a tidy config object for tests/pages/helpers
export default {
  ENV,
  ...mapping,
  crmHome: mapping.crmBaseUrl,
  defaultMsisdn: mapping.ebuMsisdn || mapping.cbuMsisdn
};