# SubPilot

**SubPilot** est une application de gestion d'abonnements simple et élégante, conçue pour suivre et optimiser vos dépenses récurrentes.

## Fonctionnalités

- Tableau de bord interactif pour visualiser tous vos abonnements
- Ajout, modification, suppression et archivage d'abonnements
- Gestion de la corbeille (restauration et suppression définitive)
- Calcul automatique des totaux mensuels et annuels
- Suggestions IA pour les noms de services (via Gemini)
- Thème clair/sombre personnalisable
- Sauvegarde automatique et restauration des données

## Installation

### Prérequis

- [Node.js](https://nodejs.org/) (v18 ou supérieur recommandé)
- [Git](https://git-scm.com/)
- [Electron](https://www.electronjs.org/)

### Cloner le dépôt

```sh
git clone https://github.com/anastas-hub/SubPilot.git
cd SubPilot
```

### Installer les dépendances

```sh
npm install
```

### Lancer l'application en mode développement

```sh
npm start
```

## Construction d'un exécutable

Pour générer un installeur Windows :

```sh
npm run build
```

L'installeur sera disponible dans le dossier `dist/`.

## Configuration

- La clé API Gemini (pour les suggestions IA) peut être renseignée dans les paramètres de l'application.
- Les données sont stockées localement (aucune donnée n'est envoyée à un serveur tiers).

## Structure du projet

- `main.js` : Processus principal Electron
- `src/` : Code source (Express API, gestion des données, interface publique)
- `assets/` : Icônes et ressources
- `build/` : Scripts d'installation
- `dist/` : Fichiers générés lors du build

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE).

---

**Auteur** : [anastas-hub](https://github.com/anastas-hub)