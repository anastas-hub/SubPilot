const { app, BrowserWindow, Menu } = require("electron");
const path = require("path");
const express = require("express");
const database = require("./src/database");

let mainWindow;
let server;

function createWindow() {
  console.log("🖥️ Création de la fenêtre principale...");

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
    },
    icon: path.join(__dirname, "assets", "icon.png"),
    show: false,
    titleBarStyle: "default",
  });

  // Démarrer le serveur Express
  console.log("🚀 Démarrage du serveur...");
  startServer()
    .then(() => {
      console.log("📡 Chargement de l'interface...");
      mainWindow.loadURL("http://localhost:3000");

      mainWindow.once("ready-to-show", () => {
        console.log("✅ Fenêtre prête, affichage...");
        mainWindow.show();

        if (process.env.NODE_ENV === "development") {
          mainWindow.webContents.openDevTools();
        }
      });
    })
    .catch((error) => {
      console.error("❌ Erreur lors du démarrage du serveur:", error);
      app.quit();
    });

  mainWindow.on("closed", () => {
    mainWindow = null;
    if (server) {
      server.close();
    }
  });

  // Menu personnalisé
  const template = [
    {
      label: "Fichier",
      submenu: [
        {
          label: "Quitter",
          accelerator: process.platform === "darwin" ? "Cmd+Q" : "Ctrl+Q",
          click: () => {
            app.quit();
          },
        },
      ],
    },
    {
      label: "Affichage",
      submenu: [
        {
          label: "Recharger",
          accelerator: "F5",
          click: () => {
            mainWindow.reload();
          },
        },
        {
          label: "Outils de développement",
          accelerator: "F12",
          click: () => {
            mainWindow.webContents.toggleDevTools();
          },
        },
      ],
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

async function startServer() {
  try {
    console.log("🚀 Démarrage du serveur Express...");

    const expressApp = express();

    // Middleware
    expressApp.use(express.json());
    expressApp.use(express.static(path.join(__dirname, "src", "public")));

    // Routes API
    console.log("📡 Configuration des routes API...");
    const apiRoutes = require("./src/routes/api");
    expressApp.use("/api", apiRoutes);

    // Route principale
    expressApp.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, "src", "public", "index.html"));
    });

    return new Promise((resolve, reject) => {
      server = expressApp.listen(3000, (error) => {
        if (error) {
          console.error("❌ Erreur lors du démarrage du serveur:", error);
          reject(error);
        } else {
          console.log("✅ Serveur démarré sur le port 3000");
          resolve();
        }
      });
    });
  } catch (error) {
    console.error("❌ Erreur lors de la configuration du serveur:", error);
    throw error;
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  if (server) {
    server.close();
  }
});
