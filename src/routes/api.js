const express = require('express');
const router = express.Router();
const { abonnements } = require('../database');

router.patch('/abonnements/:id/trash', async (req, res) => {
    try {
        await abonnements.trash(req.params.id);
        res.json({ message: 'Abonnement mis à la corbeille' });
    } catch (error) {
        console.error('Erreur lors de la mise à la corbeille:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à la corbeille' });
    }
});




router.patch('/abonnements/:id/restore', async (req, res) => {
    try {
        await abonnements.restore(req.params.id);
        res.json({ message: 'Abonnement restauré' });
    } catch (error) {
        console.error('Erreur lors de la restauration:', error);
        res.status(500).json({ error: 'Erreur lors de la restauration' });
    }
});
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



module.exports = router;
