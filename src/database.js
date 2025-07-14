const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const https = require('https');

// Créer le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'abonnements.db');

// Connexion à la base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err.message);
    } else {
        console.log('Connecté à la base de données SQLite');
        initDatabase();
    }
});

// Initialisation de la base de données
function initDatabase() {
    // Créer la table de configuration (pour le solde, etc.)
    db.run(`CREATE TABLE IF NOT EXISTS config (
        key TEXT PRIMARY KEY,
        value TEXT
    )`);

    // Créer la table des catégories puis insérer la catégorie par défaut
    db.run(`CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE,
        couleur TEXT DEFAULT '#6c757d',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`, (err) => {
        if (err) {
            console.error('Erreur lors de la création de la table categories:', err);
        } else {
            createDefaultCategory();
        }
    });

    // Créer la table des abonnements
    db.run(`CREATE TABLE IF NOT EXISTS abonnements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL,
        prix REAL NOT NULL,
        devise TEXT DEFAULT 'EUR',
        frequence TEXT DEFAULT 'mensuel',
        date_debut DATE NOT NULL,
        date_fin DATE,
        actif BOOLEAN DEFAULT 1,
        archivee BOOLEAN DEFAULT 0,
        deleted_at DATETIME,
        description TEXT,
        site_web TEXT,
        logo TEXT,
        categorie_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categorie_id) REFERENCES categories (id)
    )`);
}

// Fonction pour créer une catégorie par défaut
function createDefaultCategory() {
    const markerPath = path.join(dataDir, '.categories_initialized');
    if (fs.existsSync(markerPath)) {
        // Les catégories par défaut ont déjà été créées une fois, ne rien faire
        return;
    }
    db.get('SELECT COUNT(*) as count FROM categories', (err, row) => {
        if (err) {
            console.error('Erreur lors de la vérification des catégories:', err);
            return;
        }
        
        // Si aucune catégorie n'existe, créer les catégories par défaut
        if (row.count === 0) {
            const defaultCategories = [
                { nom: 'Général', couleur: '#6c757d' }, // gris
                { nom: 'Streaming', couleur: '#e91e63' }, // rose
                { nom: 'Productivité', couleur: '#4caf50' }, // vert
                { nom: 'Jeux', couleur: '#ff9800' }, // orange
                { nom: 'Éducation', couleur: '#9c27b0' } // violet
            ];
            
            defaultCategories.forEach((category, index) => {
                db.run('INSERT INTO categories (nom, couleur) VALUES (?, ?)', 
                    [category.nom, category.couleur], 
                    function(err) {
                        if (err) {
                            console.error(`Erreur lors de la création de la catégorie "${category.nom}":`, err);
                        } else {
                            console.log(`✅ Catégorie par défaut "${category.nom}" créée avec succès`);
                        }
                    }
                );
            });
            // Créer le fichier marqueur pour ne plus jamais recréer les catégories par défaut
            fs.writeFileSync(markerPath, 'ok');
        }
    });
}

// Correction : attribuer la catégorie 'Général' à tous les abonnements sans catégorie
function assignDefaultCategoryToOrphanAbonnements() {
    db.get("SELECT id FROM categories WHERE LOWER(nom) = 'général'", (err, row) => {
        if (err || !row) return;
        const generalId = row.id;
        db.run("UPDATE abonnements SET categorie_id = ? WHERE categorie_id IS NULL OR categorie_id NOT IN (SELECT id FROM categories)", [generalId], function(err) {
            if (err) {
                console.error("Erreur lors de l'attribution de la catégorie par défaut aux abonnements orphelins:", err);
            } else if (this.changes > 0) {
                console.log(`✅ ${this.changes} abonnement(s) sans catégorie ont reçu la catégorie 'Général'`);
            }
        });
    });
}

// Appeler la correction après l'init
setTimeout(assignDefaultCategoryToOrphanAbonnements, 1000);

// Fonctions pour gérer le solde utilisateur
function getBalance(cb) {
    db.get('SELECT value FROM config WHERE key = ?',["balance"], (err, row) => {
        if (err || !row) return cb(0);
        cb(parseFloat(row.value) || 0);
    });
}

