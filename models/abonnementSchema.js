const mongoose = require('mongoose');

const abonnementSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, 
    utilisateur_id: { type: Number, ref: 'Utilisateur' },
    nom_service: { type: String, required: true },
    date_debut: { type: Date, required: true },
    date_fin: { type: Date },
    montant: { type: Number, required: true },
    duree: { type: Number },
    expirationDans: {type: String},
    statut: { type: String, default: 'actif' }
});

const Abonnement = mongoose.model('Abonnement', abonnementSchema);

module.exports = Abonnement;
