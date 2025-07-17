# SubPilot 🚀

[![GitHub stars](https://img.shields.io/github/stars/anastas-hub/SubPilot?style=social)](https://github.com/anastas-hub/SubPilot)
[![GitHub issues](https://img.shields.io/github/issues/anastas-hub/SubPilot)](https://github.com/anastas-hub/SubPilot/issues)
[![GitHub forks](https://img.shields.io/github/forks/anastas-hub/SubPilot?style=social)](https://github.com/anastas-hub/SubPilot)
[![GitHub license](https://img.shields.io/github/license/anastas-hub/SubPilot)](https://github.com/anastas-hub/SubPilot/blob/main/LICENSE)

Gérez tous vos abonnements simplement, visualisez vos dépenses mensuelles/annuelles et ne ratez plus jamais une échéance !

---

## ✨ Fonctionnalités

- Gestion de vos abonnements (ajout, édition, suppression, corbeille)
- Calcul automatique des totaux mensuels et annuels
- Interface moderne et intuitive
- Mode développement (JSON) ou production (electron-store)
- Statistiques et tableau de bord

---

## 🛠️ Installation

### Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [Git](https://git-scm.com/)

### Clonage du projet

```bash
git clone https://github.com/anastas-hub/SubPilot.git
cd SubPilot
```

### Installation des dépendances

```bash
npm install
```

### Lancement en mode développement

```bash
npm run dev
```

### Lancement en mode production (build Electron)

```bash
npm run build
npm run start
```

---

## ⚙️ Configuration

Le fichier `config.json` à la racine permet de choisir le mode de stockage :

```json
{
  "devStore": true
}
```

- `true` : stockage local en JSON (développement)
- `false` : stockage sécurisé avec electron-store (production)

---

## 📁 Structure du projet

```
SubPilot/
├── data/
│   └── abonnements.json
├── src/
│   ├── database.js
│   └── public/
│       ├── app.js
│       ├── index.html
│       └── styles.css
├── package.json
├── config.json
└── ...
```

---

## 🚦 Utilisation

- Ajoutez, modifiez ou supprimez vos abonnements depuis l'interface.
- Visualisez vos dépenses sur le tableau de bord.
- Utilisez la corbeille pour restaurer ou supprimer définitivement.
- Changez le mode de stockage via `config.json`.

---

## 🐞 Support & Contributions

- Signalez un bug ou proposez une fonctionnalité via [Issues](https://github.com/anastas-hub/SubPilot/issues)
- Contribuez en proposant une Pull Request !

---

## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE).

---

> Made with ❤️ by [anastas-hub](https://github.com/anastas-hub)