function setBalance(newBalance, cb) {
    db.run('INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value', ["balance", String(newBalance)], function(err) {
        if (cb) cb(err);
    });
}

// --- Taux de conversion (à ajuster si besoin) ---
let currencyRates = { EUR: 1, USD: 1, GBP: 1 };
let lastRatesFetch = 0;

function fetchRates(callback) {
    const now = Date.now();
    // Rafraîchir les taux toutes les 2h max
    if (now - lastRatesFetch < 2 * 60 * 60 * 1000 && currencyRates.EUR && currencyRates.USD && currencyRates.GBP) {
        return callback(currencyRates);
    }
    https.get('https://api.frankfurter.app/latest?amount=1&from=USD&to=EUR,GBP', res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const usdRates = JSON.parse(data).rates;
                https.get('https://api.frankfurter.app/latest?amount=1&from=GBP&to=EUR,USD', res2 => {
                    let data2 = '';
                    res2.on('data', chunk => data2 += chunk);
                    res2.on('end', () => {
                        try {
                            const gbpRates = JSON.parse(data2).rates;
                            currencyRates = {
                                EUR: 1,
                                USD: usdRates.EUR ? 1 / usdRates.EUR : 1,
                                GBP: gbpRates.EUR ? 1 / gbpRates.EUR : 1
                            };
                            lastRatesFetch = Date.now();
                            callback(currencyRates);
                        } catch (e) { callback(currencyRates); }
                    });
                }).on('error', () => callback(currencyRates));
            } catch (e) { callback(currencyRates); }
        });
    }).on('error', () => callback(currencyRates));
}

// Helper pour convertir un prix en EUR dynamiquement
function toEUR(prix, devise, rates) {
    return prix * (rates[devise] || 1);
}

