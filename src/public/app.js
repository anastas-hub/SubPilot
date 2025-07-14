// Variables globales
let abonnements = [];
let categories = [];
let currentEditId = null;

// Configuration de l'API
const API_BASE = '/api';

// Éléments DOM (seront initialisés après chargement du DOM)
let sidebar = null;
let sections = null;
let pageTitle = null;
let abonnementModal = null;
let categoryModal = null;
let abonnementForm = null;
let categoryForm = null;

// Variables pour le responsive
let isMobile = false;
let isTablet = false;

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initialisation de SubPilot...');
    
    try {
        // Attendre un petit délai pour s'assurer que le DOM est complètement chargé
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('🔧 Détection de l\'appareil...');
        detectDevice();
        
        console.log('🔧 Initialisation de l\'interface...');
        initializeApp();
        
        console.log('🔧 Configuration des événements...');
        setupEventListeners();
        
        console.log('🔧 Configuration responsive...');
        setupResponsive();
        
        console.log('📡 Chargement des données...');
        await loadData();
        
        console.log('✅ Application initialisée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        showNotification('Erreur lors de l\'initialisation: ' + error.message, 'error');
    }
});

// Initialisation
function initializeApp() {
    console.log('🔧 Initialisation des éléments DOM...');
    
    try {
        // Initialiser les références DOM globales
        sidebar = document.querySelector('.sidebar-menu');
        sections = document.querySelectorAll('.content-section');
        pageTitle = document.getElementById('page-title');
        abonnementModal = document.getElementById('abonnement-modal');
        categoryModal = document.getElementById('category-modal');
        abonnementForm = document.getElementById('abonnement-form');
        categoryForm = document.getElementById('category-form');
        
        console.log('🔧 Affichage de la section dashboard...');
        showSection('dashboard');
        
        // Définir la date du jour par défaut
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('date_debut');
        if (dateField) {
            dateField.value = today;
            console.log('✅ Date par défaut définie');
        }
        
        console.log('✅ Initialisation terminée avec succès');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        throw error;
    }
}

function setupEventListeners() {
    console.log('🔧 Configuration des événements...');
    
    try {
        // Navigation
        const sidebar = document.querySelector('.sidebar-menu');
        if (sidebar) {
            sidebar.addEventListener('click', handleNavigation);
            console.log('✅ Navigation configurée');
        } else {
            console.warn('⚠️ Sidebar non trouvée (.sidebar-menu)');
        }
        
        // Boutons principaux
        const addAbonnementBtn = document.getElementById('add-abonnement-btn');
        if (addAbonnementBtn) {
            addAbonnementBtn.addEventListener('click', () => openAbonnementModal());
            console.log('✅ Bouton ajout abonnement configuré');
        } else {
            console.warn('⚠️ Bouton add-abonnement-btn non trouvé');
        }
        
        const addCategoryBtn = document.getElementById('add-category-btn');
        if (addCategoryBtn) {
            addCategoryBtn.addEventListener('click', () => openCategoryModal());
            console.log('✅ Bouton ajout catégorie configuré');
        } else {
            console.warn('⚠️ Bouton add-category-btn non trouvé');
        }
        
        // Modals - Close buttons
        const closeAbonnementBtn = document.getElementById('close-abonnement-modal');
        if (closeAbonnementBtn) {
            closeAbonnementBtn.addEventListener('click', closeAbonnementModal);
            console.log('✅ Bouton fermeture modal abonnement configuré');
        }
        
        const closeCategoryBtn = document.getElementById('close-category-modal');
        if (closeCategoryBtn) {
            closeCategoryBtn.addEventListener('click', closeCategoryModal);
            console.log('✅ Bouton fermeture modal catégorie configuré');
        }
        
        const cancelAbonnementBtn = document.getElementById('cancel-abonnement');
        if (cancelAbonnementBtn) {
            cancelAbonnementBtn.addEventListener('click', closeAbonnementModal);
            console.log('✅ Bouton annulation abonnement configuré');
        }
        
        const cancelCategoryBtn = document.getElementById('cancel-category');
        if (cancelCategoryBtn) {
            cancelCategoryBtn.addEventListener('click', closeCategoryModal);
            console.log('✅ Bouton annulation catégorie configuré');
        }
        
        // Formulaires
        const abonnementForm = document.getElementById('abonnement-form');
        if (abonnementForm) {
            abonnementForm.addEventListener('submit', handleAbonnementSubmit);
            console.log('✅ Formulaire abonnement configuré');
        }
        
        const categoryForm = document.getElementById('category-form');
        if (categoryForm) {
            categoryForm.addEventListener('submit', handleCategorySubmit);
            console.log('✅ Formulaire catégorie configuré');
        }
        
        // Recherche et filtres
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', handleSearch);
            console.log('✅ Champ recherche configuré');
        }
        
        const categoryFilter = document.getElementById('category-filter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', handleFilter);
            console.log('✅ Filtre catégorie configuré');
        }
        
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', handleFilter);
            console.log('✅ Filtre statut configuré');
        }
        
        // Prévisualisation couleur
        const colorInput = document.getElementById('category-couleur');
        if (colorInput) {
            colorInput.addEventListener('input', updateColorPreview);
            console.log('✅ Prévisualisation couleur configurée');
        }
        
        // Fermer modals en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            const abonnementModal = document.getElementById('abonnement-modal');
            const categoryModal = document.getElementById('category-modal');
            if (abonnementModal && e.target === abonnementModal) closeAbonnementModal();
            if (categoryModal && e.target === categoryModal) closeCategoryModal();
        });
        
        console.log('✅ Tous les événements configurés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors de la configuration des événements:', error);
        throw error;
    }
}

