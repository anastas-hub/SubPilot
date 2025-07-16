const fs = require('fs');
const path = require('path');


const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'abonnements.json');

function ensureDataFile() {
    if (fs.existsSync(DATA_DIR)) {
        if (!fs.lstatSync(DATA_DIR).isDirectory()) {
            throw new Error(`${DATA_DIR} exists and is not a directory`);
        }
    } else {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_PATH)) {
        fs.writeFileSync(DB_PATH, '[]', 'utf8');
    }
}

function loadAbonnements() {
    ensureDataFile();
    try {
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveAbonnements(abonnements) {
    ensureDataFile();
    fs.writeFileSync(DB_PATH, JSON.stringify(abonnements, null, 2), 'utf8');
}

function getTimestamp() {
    return new Date().toISOString();
}

let abonnementsCache = loadAbonnements();

setInterval(() => {
    abonnements.purgeOldTrashed().then(res => {
        if (res.purged > 0) console.log(`🗑️ ${res.purged} abonnement(s) supprimé(s) définitivement de la corbeille (30j)`);
    }).catch(() => {});
}, 24 * 60 * 60 * 1000); // 24h

const abonnements = {
    getAll: () => {
        return Promise.resolve([...abonnementsCache].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
    },
    getById: (id) => {
        const ab = abonnementsCache.find(a => a.id === id);
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
            actif: true,
            created_at: now,
            updated_at: now,
            deleted_at: null
        };
        abonnementsCache.push(abonnement);
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ id, ...abonnement });
    },
    update: (id, data) => {
        const idx = abonnementsCache.findIndex(a => a.id === id);
        if (idx === -1) return Promise.reject('Not found');
        abonnementsCache[idx] = {
            ...abonnementsCache[idx],
            ...data,
            updated_at: getTimestamp()
        };
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ id, ...abonnementsCache[idx] });
    },
    delete: (id) => {
        const before = abonnementsCache.length;
        abonnementsCache = abonnementsCache.filter(a => a.id !== id);
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ deletedId: id, deleted: before !== abonnementsCache.length });
    },
    trash: (id) => {
        const idx = abonnementsCache.findIndex(a => a.id === id);
        if (idx === -1) return Promise.reject('Not found');
        abonnementsCache[idx].deleted_at = getTimestamp();
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ id, trashed: true });
    },
    restore: (id) => {
        const idx = abonnementsCache.findIndex(a => a.id === id);
        if (idx === -1) return Promise.reject('Not found');
        abonnementsCache[idx].deleted_at = null;
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ id, restored: true });
    },
    toggle: (id) => {
        const idx = abonnementsCache.findIndex(a => a.id === id);
        if (idx === -1) return Promise.reject('Not found');
        abonnementsCache[idx].actif = !abonnementsCache[idx].actif;
        abonnementsCache[idx].updated_at = getTimestamp();
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ id, toggled: true });
    },
    purgeOldTrashed: () => {
        const now = Date.now();
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
        const before = abonnementsCache.length;
        abonnementsCache = abonnementsCache.filter(a => !a.deleted_at || (now - new Date(a.deleted_at).getTime()) < THIRTY_DAYS);
        const purged = before - abonnementsCache.length;
        saveAbonnements(abonnementsCache);
        return Promise.resolve({ purged });
    }
}
module.exports = {
    abonnements
}
