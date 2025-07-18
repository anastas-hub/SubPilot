const { saveAbonnements } = require("./database/autosave");
const fs = require("fs");
const path = require("path");

function getTimestamp() {
  return new Date().toISOString();
}

let isDev = false;
const CONFIG_PATH = path.join(__dirname, "../config.json");
if (fs.existsSync(CONFIG_PATH)) {
  try {
    const config = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    isDev = !!config.devStore;
  } catch (e) {
    isDev = false;
  }
}

let abonnementsCache = [];
let store = null;
let DATA_PATH;
try {
  // Si on est dans Electron, utiliser le dossier userData pour la persistance
  const electron = require('electron');
  DATA_PATH = path.join(
    (electron.app || electron.remote.app).getPath('userData'),
    'abonnements.json'
  );
} catch (e) {
  // Fallback pour le dev pur Node.js (tests, etc.)
  DATA_PATH = path.join(__dirname, '../data/abonnements.json');
}

if (isDev) {
  if (!fs.existsSync(path.dirname(DATA_PATH))) {
    fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  }
  if (!fs.existsSync(DATA_PATH)) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ abonnements: [] }, null, 2), "utf8");
  }
  abonnementsCache = JSON.parse(fs.readFileSync(DATA_PATH, "utf8")).abonnements;
} else {
  (async () => {
    const ElectronStore = (await import("electron-store")).default;
    store = new ElectronStore({
      name: "abonnements",
      defaults: {
        abonnements: [],
      },
    });
    abonnementsCache = store.get("abonnements");
    setInterval(
      () => {
        abonnements
          .purgeOldTrashed()
          .then((res) => {
            if (res.purged > 0)
              console.log(`🗑️ ${res.purged} abonnement(s) supprimé(s) définitivement de la corbeille (30j)`);
          })
          .catch(() => {});
      },
      24 * 60 * 60 * 1000,
    );
  })();
}

function saveCache() {
  if (isDev) {
    fs.writeFileSync(DATA_PATH, JSON.stringify({ abonnements: abonnementsCache }, null, 2), "utf8");
  } else if (store) {
    store.set("abonnements", abonnementsCache);
  }
}

const abonnements = {
  getAll: () => {
    return Promise.resolve(
      [...abonnementsCache].sort((a, b) => (new Date(b.created_at) < new Date(a.created_at) ? 1 : -1)),
    );
  },
  getById: (id) => {
    const ab = abonnementsCache.find((a) => a.id === id);
    return Promise.resolve(ab || null);
  },
  create: (data) => {
    const id = Date.now().toString();
    const now = getTimestamp();
    const abonnement = {
      id,
      nom: data.nom,
      prix: data.prix,
      devise: data.devise,
      frequence: data.frequence,
      date_debut: data.date_debut,
      date_fin: data.date_fin,
      description: data.description,
      site_web: data.site_web,
      logo: data.logo,
      actif: 1,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    abonnementsCache.push(abonnement);
    saveAbonnements(abonnementsCache);
    saveCache();
    return Promise.resolve({ id, ...abonnement });
  },
  update: (id, data) => {
    const idx = abonnementsCache.findIndex((a) => a.id === id);
    if (idx === -1) return Promise.reject("Not found");
    abonnementsCache[idx] = {
      ...abonnementsCache[idx],
      ...data,
      updated_at: getTimestamp(),
    };
    saveCache();
    saveAbonnements(abonnementsCache);
    return Promise.resolve({ id, ...abonnementsCache[idx] });
  },
  delete: (id) => {
    const before = abonnementsCache.length;
    abonnementsCache = abonnementsCache.filter((a) => a.id !== id);
    saveCache();
    saveAbonnements(abonnementsCache);
    return Promise.resolve({
      deletedId: id,
      deleted: before !== abonnementsCache.length,
    });
  },
  trash: (id) => {
    const idx = abonnementsCache.findIndex((a) => a.id === id);
    if (idx === -1) return Promise.reject("Not found");
    abonnementsCache[idx].deleted_at = getTimestamp();
    saveCache();
    saveAbonnements(abonnementsCache);
    return Promise.resolve({ id, trashed: true });
  },
  restore: (id) => {
    const idx = abonnementsCache.findIndex((a) => a.id === id);
    if (idx === -1) return Promise.reject("Not found");
    abonnementsCache[idx].deleted_at = null;
    saveCache();
    saveAbonnements(abonnementsCache);
    return Promise.resolve({ id, restored: true });
  },
  toggle: (id) => {
    const idx = abonnementsCache.findIndex((a) => a.id === id);
    if (idx === -1) return Promise.reject("Not found");
    abonnementsCache[idx].actif = !abonnementsCache[idx].actif;
    abonnementsCache[idx].updated_at = getTimestamp();
    saveCache();
    return Promise.resolve({ id, toggled: true });
  },
  purgeOldTrashed: () => {
    const now = Date.now();
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
    const before = abonnementsCache.length;
    abonnementsCache = abonnementsCache.filter(
      (a) => !a.deleted_at || now - new Date(a.deleted_at).getTime() < THIRTY_DAYS,
    );
    const purged = before - abonnementsCache.length;
    saveCache();
    return Promise.resolve({ purged });
  },
};

module.exports = {
  abonnements,
};
