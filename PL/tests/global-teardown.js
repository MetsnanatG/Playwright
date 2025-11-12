import fs from 'fs';

export default async () => {
  try {
    fs.unlinkSync('storageState.json');
    console.log('🗑️ Cleared storageState.json in teardown');
  } catch (err) {
    console.warn('⚠️ No storageState.json to delete:', err.message);
  }
};