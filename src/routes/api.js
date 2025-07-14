


const express = require('express');
const router = express.Router();
const { abonnements, categories, stats } = require('../database');

// Endpoint pour récupérer le solde
router.get('/balance', async (req, res) => {
    stats.getBalance(balance => {
        res.json({ balance });
    });
});

// Endpoint pour modifier le solde
router.post('/balance', async (req, res) => {
    const { balance } = req.body;
    if (typeof balance !== 'number' || isNaN(balance)) {
        return res.status(400).json({ error: 'Solde invalide' });
    }
    stats.setBalance(balance, err => {
        if (err) return res.status(500).json({ error: 'Erreur lors de la mise à jour du solde' });
        res.json({ success: true, balance });
    });
});



// Routes pour les abonnements
router.get('/abonnements', async (req, res) => {
    try {
        const data = await abonnements.getAll();
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des abonnements:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.get('/abonnements/:id', async (req, res) => {
    try {
        const abonnement = await abonnements.getById(req.params.id);
        if (!abonnement) {
            return res.status(404).json({ error: 'Abonnement non trouvé' });
        }
        res.json(abonnement);
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'abonnement:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/abonnements', async (req, res) => {
    try {
        let data = req.body;
        // Si aucune catégorie n'est fournie, utiliser la catégorie "Général"
        if (!data.categorie_id) {
            // Chercher l'id de la catégorie "Général"
            const allCategories = await categories.getAll();
            const general = allCategories.find(cat => cat.nom.toLowerCase() === 'général');
            if (general) {
                data.categorie_id = general.id;
            }
        }
        const nouvelAbonnement = await abonnements.create(data);
        res.status(201).json(nouvelAbonnement);
    } catch (error) {
        console.error('Erreur lors de la création de l\'abonnement:', error);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
});

router.put('/abonnements/:id', async (req, res) => {
    try {
        const abonnementMisAJour = await abonnements.update(req.params.id, req.body);
        res.json(abonnementMisAJour);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'abonnement:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    }
});

router.delete('/abonnements/:id', async (req, res) => {
    try {
        await abonnements.delete(req.params.id);
        res.json({ message: 'Abonnement supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'abonnement:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression' });
    }
});

router.patch('/abonnements/:id/toggle', async (req, res) => {
    try {
        const result = await abonnements.toggle(req.params.id);
        res.json({ message: 'Statut de l\'abonnement modifié', result });
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        res.status(500).json({ error: 'Erreur lors du changement de statut' });
    }
});

// Routes pour les catégories
router.get('/categories', async (req, res) => {
    try {
        const data = await categories.getAll();
        res.json(data);
    } catch (error) {
        console.error('Erreur lors de la récupération des catégories:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

router.post('/categories', async (req, res) => {
    try {
        const nouvelleCategorie = await categories.create(req.body);
        res.status(201).json(nouvelleCategorie);
    } catch (error) {
        console.error('Erreur lors de la création de la catégorie:', error);
        res.status(500).json({ error: 'Erreur lors de la création' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        // Empêcher la suppression de la catégorie "Général"
        const allCategories = await categories.getAll();
        const general = allCategories.find(cat => cat.nom.toLowerCase() === 'général');
        if (general && String(req.params.id) === String(general.id)) {
            return res.status(400).json({ error: 'La catégorie "Général" ne peut pas être supprimée.' });
        }
        // Migration automatique des abonnements vers "Général"
        if (general) {
            await abonnements.migrateCategory(req.params.id, general.id);
        }
        await categories.delete(req.params.id);
        res.json({ message: 'Catégorie supprimée avec succès. Les abonnements ont été migrés vers "Général".' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la catégorie:', error);
        res.status(500).json({ error: error.message });
    }
});

// Routes pour les statistiques
router.get('/stats/dashboard', async (req, res) => {
    try {
        const statsData = await stats.getDashboard();
        res.json(statsData);
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
