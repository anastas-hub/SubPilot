

# SubPilot 🚀



<p align="center">
  <b>Gérez tous vos abonnements simplement, visualisez vos dépenses mensuelles/annuelles et ne ratez plus jamais une échéance !</b>
</p>



---



---

---


## ✨ Fonctionnalités

- 📋 Gestion complète de vos abonnements (ajout, édition, suppression, corbeille)
- 💸 Calcul automatique des totaux mensuels et annuels
- 📊 Statistiques et tableau de bord dynamiques
- 🖥️ Interface moderne, responsive et intuitive
- 🔄 Mode développement (JSON) ou production (electron-store)
- 🗑️ Corbeille pour restaurer ou supprimer définitivement

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
npm run rebuild
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

```text
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

## 📊 Statistiques du projet

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api/pin/?username=anastas-hub&repo=SubPilot&theme=default" alt="repo stats" />
  <img src="https://github-readme-stats.vercel.app/api/top-langs/?username=anastas-hub&repo=SubPilot&layout=compact&theme=default" alt="lang stats" />
</p>

---


## 🚦 Utilisation

1. Cliquez sur **Nouvel abonnement** pour ajouter un service.
2. Modifiez ou supprimez vos abonnements depuis la liste.
3. Visualisez vos dépenses sur le tableau de bord.
4. Utilisez la corbeille pour restaurer ou supprimer définitivement.
5. Changez le mode de stockage via `config.json`.

---


## 🐞 Support & Contributions

- Signalez un bug ou proposez une fonctionnalité via [Issues](https://github.com/anastas-hub/SubPilot/issues)
- Contribuez en proposant une Pull Request !
- Pour toute question, contactez-moi sur [GitHub](https://github.com/anastas-hub) ou ouvrez une discussion.

---


## 📜 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE).


---

<p align="center">
  <i>Made with ❤️ by <a href="https://github.com/anastas-hub">anastas-hub</a></i>
</p>