// Navigation
function handleNavigation(e) {
    const item = e.target.closest('.menu-item');
    if (!item) return;
    
    const section = item.dataset.section;
    if (!section) return;
    
    // Mettre à jour l'interface
    document.querySelectorAll('.menu-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    
    showSection(section);
}

function showSection(sectionName) {
    console.log(`🔄 Affichage de la section: ${sectionName}`);
    
    try {
        // Cacher toutes les sections
        const sections = document.querySelectorAll('.content-section');
        if (sections.length === 0) {
            console.warn('⚠️ Aucune section trouvée (.content-section)');
            return;
        }
        
        sections.forEach(section => {
            if (section) {
                section.classList.remove('active');
            }
        });
        
        // Afficher la section demandée
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            console.log(`✅ Section ${sectionName} affichée`);
        } else {
            console.warn(`⚠️ Section ${sectionName}-section non trouvée`);
        }
        
        // Mettre à jour le titre
        const titles = {
            'dashboard': 'Tableau de bord',
            'abonnements': 'Mes abonnements',
            'categories': 'Catégories',
            'statistiques': 'Statistiques'
        };
        
        const pageTitle = document.getElementById('page-title');
        if (pageTitle) {
            pageTitle.textContent = titles[sectionName] || 'SubPilot';
            console.log(`✅ Titre mis à jour: ${pageTitle.textContent}`);
        }
        
        // Charger les données spécifiques à la section
        switch(sectionName) {
            case 'dashboard':
                loadDashboard();
                break;
            case 'abonnements':
                displayAbonnements();
                break;
            case 'categories':
                displayCategories();
                break;
            case 'statistiques':
                loadStatistiques();
                break;
            default:
                console.warn(`⚠️ Section inconnue: ${sectionName}`);
        }
    } catch (error) {
        console.error(`❌ Erreur lors de l'affichage de la section ${sectionName}:`, error);
    }
}

// Chargement des données
async function loadData() {
    console.log('📡 Début du chargement des données...');
    
    try {
        console.log('📋 Chargement des catégories...');
        await loadCategories();
        
        console.log('💳 Chargement des abonnements...');
        await loadAbonnements();
        
        console.log('🔄 Mise à jour des sélecteurs...');
        updateCategorySelects();
        
        console.log('✅ Toutes les données chargées avec succès');
        
    } catch (error) {
        console.error('❌ Erreur lors du chargement des données:', error);
        showNotification('Erreur lors du chargement des données: ' + error.message, 'error');
        throw error;
    }
}

async function loadAbonnements() {
    try {
        const response = await fetch(`${API_BASE}/abonnements`);
        if (!response.ok) throw new Error('Erreur réseau');
        abonnements = await response.json();
        console.log('Abonnements chargés:', abonnements.length);
        
        // Debug: Vérifier le format du champ actif
        if (abonnements.length > 0) {
            console.log('Premier abonnement (debug actif):', {
                nom: abonnements[0].nom,
                actif: abonnements[0].actif,
                typeActif: typeof abonnements[0].actif
            });
        }
    } catch (error) {
        console.error('Erreur lors du chargement des abonnements:', error);
        abonnements = [];
        throw error;
    }
}

