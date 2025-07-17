async function restoreAbonnement(id) {
  if (!confirm("Restaurer cet abonnement ?")) return;
  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}/restore`, {
      method: "PATCH",
    });
    if (!response.ok) throw new Error("Erreur lors de la restauration");
    showNotification("Abonnement restauré", "success");
    if (typeof loadAbonnements === "function") await loadAbonnements();
    displayCorbeille();
  } catch (error) {
    showNotification("Erreur lors de la restauration", "error");
  }
}

async function deleteAbonnementDefinitif(id) {
  if (!confirm("Supprimer définitivement cet abonnement ?")) return;
  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Erreur lors de la suppression définitive");
    showNotification("Abonnement supprimé définitivement", "success");
    if (typeof loadAbonnements === "function") await loadAbonnements();
    displayCorbeille();
  } catch (error) {
    showNotification("Erreur lors de la suppression définitive", "error");
  }
}
let abonnements = [];
let currentEditId = null;
const API_BASE = "/api";
let sidebar = null;
let sections = null;
let pageTitle = null;
let abonnementModal = null;
let abonnementForm = null;
document.addEventListener("DOMContentLoaded", async function () {
  try {
    await new Promise((resolve) => setTimeout(resolve, 100));
    // Récupère dynamiquement la version depuis l'API backend
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        const version = data.version || "";
        const sidebarVersion = document.getElementById("sidebar-version");
        if (sidebarVersion) {
          const versionEl = document.createElement("span");
          versionEl.textContent = `v${version}`;
          versionEl.style.fontSize = "0.95em";
          versionEl.style.color = "#6366f1";
          versionEl.style.fontWeight = "600";
          versionEl.style.background = "#eef2ff";
          versionEl.style.borderRadius = "6px";
          versionEl.style.padding = "2px 8px";
          versionEl.style.marginTop = "2px";
          sidebarVersion.appendChild(versionEl);
        }
      })
      .catch(() => {});
    initializeApp();
    setupEventListeners();
    await loadData();
  } catch (error) {
    showNotification("Erreur lors de l'initialisation: " + error.message, "error");
  }
});
function initializeApp() {
  try {
    sidebar = document.querySelector(".sidebar-menu");
    sections = document.querySelectorAll(".content-section");
    pageTitle = document.getElementById("page-title");
    abonnementModal = document.getElementById("abonnement-modal");
    abonnementForm = document.getElementById("abonnement-form");
    showSection("dashboard");
    const today = new Date().toISOString().split("T")[0];
    const dateField = document.getElementById("date_debut");
    if (dateField) dateField.value = today;
  } catch (error) {
    throw error;
  }
}
// ...existing code sans commentaires...

function setupEventListeners() {
  try {
    const sidebar = document.querySelector(".sidebar-menu");
    if (sidebar) sidebar.addEventListener("click", handleNavigation);
    updateDashboardCounts();
    const addAbonnementBtn = document.getElementById("add-abonnement-btn");
    if (addAbonnementBtn) addAbonnementBtn.addEventListener("click", () => openAbonnementModal());
    const closeAbonnementBtn = document.getElementById("close-abonnement-modal");
    // Optionnel: closeAbonnementBtn peut être utilisé pour fermer le modal
    const cancelAbonnementBtn = document.getElementById("cancel-abonnement");
    if (cancelAbonnementBtn) cancelAbonnementBtn.addEventListener("click", closeAbonnementModal);
    const abonnementForm = document.getElementById("abonnement-form");
    if (abonnementForm) abonnementForm.addEventListener("submit", handleAbonnementSubmit);
    const searchInput = document.getElementById("search-input");
    if (searchInput) searchInput.addEventListener("input", handleSearch);
    window.addEventListener("click", (e) => {
      const abonnementModal = document.getElementById("abonnement-modal");
      if (abonnementModal && e.target === abonnementModal) closeAbonnementModal();
    });
  } catch (error) {
    throw error;
  }
}

// Navigation
async function handleNavigation(e) {
  const item = e.target.closest(".menu-item");
  if (!item) return;

  const section = item.dataset.section;
  if (!section) return;

  // Mettre à jour l'interface
  document.querySelectorAll(".menu-item").forEach((i) => i.classList.remove("active"));
  item.classList.add("active");

  // Toujours rafraîchir même si déjà actif
  showSection(section, true);
}

async function showSection(sectionName, forceRefresh = false) {
  try {
    const sections = document.querySelectorAll(".content-section");
    if (sections.length === 0) return;
    sections.forEach((section) => section.classList.remove("active"));
    const targetSection = document.getElementById(`${sectionName}-section`);
    if (targetSection) targetSection.classList.add("active");
    const sidebarHeader = document.querySelector(".sidebar-header h1");
    if (sidebarHeader) sidebarHeader.innerHTML = '<i class="fas fa-rocket"></i> SubPilot';
    const titles = {
      dashboard: "Tableau de bord",
      abonnements: "Mes abonnements",
      statistiques: "Statistiques",
      corbeille: "Corbeille",
    };
    const pageTitle = document.getElementById("page-title");
    if (pageTitle) pageTitle.textContent = titles[sectionName] || "SubPilot";
    switch (sectionName) {
      case "dashboard":
        await loadDashboard();
        break;
      case "abonnements":
        if (typeof loadAbonnements === "function") await loadAbonnements();
        displayAbonnements();
        break;
      case "statistiques":
        await loadStatistiques();
        break;
      case "corbeille":
        displayCorbeille();
        break;
    }
  } catch (error) {}
}

// Chargement des données
async function loadData() {
  try {
    await loadAbonnements();
  } catch (error) {
    showNotification("Erreur lors du chargement des données: " + error.message, "error");
    throw error;
  }
}

async function loadAbonnements() {
  try {
    const response = await fetch(`${API_BASE}/abonnements`);
    if (!response.ok) throw new Error("Erreur réseau");
    abonnements = await response.json();
    updateDashboardCounts();
  } catch (error) {
    abonnements = [];
    updateDashboardCounts();
    throw error;
  }
}

function updateDashboardCounts() {
  const total = abonnements.filter((a) => !a.deleted_at).length;
  const actifs = abonnements.filter((a) => !a.deleted_at && (a.actif === true || a.actif === 1)).length;
  const inactifs = abonnements.filter((a) => !a.deleted_at && (a.actif === false || a.actif === 0)).length;
  const corbeille = abonnements.filter((a) => a.deleted_at).length;
  const elTotal = document.getElementById("total-abonnements");
  const elActifs = document.getElementById("total-actifs");
  const elInactifs = document.getElementById("total-inactifs");
  const elCorbeille = document.getElementById("total-corbeille-mini");
  if (elTotal) elTotal.textContent = total;
  if (elActifs) elActifs.textContent = actifs;
  if (elInactifs) elInactifs.textContent = inactifs;
  if (elCorbeille) elCorbeille.textContent = corbeille;

  // Calcul des totaux mensuel et annuel
  let totalMensuel = 0;
  let totalAnnuel = 0;
  let dontMensuel = 0;
  let dontAnnuel = 0;
  abonnements
    .filter((a) => !a.deleted_at && (a.actif === true || a.actif === 1))
    .forEach((a) => {
      if (a.frequence === "mensuel") {
        totalMensuel += parseFloat(a.prix) || 0;
        dontMensuel += parseFloat(a.prix) || 0;
        totalAnnuel += (parseFloat(a.prix) || 0) * 12;
      } else if (a.frequence === "annuel") {
        totalAnnuel += parseFloat(a.prix) || 0;
        dontAnnuel += parseFloat(a.prix) || 0;
        totalMensuel += (parseFloat(a.prix) || 0) / 12;
      }
    });
  // Mise à jour du DOM
  const elCoutMensuel = document.getElementById("cout-mensuel");
  const elValMensuel = document.getElementById("val-mensuel");
  const elCoutAnnuel = document.getElementById("cout-annuel");
  const elValAnnuel = document.getElementById("val-annuel");
  if (elCoutMensuel)
    elCoutMensuel.textContent =
      totalMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  if (elValMensuel)
    elValMensuel.textContent =
      dontMensuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  if (elCoutAnnuel)
    elCoutAnnuel.textContent =
      totalAnnuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
  if (elValAnnuel)
    elValAnnuel.textContent =
      dontAnnuel.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

async function loadDashboard() {
  try {
    displayRecentAbonnements();
  } catch (error) {}
}

async function loadStatistiques() {
  try {
    const response = await fetch(`${API_BASE}/stats/dashboard`);
    if (!response.ok) throw new Error("Erreur réseau");
    const stats = await response.json();
  } catch (error) {}
}

// Affichage des données
function displayAbonnements(abonnementsList = abonnements) {
  const container = document.getElementById("abonnements-list");
  if (!container) return;

  if (abonnementsList.length === 0) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = abonnementsList
    .filter((a) => !a.deleted_at)
    .map((abonnement) => {
      // Statuts
      const isActive = abonnement.actif === 1 || abonnement.actif === true;
      const isArchived = abonnement.archivee === 1 || abonnement.archivee === true;
      // Affichage du statut
      let statusLabel = isActive ? "Actif" : "Inactif";
      let statusClass = isActive ? "status-active" : "status-inactive";
      if (isArchived) {
        statusLabel = "Archivé";
        statusClass = "status-archived";
      }
      return `
        <div class="abonnement-card ${isActive ? "" : "inactive"} ${isArchived ? "archived" : ""} abonnement-item" data-id="${abonnement.id}">
            <div class="abonnement-header">
                <h4>${abonnement.nom}</h4>
                <div class="abonnement-price">
                    ${formatCurrency(abonnement.prix, abonnement.devise)}
                </div>
                <div class="abonnement-frequency">/mensuel</div>
                <div class="abonnement-status ${statusClass}">
                    ${statusLabel}
                </div>
            </div>
            <div class="abonnement-body">
                ${
                  abonnement.description
                    ? `
                    <div class="abonnement-description">${abonnement.description}</div>
                `
                    : ""
                }
                <div class="abonnement-info">
                    <small><i class="fas fa-calendar"></i> Depuis le ${formatDate(abonnement.date_debut)}</small>
                </div>
                <div class="abonnement-actions">
                    <button class="btn btn-sm btn-secondary" onclick="toggleAbonnement(${abonnement.id})" title="Activer/Désactiver">
                        <i class="fas fa-${isActive ? "pause" : "play"}"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editAbonnement(${abonnement.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="trashAbonnement(${abonnement.id})" title="Mettre à la corbeille">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
}

// Affichage des abonnements dans la corbeille
function displayCorbeille() {
  const container = document.getElementById("corbeille-abonnements");
  if (!container) return;
  const corbeilleAbonnements = abonnements.filter((a) => a.deleted_at);
  if (corbeilleAbonnements.length === 0) {
    container.innerHTML = "";
    return;
  }
  container.innerHTML = corbeilleAbonnements
    .map((abonnement) => {
      // Statuts
      const isActive = abonnement.actif === 1 || abonnement.actif === true;
      const isArchived = abonnement.archivee === 1 || abonnement.archivee === true;
      let statusLabel = isActive ? "Actif" : "Inactif";
      let statusClass = isActive ? "status-active" : "status-inactive";
      if (isArchived) {
        statusLabel = "Archivé";
        statusClass = "status-archived";
      }
      return `
        <div class="abonnement-card corbeille-item ${isActive ? "" : "inactive"} ${isArchived ? "archived" : ""}" data-id="${abonnement.id}">
            <div class="abonnement-header">
                <h4>${abonnement.nom}</h4>
                <div class="abonnement-price">
                    ${formatCurrency(abonnement.prix, abonnement.devise)}
                </div>
                <div class="abonnement-frequency">/mensuel</div>
                <div class="abonnement-status ${statusClass}">
                    ${statusLabel}
                </div>
            </div>
            <div class="abonnement-body">
                ${
                  abonnement.description
                    ? `
                    <div class="abonnement-description">${abonnement.description}</div>
                `
                    : ""
                }
                <div class="abonnement-info">
                    <small><i class="fas fa-calendar"></i> Depuis le ${formatDate(abonnement.date_debut)}</small>
                </div>
                <div class="abonnement-actions">
                    <button class="btn btn-sm btn-success" onclick="restoreAbonnement(${abonnement.id})" title="Restaurer">
                        <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAbonnementDefinitif(${abonnement.id})" title="Supprimer définitivement">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    })
    .join("");
}
function displayRecentAbonnements() {
  const recentList = abonnements.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 6);

  const container = document.getElementById("recent-abonnements");
  if (!container) return;

  if (recentList.length === 0) {
    container.innerHTML = '<p class="text-center">Aucun abonnement récent</p>';
    return;
  }

  container.innerHTML = recentList
    .map(
      (abonnement) => `
        <div class="abonnement-card ${abonnement.actif ? "" : "inactive"}">
            <div class="abonnement-header">
                <h4>${abonnement.nom}</h4>
                <div class="abonnement-price">
                    ${formatCurrency(abonnement.prix, abonnement.devise)}
                </div>
                <div class="abonnement-frequency">/mensuel</div>
            </div>
            <div class="abonnement-body"></div>
        </div>
    `,
    )
    .join("");
}

// Gestion du formulaire de solde (balance)
document.addEventListener("DOMContentLoaded", () => {
  const balanceForm = document.getElementById("balance-form");
  if (balanceForm) {
    balanceForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const input = document.getElementById("balance-input");
      if (!input) return;
      const value = parseFloat(input.value);
      if (isNaN(value) || value < 0) {
        alert("Veuillez entrer un solde valide.");
        return;
      }
      try {
        const response = await fetch("/api/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ balance: value }),
        });
        if (!response.ok) throw new Error("Erreur lors de la sauvegarde du solde");
        await refreshDashboardStats();
      } catch (error) {
        alert("Erreur lors de la sauvegarde du solde.");
      }
    });
  }
});

// Gestion des modals
function openAbonnementModal(id = null) {
  currentEditId = id;

  if (id) {
    const abonnement = abonnements.find((a) => a.id === id);
    if (abonnement) {
      fillAbonnementForm(abonnement);
      const modalTitle = document.getElementById("modal-title");
      if (modalTitle) modalTitle.textContent = "Modifier l'abonnement";
    }
  } else {
    if (abonnementForm) abonnementForm.reset();
    const modalTitle = document.getElementById("modal-title");
    if (modalTitle) modalTitle.textContent = "Nouvel abonnement";
    const today = new Date().toISOString().split("T")[0];
    const dateField = document.getElementById("date_debut");
    if (dateField) dateField.value = today;
  }

  if (abonnementModal) abonnementModal.classList.add("show");
  // Focus automatique sur le champ nom
  setTimeout(() => {
    const nomInput = document.getElementById("nom");
    if (nomInput) nomInput.focus();
  }, 100);
}

function closeAbonnementModal() {
  if (abonnementModal) abonnementModal.classList.remove("show");
  currentEditId = null;
  if (abonnementForm) abonnementForm.reset();
}

function fillAbonnementForm(abonnement) {
  const fields = [
    "nom",
    "prix",
    "devise",
    "frequence",
    "date_debut",
    "date_fin",
    "site_web",
    "description",
    "nb_jours",
  ];
  fields.forEach((field) => {
    const element = document.getElementById(field);
    if (element && abonnement[field] !== undefined) {
      element.value = abonnement[field] || "";
    }
  });
}

// Gestion des formulaires
async function handleAbonnementSubmit(e) {
  e.preventDefault();

  const formData = new FormData(abonnementForm);
  const data = Object.fromEntries(formData.entries());

  // Convertir les valeurs numériques
  data.prix = parseFloat(data.prix);
  if (data.nb_jours) data.nb_jours = parseInt(data.nb_jours);
  // Suppression de la gestion de la catégorie
  data.actif = document.getElementById("abonnement-actif")?.checked ? 1 : 0;

  try {
    let response;
    if (currentEditId) {
      response = await fetch(`${API_BASE}/abonnements/${currentEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      response = await fetch(`${API_BASE}/abonnements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    }

    if (response.ok) {
      // Rechargement partiel : recharge les abonnements et la section courante
      await loadAbonnements();
      const activeSection = document.querySelector(".content-section.active");
      if (activeSection) {
        const sectionId = activeSection.id.replace("-section", "");
        switch (sectionId) {
          case "dashboard":
            await loadDashboard();
            break;
          case "abonnements":
            displayAbonnements();
            break;
          case "statistiques":
            await loadStatistiques();
            break;
        }
      }
      closeAbonnementModal();
      showNotification(currentEditId ? "Abonnement modifié avec succès" : "Abonnement créé avec succès", "success");
    } else {
      throw new Error("Erreur lors de l'enregistrement");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de l'enregistrement", "error");
  }
}

// Actions CRUD

// Archiver un abonnement
async function archiveAbonnement(id) {
  if (!confirm("Archiver cet abonnement ?")) return;
  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}/archive`, {
      method: "PATCH",
    });
    if (response.ok) {
      await loadAbonnements();
      displayAbonnements();
      showNotification("Abonnement archivé", "success");
    } else {
      throw new Error("Erreur lors de l'archivage");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de l'archivage", "error");
  }
}

// Mettre à la corbeille un abonnement
async function trashAbonnement(id) {
  if (!confirm("Mettre cet abonnement à la corbeille ?")) return;
  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}/trash`, {
      method: "PATCH",
    });
    if (response.ok) {
      await loadAbonnements();
      displayAbonnements();
      showNotification("Abonnement mis à la corbeille", "success");
    } else {
      throw new Error("Erreur lors de la mise à la corbeille");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de la mise à la corbeille", "error");
  }
}
async function editAbonnement(id) {
  openAbonnementModal(id);
}

async function deleteAbonnement(id) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cet abonnement ?")) return;

  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      await loadAbonnements();
      await loadDashboard();
      displayAbonnements();
      showNotification("Abonnement supprimé", "success");
    } else {
      throw new Error("Erreur lors de la suppression");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors de la suppression", "error");
  }
}

async function toggleAbonnement(id) {
  try {
    const response = await fetch(`${API_BASE}/abonnements/${id}/toggle`, {
      method: "PATCH",
    });

    if (response.ok) {
      await loadAbonnements();

      // Rafraîchir l'affichage en fonction de la section active
      const activeSection = document.querySelector(".content-section.active");
      if (activeSection) {
        const sectionId = activeSection.id.replace("-section", "");
        switch (sectionId) {
          case "dashboard":
            await loadDashboard();
            break;
          case "abonnements":
            displayAbonnements();
            break;
          case "statistiques":
            await loadStatistiques();
            break;
        }
      }

      showNotification("Statut de l'abonnement modifié", "success");
    } else {
      throw new Error("Erreur lors du changement de statut");
    }
  } catch (error) {
    console.error("Erreur:", error);
    showNotification("Erreur lors du changement de statut", "error");
  }
}

// Recherche et filtres
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const filtered = abonnements.filter(
    (abonnement) =>
      abonnement.nom.toLowerCase().includes(query) ||
      (abonnement.description && abonnement.description.toLowerCase().includes(query)),
  );
  displayAbonnements(filtered);
}

// Utilitaires

function formatCurrency(amount, currency = "EUR") {
  const symbols = { EUR: "€", USD: "$", GBP: "£" };
  const symbol = symbols[currency] || "€";
  return `${parseFloat(amount || 0).toFixed(2)} ${symbol}`;
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR");
}

function showNotification(message, type = "info") {
  const container = document.getElementById("notification-container");
  if (container) {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; float: right; cursor: pointer;">×</button>
        `;
    container.appendChild(notification);
    setTimeout(() => {
      if (notification.parentElement) notification.remove();
    }, 5000);
  } else {
    const notification = document.createElement("div");
    notification.style.cssText = `
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: #fff;
            color: #333;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            padding: 1rem 2rem;
            z-index: 9999;
            min-width: 200px;
            font-size: 1rem;
            border-left: 5px solid ${type === "success" ? "#4caf50" : type === "error" ? "#f44336" : "#2196f3"};
        `;
    notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; float: right; cursor: pointer;">×</button>
        `;
    document.body.appendChild(notification);
    setTimeout(() => {
      if (notification.parentElement) notification.remove();
    }, 5000);
  }
}
