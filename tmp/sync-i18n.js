const fs = require('fs');
const path = require('path');

const plPath = path.join(__dirname, '../src/lib/i18n/locales/pl.json');
const enPath = path.join(__dirname, '../src/lib/i18n/locales/en.json');

const pl = JSON.parse(fs.readFileSync(plPath, 'utf8'));
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

function syncObjects(source, target) {
  const result = {};
  // Take all keys from source (PL)
  for (const key in source) {
    if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
      result[key] = syncObjects(source[key], target[key] || {});
    } else {
      // Use target value if it exists, otherwise use source value (as placeholder)
      result[key] = target[key] !== undefined ? target[key] : source[key];
    }
  }
  return result;
}

const syncedEn = syncObjects(pl, en);
fs.writeFileSync(enPath, JSON.stringify(syncedEn, null, 2), 'utf8');
console.log('Sync complete. en.json now has exact same structure as pl.json');
