const express = require('express');
const controller = require('../controllers/abonnements.js');
const auth = require("../middleware/auth.js");
const router = express.Router();

// Récupérer tous les abonnements
router.get('/', auth, controller.recupererAbonnements);

// Récupérer tous les abonnements d'un utilisateur
router.get('/utilisateur/:id', auth, controller.recupererTousLesAbonnementsUtilisateur);

// Récupérer un abonnement par son id
router.get('/:id', auth, controller.recupererAbonnementParId);

// Ajouter un abonnement
router.post('/', auth, controller.ajouterAbonnement);

// Mettre à jour un abonnement
router.put('/:id', auth, controller.mettreAJourAbonnement);

// Suppression
router.delete('/:id', auth, controller.supprimerAbonnement);

//Génération pdf
router.get("/:id/document/generer-pdf", controller.generationPdf);

module.exports = router; 