async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE}/categories`);
        if (!response.ok) throw new Error('Erreur réseau');
        categories = await response.json();
        console.log('Catégories chargées:', categories.length);
    } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        categories = [];
        throw error;
    }
}

async function loadDashboard() {
    try {
        const response = await fetch(`${API_BASE}/stats/dashboard`);
        if (!response.ok) throw new Error('Erreur réseau');
        const stats = await response.json();
        updateDashboardStats(stats);
        displayRecentAbonnements();
        displayCategoriesChart(stats.repartitionCategories || []);
    } catch (error) {
        console.error('Erreur lors du chargement du dashboard:', error);
    }
}

async function loadStatistiques() {
    try {
        const response = await fetch(`${API_BASE}/stats/dashboard`);
        if (!response.ok) throw new Error('Erreur réseau');
        const stats = await response.json();
        displayDetailedStats(stats);
    } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
    }
}

// Affichage des données
function displayAbonnements(abonnementsList = abonnements) {
    const container = document.getElementById('abonnements-list');
    if (!container) return;
    
    if (abonnementsList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-credit-card" style="font-size: 3rem; color: var(--secondary-color); margin-bottom: 1rem;"></i>
                <h3>Aucun abonnement</h3>
                <p>Commencez par ajouter votre premier abonnement</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = abonnementsList.filter(a => !a.deleted_at).map(abonnement => {
        // Statuts
        const isActive = abonnement.actif === 1 || abonnement.actif === true;
        const isArchived = abonnement.archivee === 1 || abonnement.archivee === true;
        // Affichage du statut
        let statusLabel = isActive ? 'Actif' : 'Inactif';
        let statusClass = isActive ? 'status-active' : 'status-inactive';
        if (isArchived) {
            statusLabel = 'Archivé';
            statusClass = 'status-archived';
        }
        return `
        <div class="abonnement-card ${isActive ? '' : 'inactive'} ${isArchived ? 'archived' : ''} abonnement-item" data-id="${abonnement.id}">
            <div class="abonnement-header">
                <h4>${abonnement.nom}</h4>
                <div class="abonnement-price">
                    ${formatCurrency(abonnement.prix, abonnement.devise)}
                </div>
                <div class="abonnement-frequency">/${abonnement.frequence}</div>
                <div class="abonnement-status ${statusClass}">
                    ${statusLabel}
                </div>
            </div>
            <div class="abonnement-body">
                ${abonnement.categorie_nom ? `
                    <div class="abonnement-category" style="background-color: ${abonnement.categorie_couleur}20; color: ${abonnement.categorie_couleur};">
                        ${abonnement.categorie_nom}
                    </div>
                ` : ''}
                ${abonnement.description ? `
                    <div class="abonnement-description">${abonnement.description}</div>
                ` : ''}
                <div class="abonnement-info">
                    <small><i class="fas fa-calendar"></i> Depuis le ${formatDate(abonnement.date_debut)}</small>
                </div>
                <div class="abonnement-actions">
                    <button class="btn btn-sm btn-secondary" onclick="toggleAbonnement(${abonnement.id})" title="Activer/Désactiver">
                        <i class="fas fa-${isActive ? 'pause' : 'play'}"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="editAbonnement(${abonnement.id})" title="Modifier">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-warning" onclick="archiveAbonnement(${abonnement.id})" title="Archiver">
                        <i class="fas fa-archive"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="trashAbonnement(${abonnement.id})" title="Mettre à la corbeille">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function displayRecentAbonnements() {
    const recentList = abonnements
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 6);
    
    const container = document.getElementById('recent-abonnements');
    if (!container) return;
    
    if (recentList.length === 0) {
        container.innerHTML = '<p class="text-center">Aucun abonnement récent</p>';
        return;
    }
    
    container.innerHTML = recentList.map(abonnement => `
        <div class="abonnement-card ${abonnement.actif ? '' : 'inactive'}">
            <div class="abonnement-header">
                <h4>${abonnement.nom}</h4>
                <div class="abonnement-price">
                    ${formatCurrency(abonnement.prix, abonnement.devise)}
                </div>
                <div class="abonnement-frequency">/${abonnement.frequence}</div>
            </div>
            <div class="abonnement-body">
                ${abonnement.categorie_nom ? `
                    <div class="abonnement-category" style="background-color: ${abonnement.categorie_couleur}20; color: ${abonnement.categorie_couleur};">
                        ${abonnement.categorie_nom}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function displayCategories() {
    const container = document.getElementById('categories-list');
    if (!container) {
        console.warn('Container categories-list non trouvé');
        return;
    }
    
    console.log('Affichage des catégories:', categories.length);
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tags"></i>
                <h3>Aucune catégorie</h3>
                <p>Créez des catégories pour organiser vos abonnements</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = categories.map(category => `
        <div class="category-card">
            <div class="category-header">
                <div class="category-color" style="background-color: ${category.couleur}"></div>
                <div class="category-actions">
                    <button class="btn btn-small btn-danger" onclick="deleteCategorie(${category.id})" title="Supprimer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="category-name">${category.nom}</div>
        </div>
    `).join('');
    
    console.log('Categories affichées dans le DOM');
}

function displayCategoriesChart(repartitionCategories) {
    const container = document.getElementById('categories-chart');
    if (!container) return;
    
    if (repartitionCategories.length === 0) {
        container.innerHTML = '<p class="text-center">Aucune données à afficher</p>';
        return;
    }
    
    container.innerHTML = repartitionCategories.map(cat => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-dot" style="background-color: ${cat.couleur};"></div>
                <span>${cat.nom}</span>
            </div>
            <div class="category-amount">${formatCurrency(cat.coutMensuel || 0)}/mois</div>
        </div>
    `).join('');
}

function updateDashboardStats(stats) {
    const totalActifs = document.getElementById('total-actifs');
    if (totalActifs) totalActifs.textContent = stats.totalActifs || 0;

    const coutMensuel = document.getElementById('cout-mensuel');
    if (coutMensuel) coutMensuel.textContent = formatCurrency(stats.coutMensuel || 0);
    const coutMensuelOnly = document.getElementById('cout-mensuel-only');
    if (coutMensuelOnly) {
        coutMensuelOnly.querySelector('span').textContent = formatCurrency(stats.coutMensuelOnly || 0);
    }

    const coutAnnuel = document.getElementById('cout-annuel');
    if (coutAnnuel) coutAnnuel.textContent = formatCurrency(stats.coutAnnuel || 0);
    const coutAnnuelOnly = document.getElementById('cout-annuel-only');
    if (coutAnnuelOnly) {
        coutAnnuelOnly.querySelector('span').textContent = formatCurrency(stats.coutAnnuelOnly || 0);
    }

    const balanceInput = document.getElementById('balance-input');
    if (balanceInput) balanceInput.value = (stats.balance || 0).toFixed(2);
    const balanceDiff = document.getElementById('balance-diff');
    if (balanceDiff) {
        // Show difference between balance and total monthly cost
        const diff = (stats.balance || 0) - (stats.coutMensuel || 0);
        let text = '';
        if (!isNaN(diff)) {
            text = (diff >= 0 ? '+ ' : '- ') + formatCurrency(Math.abs(diff)) + ' par mois';
        }
        balanceDiff.textContent = text;
    }
}

// Gestion du formulaire de solde (balance)
document.addEventListener('DOMContentLoaded', () => {
    const balanceForm = document.getElementById('balance-form');
    if (balanceForm) {
        balanceForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const input = document.getElementById('balance-input');
            if (!input) return;
            const value = parseFloat(input.value);
            if (isNaN(value) || value < 0) {
                alert('Veuillez entrer un solde valide.');
                return;
            }
            try {
                const response = await fetch('/api/balance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ balance: value })
                });
                if (!response.ok) throw new Error('Erreur lors de la sauvegarde du solde');
                // Rafraîchir les stats
                await refreshDashboardStats();
            } catch (err) {
                alert('Erreur lors de la sauvegarde du solde.');
            }
        });
    }
});

function displayDetailedStats(stats) {
    const container = document.getElementById('category-breakdown');
    if (!container) return;
    
    if (!stats.repartitionCategories || stats.repartitionCategories.length === 0) {
        container.innerHTML = '<p>Aucune donnée disponible</p>';
        return;
    }
    
    container.innerHTML = stats.repartitionCategories.map(cat => `
        <div class="category-item">
            <div class="category-info">
                <div class="category-dot" style="background-color: ${cat.couleur};"></div>
                <div>
                    <div>${cat.nom}</div>
                    <small>${cat.count} abonnement${cat.count !== 1 ? 's' : ''}</small>
                </div>
            </div>
            <div>
                <div class="category-amount">${formatCurrency(cat.coutMensuel || 0)}/mois</div>
                <small>${formatCurrency((cat.coutMensuel || 0) * 12)}/an</small>
            </div>
        </div>
    `).join('');
}

// Gestion des modals
function openAbonnementModal(id = null) {
    currentEditId = id;
    
    if (id) {
        const abonnement = abonnements.find(a => a.id === id);
        if (abonnement) {
            fillAbonnementForm(abonnement);
            const modalTitle = document.getElementById('modal-title');
            if (modalTitle) modalTitle.textContent = 'Modifier l\'abonnement';
        }
    } else {
        if (abonnementForm) abonnementForm.reset();
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = 'Nouvel abonnement';
        const today = new Date().toISOString().split('T')[0];
        const dateField = document.getElementById('date_debut');
        if (dateField) dateField.value = today;
    }
    
    if (abonnementModal) abonnementModal.classList.add('show');
}

function closeAbonnementModal() {
    if (abonnementModal) abonnementModal.classList.remove('show');
    currentEditId = null;
    if (abonnementForm) abonnementForm.reset();
}

function openCategoryModal() {
    if (categoryForm) categoryForm.reset();
    const colorInput = document.getElementById('category-couleur');
    if (colorInput) colorInput.value = '#007bff';
    updateColorPreview();
    if (categoryModal) categoryModal.classList.add('show');
}

function closeCategoryModal() {
    if (categoryModal) categoryModal.classList.remove('show');
    if (categoryForm) categoryForm.reset();
}

function fillAbonnementForm(abonnement) {
    const fields = ['nom', 'prix', 'devise', 'frequence', 'date_debut', 'date_fin', 'site_web', 'description', 'categorie_id'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element && abonnement[field] !== undefined) {
            element.value = abonnement[field] || '';
        }
    });
}

function updateColorPreview() {
    const colorInput = document.getElementById('category-couleur');
    const preview = document.getElementById('color-preview');
    if (colorInput && preview) {
        preview.style.backgroundColor = colorInput.value;
    }
}

// Gestion des formulaires
async function handleAbonnementSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(abonnementForm);
    const data = Object.fromEntries(formData.entries());
    
    // Convertir les valeurs numériques
    data.prix = parseFloat(data.prix);
    data.categorie_id = data.categorie_id ? parseInt(data.categorie_id) : null;
    data.actif = document.getElementById('abonnement-actif')?.checked ? 1 : 0;
    
    try {
        let response;
        if (currentEditId) {
            response = await fetch(`${API_BASE}/abonnements/${currentEditId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            response = await fetch(`${API_BASE}/abonnements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }
        
        if (response.ok) {
            await loadAbonnements();
            
            // Rafraîchir l'affichage en fonction de la section active
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id.replace('-section', '');
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboard();
                        break;
                    case 'abonnements':
                        displayAbonnements();
                        break;
                    case 'statistiques':
                        await loadStatistiques();
                        break;
                }
            }
            
            closeAbonnementModal();
            showNotification(
                currentEditId ? 'Abonnement modifié avec succès' : 'Abonnement créé avec succès',
                'success'
            );
        } else {
            throw new Error('Erreur lors de l\'enregistrement');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'enregistrement', 'error');
    }
}

async function handleCategorySubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch(`${API_BASE}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeCategoryModal();
            await loadCategories();
            updateCategorySelects();
            
            // Rafraîchir l'affichage en fonction de la section active
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id.replace('-section', '');
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboard();
                        break;
                    case 'categories':
                        displayCategories();
                        break;
                    case 'statistiques':
                        await loadStatistiques();
                        break;
                }
            }
            
            showNotification('Catégorie ajoutée avec succès', 'success');
        } else {
            throw new Error('Erreur lors de la sauvegarde');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la sauvegarde', 'error');
    }
}

// Actions CRUD

// Archiver un abonnement
async function archiveAbonnement(id) {
    if (!confirm('Archiver cet abonnement ?')) return;
    try {
        const response = await fetch(`${API_BASE}/abonnements/${id}/archive`, { method: 'PATCH' });
        if (response.ok) {
            await loadAbonnements();
            displayAbonnements();
            showNotification('Abonnement archivé', 'success');
        } else {
            throw new Error('Erreur lors de l\'archivage');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de l\'archivage', 'error');
    }
}

// Mettre à la corbeille un abonnement
async function trashAbonnement(id) {
    if (!confirm('Mettre cet abonnement à la corbeille ?')) return;
    try {
        const response = await fetch(`${API_BASE}/abonnements/${id}/trash`, { method: 'PATCH' });
        if (response.ok) {
            await loadAbonnements();
            displayAbonnements();
            showNotification('Abonnement mis à la corbeille', 'success');
        } else {
            throw new Error('Erreur lors de la mise à la corbeille');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la mise à la corbeille', 'error');
    }
}
async function editAbonnement(id) {
    openAbonnementModal(id);
}

async function deleteAbonnement(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet abonnement ?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/abonnements/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAbonnements();
            
            // Rafraîchir l'affichage en fonction de la section active
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id.replace('-section', '');
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboard();
                        break;
                    case 'abonnements':
                        displayAbonnements();
                        break;
                    case 'statistiques':
                        await loadStatistiques();
                        break;
                }
            }
            
            showNotification('Abonnement supprimé avec succès', 'success');
        } else {
            throw new Error('Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors de la suppression', 'error');
    }
}