// Purge automatique des abonnements en corbeille depuis plus de 30 jours (toutes les 24h)
setInterval(() => {
    abonnements.purgeOldTrashed().then(res => {
        if (res.purged > 0) console.log(`🗑️ ${res.purged} abonnement(s) supprimé(s) définitivement de la corbeille (30j)`);
    }).catch(() => {});
}, 24 * 60 * 60 * 1000); // 24h
const abonnements = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all(`
                SELECT a.*, c.nom as categorie_nom, c.couleur as categorie_couleur 
                FROM abonnements a 
                LEFT JOIN categories c ON a.categorie_id = c.id 
                ORDER BY a.created_at DESC
            `, (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    getById: (id) => {
        return new Promise((resolve, reject) => {
            db.get(`
                SELECT a.*, c.nom as categorie_nom, c.couleur as categorie_couleur 
                FROM abonnements a 
                LEFT JOIN categories c ON a.categorie_id = c.id 
                WHERE a.id = ?
            `, [id], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    },

    create: (data) => {
        return new Promise((resolve, reject) => {
            const { nom, prix, devise, frequence, date_debut, date_fin, description, site_web, logo, categorie_id } = data;
            db.run(`
                INSERT INTO abonnements (nom, prix, devise, frequence, date_debut, date_fin, description, site_web, logo, categorie_id)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [nom, prix, devise, frequence, date_debut, date_fin, description, site_web, logo, categorie_id], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, ...data });
            });
        });
    },

    update: (id, data) => {
        return new Promise((resolve, reject) => {
            const { nom, prix, devise, frequence, date_debut, date_fin, description, site_web, logo, categorie_id, actif } = data;
            db.run(`
                UPDATE abonnements 
                SET nom = ?, prix = ?, devise = ?, frequence = ?, date_debut = ?, date_fin = ?, 
                    description = ?, site_web = ?, logo = ?, categorie_id = ?, actif = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `, [nom, prix, devise, frequence, date_debut, date_fin, description, site_web, logo, categorie_id, actif, id], function(err) {
                if (err) reject(err);
                else resolve({ id, ...data });
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM abonnements WHERE id = ?', [id], function(err) {
                if (err) reject(err);
                else resolve({ deletedId: id });
            });
        });
    },

    toggle: (id) => {
        return new Promise((resolve, reject) => {
            db.run(`
                UPDATE abonnements 
                SET actif = NOT actif, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            `, [id], function(err) {
                if (err) reject(err);
                else resolve({ id, toggled: true });
            });
        });
    },

    migrateCategory: (fromId, toId) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE abonnements SET categorie_id = ? WHERE categorie_id = ?', [toId, fromId], function(err) {
                if (err) reject(err);
                else resolve({ migrated: this.changes });
            });
        });
    }
};

// Fonctions CRUD pour les catégories
const categories = {
    getAll: () => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM categories ORDER BY nom', (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
    },

    create: (data) => {
        return new Promise((resolve, reject) => {
            const { nom, couleur } = data;
            db.run('INSERT INTO categories (nom, couleur) VALUES (?, ?)', [nom, couleur], function(err) {
                if (err) reject(err);
                else resolve({ id: this.lastID, nom, couleur });
            });
        });
    },

    delete: (id) => {
        return new Promise((resolve, reject) => {
            // Vérifier d'abord s'il y a des abonnements liés
            db.get('SELECT COUNT(*) as count FROM abonnements WHERE categorie_id = ?', [id], (err, row) => {
                if (err) {
                    reject(err);
                } else if (row.count > 0) {
                    reject(new Error('Impossible de supprimer une catégorie qui contient des abonnements'));
                } else {
                    db.run('DELETE FROM categories WHERE id = ?', [id], function(err) {
                        if (err) reject(err);
                        else resolve({ deletedId: id });
                    });
                }
            });
        });
    }
};

// Fonctions de statistiques
const stats = {
    getDashboard: () => {
        return new Promise((resolve, reject) => {
            fetchRates(rates => {
                db.all('SELECT prix, devise, frequence, actif, categorie_id FROM abonnements', (err, abonnements) => {
                    if (err) return reject(err);
                    let totalActifs = 0;
                    let coutMensuel = 0, coutAnnuel = 0;
                    let coutMensuelOnly = 0, coutAnnuelOnly = 0;
                    abonnements.forEach(a => {
                        if (a.actif) {
                            totalActifs++;
                            let prixEUR = toEUR(a.prix, a.devise, rates);
                            if (a.frequence === 'mensuel') {
                                coutMensuel += prixEUR;
                                coutMensuelOnly += prixEUR;
                                coutAnnuel += prixEUR * 12;
                            } else if (a.frequence === 'annuel') {
                                coutMensuel += prixEUR / 12;
                                coutAnnuel += prixEUR;
                                coutAnnuelOnly += prixEUR;
                            } else {
                                coutMensuel += prixEUR;
                                coutAnnuel += prixEUR * 12;
                            }
                        }
                    });
                    // Répartition par catégorie (en EUR)
                    db.all(`SELECT c.id, c.nom, c.couleur FROM categories c`, (err, cats) => {
                        if (err) return reject(err);
                        const repartitionCategories = cats.map(cat => {
                            let catAbos = abonnements.filter(a => a.categorie_id === cat.id && a.actif);
                            let coutMensuelCat = 0;
                            catAbos.forEach(a => {
                                let prixEUR = toEUR(a.prix, a.devise, rates);
                                switch (a.frequence) {
                                    case 'mensuel':
                                        coutMensuelCat += prixEUR;
                                        break;
                                    case 'annuel':
                                        coutMensuelCat += prixEUR / 12;
                                        break;
                                    default:
                                        coutMensuelCat += prixEUR;
                                }
                            });
                            return { nom: cat.nom, couleur: cat.couleur, count: catAbos.length, coutMensuel: coutMensuelCat };
                        }).filter(cat => cat.count > 0);
                        // Récupérer le solde stocké
                        getBalance(balance => {
                            resolve({
                                totalActifs,
                                coutMensuel,
                                coutAnnuel,
                                coutMensuelOnly,
                                coutAnnuelOnly,
                                balance,
                                repartitionCategories
                            });
                        });
                    });
                });
            });
        });
    },
    getBalance,
    setBalance
};

module.exports = {
    db,
    abonnements,
    categories,
    stats
};
