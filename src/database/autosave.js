// Module de sauvegarde automatique des abonnements (JSON)

const fs = require('fs');
const path = require('path');
let DB_PATH;
try {
  // Si Electron est dispo, utilise app.getPath('userData')
  const electron = require('electron');
  const app = electron.app || electron.remote?.app;
  if (app && app.getPath) {
    DB_PATH = path.join(app.getPath('userData'), 'abonnements-backup.json');
  } else {
    throw new Error('no electron app');
  }
} catch (e) {
  // Fallback pour dev/node
  DB_PATH = path.join(__dirname, '../abonnements-backup.json');
}

function saveAbonnements(abonnements) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(abonnements, null, 2), 'utf-8');
  } catch (e) {
    console.error('Erreur sauvegarde abonnements:', e);
  }
}

function loadAbonnementsBackup() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
    }
  } catch (e) {
    console.error('Erreur lecture sauvegarde abonnements:', e);
  }
  return null;
}

module.exports = { saveAbonnements, loadAbonnementsBackup };