async function deleteCategorie(id) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
        const response = await fetch(`${API_BASE}/categories/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadCategories();
            updateCategorySelects();
            
            // Rafraîchir l'affichage en fonction de la section active
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id.replace('-section', '');
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboard();
                        break;
                    case 'categories':
                        displayCategories();
                        break;
                    case 'statistiques':
                        await loadStatistiques();
                        break;
                }
            }
            
            showNotification('Catégorie supprimée avec succès', 'success');
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erreur lors de la suppression');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification(error.message, 'error');
    }
}

async function toggleAbonnement(id) {
    try {
        const response = await fetch(`${API_BASE}/abonnements/${id}/toggle`, {
            method: 'PATCH'
        });
        
        if (response.ok) {
            await loadAbonnements();
            
            // Rafraîchir l'affichage en fonction de la section active
            const activeSection = document.querySelector('.content-section.active');
            if (activeSection) {
                const sectionId = activeSection.id.replace('-section', '');
                switch(sectionId) {
                    case 'dashboard':
                        await loadDashboard();
                        break;
                    case 'abonnements':
                        displayAbonnements();
                        break;
                    case 'statistiques':
                        await loadStatistiques();
                        break;
                }
            }
            
            showNotification('Statut de l\'abonnement modifié', 'success');
        } else {
            throw new Error('Erreur lors du changement de statut');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showNotification('Erreur lors du changement de statut', 'error');
    }
}

// Recherche et filtres
function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const filtered = abonnements.filter(abonnement =>
        abonnement.nom.toLowerCase().includes(query) ||
        (abonnement.description && abonnement.description.toLowerCase().includes(query)) ||
        (abonnement.categorie_nom && abonnement.categorie_nom.toLowerCase().includes(query))
    );
    displayAbonnements(filtered);
}

function handleFilter() {
    const categoryFilter = document.getElementById('category-filter');
    const statusFilter = document.getElementById('status-filter');
    
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const statusValue = statusFilter ? statusFilter.value : '';
    
    let filtered = abonnements;
    
    if (categoryValue) {
        filtered = filtered.filter(a => a.categorie_id == categoryValue);
    }
    
    if (statusValue) {
        if (statusValue === 'actif') {
            // Filtrer les abonnements actifs (actif = 1 ou true)
            filtered = filtered.filter(a => a.actif === 1 || a.actif === true);
        } else if (statusValue === 'inactif') {
            // Filtrer les abonnements inactifs (actif = 0 ou false)
            filtered = filtered.filter(a => a.actif === 0 || a.actif === false);
        }
    }
    
    console.log('Filtrage:', { categoryValue, statusValue, totalResults: filtered.length });
    displayAbonnements(filtered);
}

// Utilitaires
function updateCategorySelects() {
    const selects = ['categorie_id', 'category-filter'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (!select) return;
        
        // Garder les options par défaut
        const defaultOptions = Array.from(select.querySelectorAll('option')).filter(opt => !opt.value);
        
        select.innerHTML = '';
        defaultOptions.forEach(opt => select.appendChild(opt));
        
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.nom;
            select.appendChild(option);
        });
    });
}

function formatCurrency(amount, currency = 'EUR') {
    const symbols = { EUR: '€', USD: '$', GBP: '£' };
    const symbol = symbols[currency] || '€';
    return `${parseFloat(amount || 0).toFixed(2)} ${symbol}`;
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

function showNotification(message, type = 'info') {
    console.log(`📢 Notification [${type}]: ${message}`);
    
    // Essayer d'utiliser le container de notification s'il existe
    const container = document.getElementById('notification-container');
    if (container) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; float: right; cursor: pointer;">×</button>
        `;
        
        container.appendChild(notification);
        
        // Auto-remove après 5 secondes
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    } else {
        // Fallback : créer une notification simple
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            z-index: 1001;
            font-family: Arial, sans-serif;
            max-width: 400px;
            background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Fonctions responsive
function detectDevice() {
    const width = window.innerWidth;
    const userAgent = navigator.userAgent.toLowerCase();
    
    isMobile = width <= 768 || /mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    isTablet = width > 768 && width <= 992;
    
    console.log(`📱 Appareil détecté: ${isMobile ? 'Mobile' : isTablet ? 'Tablette' : 'Desktop'} (${width}px)`);
    
    // Ajouter des classes CSS pour le responsive
    document.body.classList.toggle('is-mobile', isMobile);
    document.body.classList.toggle('is-tablet', isTablet);
    document.body.classList.toggle('is-desktop', !isMobile && !isTablet);
}

function setupResponsive() {
    // Gérer les changements d'orientation et de taille
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            detectDevice();
            handleOrientationChange();
        }, 150);
    });
    
    // Gérer les changements d'orientation spécifiquement
    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            detectDevice();
            handleOrientationChange();
        }, 300);
    });
    
    // Améliorer les interactions tactiles
    if (isMobile) {
        setupTouchInteractions();
    }
    
    // Optimiser les modales pour mobile
    setupMobileModals();
    
    console.log('✅ Configuration responsive terminée');
}

