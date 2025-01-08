const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    utilisateur_id: { type: Number, ref: 'Utilisateur' },
    nom_service: { type: String, required: true },
    adresse: {type: String, required: true},
    ville: {type: String, required: true},
    codePostal: {type: String, required: true},
    date_debut: { type: Date, required: true },
    date_fin: { type: Date },
    montant: { type: Number, required: true },
    duree: { type: Number },
    telephone: { 
        type: String, 
        required: true, 
        match: /^[+]*[0-9]{1,4}[ ]?[0-9]{6,14}$/
    },
    numeroClient: {type: String, required: true },
    expirationDans: {type: String},
    statut: { type: String, default: 'actif' }
});

const Abonnement = mongoose.model('Abonnement', abonnementSchema);

module.exports = Abonnement;
