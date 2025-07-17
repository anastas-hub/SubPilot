# SubPilot – Documentation technique détaillée

## Sommaire
- [Présentation](#présentation)
- [Architecture générale](#architecture-générale)
- [Structure du projet](#structure-du-projet)
- [Backend : stockage et API](#backend--stockage-et-api)
  - [src/database.js](#srcdatabasejs)
  - [src/routes/api.js](#srcroutesapijs)
- [Frontend : interface et logique](#frontend--interface-et-logique)
  - [src/public/index.html](#srcpublicindexhtml)
  - [src/public/app.js](#srcpublicappjs)
  - [src/public/styles.css](#srcpublicstylescss)
- [Packaging & build](#packaging--build)
- [CI/CD & workflow GitHub](#cicd--workflow-github)
- [Scripts npm](#scripts-npm)
- [Contribution](#contribution)
- [Licence](#licence)

---

## Présentation

SubPilot est une application Electron de gestion d’abonnements, pensée pour la simplicité, la sécurité et la portabilité. Elle permet de suivre, organiser et analyser ses abonnements récurrents via une interface moderne et un stockage local robuste.

---

## Architecture générale

- **Electron** : Fournit l’environnement desktop multiplateforme (Windows, Mac, Linux).
- **Express** : API locale pour la gestion des abonnements (CRUD).
- **Stockage** :
  - Développement : Fichier JSON local (`data/abonnements.json`)
  - Production : `electron-store` (stockage sécurisé, chiffré)
- **UI** : HTML/CSS/JS moderne, dashboard, modals, sidebar, notifications.
- **Packaging** : electron-builder (NSIS, MSI), configuration avancée.

---

## Structure du projet

```
SubPilot/
├── main.js                # Entrée Electron
├── package.json           # Dépendances, scripts, build
├── assets/                # Icônes, images
├── data/                  # Fichier JSON (dev)
├── src/
│   ├── database.js        # Gestion des abonnements (stockage)
│   ├── routes/
│   │   └── api.js         # API Express (CRUD abonnements)
│   └── public/
│       ├── app.js         # Logique UI principale
│       ├── index.html     # Structure HTML
│       └── styles.css     # Styles CSS
└── .github/
    └── workflows/
        └── release.yml    # Workflow CI/CD GitHub Actions
```

---

## Backend : stockage et API

### src/database.js

- **Mode dev/prod** :
  - Détection via `config.json` (clé `devStore`).
  - Dev : stockage dans `data/abonnements.json` (JSON).
  - Prod : stockage sécurisé via `electron-store`.
- **Cache mémoire** :
  - Les abonnements sont chargés en mémoire pour rapidité d’accès.
- **Fonctions principales** :
  - `getAll()` : retourne tous les abonnements.
  - `getById(id)` : retourne un abonnement par ID.
  - `create(data)` : ajoute un abonnement.
  - `update(id, data)` : modifie un abonnement.
  - `delete(id)` : supprime définitivement.
  - `trash(id)` : met à la corbeille (soft delete).
  - `restore(id)` : restaure depuis la corbeille.
  - `purgeOldTrashed()` : supprime définitivement les abonnements en corbeille depuis >30j (prod).
- **Sauvegarde** :
  - Après chaque modification, le cache est persisté (fichier ou electron-store).
- **Sécurité** :
  - Les accès sont synchronisés, gestion des erreurs robuste.

### src/routes/api.js

- **API REST** pour les abonnements :
  - `GET /abonnements` : liste tous les abonnements
  - `GET /abonnements/:id` : détail d’un abonnement
  - `POST /abonnements` : création
  - `PUT /abonnements/:id` : modification
  - `PATCH /abonnements/:id/trash` : mise à la corbeille
  - `PATCH /abonnements/:id/restore` : restauration
  - `DELETE /abonnements/:id` : suppression définitive
- **Gestion des erreurs** :
  - Toutes les routes renvoient un message d’erreur explicite en cas d’échec.
- **Connexion** :
  - Utilise le module `abonnements` de `database.js`.

---

## Frontend : interface et logique

### src/public/index.html

- **Structure** :
  - Sidebar (navigation : Dashboard, Abonnements, Corbeille)
  - Dashboard (totaux mensuels/annuels, stats)
  - Modals (ajout/édition d’abonnement)
  - Notifications (succès/erreur)
- **Accessibilité** :
  - Responsive, adapté desktop/mobile
  - Polices web, contrastes, navigation clavier
- **Sécurité** :
  - Content Security Policy stricte

### src/public/app.js

- **Chargement des données** :
  - Via l’API Express (fetch)
- **Gestion du dashboard** :
  - Calculs totaux, affichage dynamique
- **CRUD UI** :
  - Ajout, édition, suppression, corbeille, restauration
- **Gestion des événements** :
  - Boutons, formulaires, navigation, modals
- **Notifications** :
  - Feedback utilisateur (succès/erreur)
- **Version** :
  - Affichée dynamiquement dans la sidebar

### src/public/styles.css

- **Design moderne** :
  - Couleurs, ombres, arrondis, transitions
- **Responsive** :
  - Sidebar, dashboard, modals
- **Accessibilité** :
  - Contrastes, focus, polices web
- **Animations** :
  - Hover, transitions, feedback visuel

---

## Packaging & build

- **electron-builder** :
  - Configuration avancée dans `package.json` (section `build`)
  - NSIS & MSI (Windows)
  - Icônes personnalisées, menu démarrer, raccourcis, désinstallation propre
  - Catégorie menu personnalisée, licence intégrée
- **Sortie** :
  - Installeurs générés dans `dist/`

---

## CI/CD & workflow GitHub

- **release.yml** (GitHub Actions) :
  - Déclenché sur modification de `package.json` (branche main)
  - Installe les dépendances, rebuild, build
  - Crée une release GitHub avec les installeurs générés
  - Utilise `softprops/action-gh-release` pour publier automatiquement

---

## Scripts npm

- `npm run dev` : Lancer l’app en mode développement
- `npm run start` : Lancer l’app (prod)
- `npm run rebuild` : Reconstruire les modules natifs
- `npm run build` : Générer les installeurs

---

## Contribution

- Fork, crée une branche, propose un PR !
- Respecte la structure et l’esprit du projet.
- Les issues sont ouvertes pour suggestions et bugs.

---

## Licence

MIT. Voir le fichier LICENSE.