function handleOrientationChange() {
    const orientation = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
    console.log(`🔄 Orientation changée: ${orientation}`);
    
    document.body.classList.toggle('is-portrait', orientation === 'portrait');
    document.body.classList.toggle('is-landscape', orientation === 'landscape');
    
    // Réajuster les grilles si nécessaire
    if (isMobile && orientation === 'landscape') {
        // Optimiser l'affichage en mode paysage
        const dashboardContent = document.querySelector('.dashboard-content');
        if (dashboardContent) {
            dashboardContent.style.gridTemplateColumns = '2fr 1fr';
        }
    }
}

function setupTouchInteractions() {
    // Améliorer le scroll horizontal sur mobile pour la navigation
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu && isMobile) {
        // Permettre le scroll tactile horizontal
        sidebarMenu.style.webkitOverflowScrolling = 'touch';
        sidebarMenu.style.scrollbarWidth = 'none';
        
        // Indiquer visuellement que c'est scrollable
        sidebarMenu.classList.add('touch-scrollable');
    }
    
    // Améliorer les interactions tactiles sur les cartes
    const cards = document.querySelectorAll('.abonnement-card, .stat-card, .category-card');
    cards.forEach(card => {
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.98)';
        }, { passive: true });
        
        card.addEventListener('touchend', () => {
            setTimeout(() => {
                card.style.transform = '';
            }, 150);
        }, { passive: true });
    });
    
    console.log('✅ Interactions tactiles configurées');
}

function setupMobileModals() {
    // Observer les modales pour les adapter au mobile
    const modals = document.querySelectorAll('.modal');
    
    modals.forEach(modal => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    if (modal.classList.contains('show') && isMobile) {
                        // Empêcher le scroll de l'arrière-plan
                        document.body.style.overflow = 'hidden';
                        
                        // Focus sur le premier champ de saisie
                        const firstInput = modal.querySelector('input, select, textarea');
                        if (firstInput) {
                            setTimeout(() => firstInput.focus(), 300);
                        }
                    } else if (!modal.classList.contains('show')) {
                        // Restaurer le scroll
                        document.body.style.overflow = '';
                    }
                }
            });
        });
        
        observer.observe(modal, { attributes: true });
    });
    
    console.log('✅ Modales mobiles configurées');
}

// Fonction utilitaire pour détecter si on est sur un appareil tactile
function isTouchDevice() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Fonction pour optimiser les performances sur mobile
function optimizeForMobile() {
    if (isMobile) {
        // Réduire les animations pour les appareils moins puissants
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (prefersReducedMotion.matches) {
            document.body.classList.add('reduce-motion');
        }
        
        // Optimiser les images (si applicable)
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.loading = 'lazy';
        });
    }
}

