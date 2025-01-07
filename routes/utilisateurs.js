// routes/utilisateurs.js
const express = require('express');
const controller = require('../controllers/utilisateurs');
const auth = require("../middleware/auth");
const router = express.Router();

// Récupérer tous les utilisateurs
router.get('/',auth, controller.recupererUtilisateurs);

// Ajouter un utilisateur
router.post('/', controller.inscriptionUtilisateur);

// Connexion
router.post('/connexion', controller.connexionUtilisateur);

// Récupérer un utilisateur par ID
router.get('/:id', auth, controller.recupererUtilisateurParId);

// Mettre à jour un utilisateur
router.put('/modifier/:id', auth, controller.mettreAJourUtilisateur);

// Suppression
router.delete('/:id', auth, controller.supprimerUtilisateur);

module.exports = router;
