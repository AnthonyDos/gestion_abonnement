const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  _id: { type: Number, required: true, unique: true }, 
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  abonnement: { type: mongoose.Schema.Types.ObjectId, ref: 'Abonnement' } 
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;

