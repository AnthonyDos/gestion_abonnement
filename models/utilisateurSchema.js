const mongoose = require('mongoose');

const utilisateurSchema = new mongoose.Schema({
  _id: { type: Number, required: true, unique: true }, 
  adresse: { type: String, required: true},
  civilite: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  telephone: { 
    type: String, 
    required: true, 
    match: /^[+]*[0-9]{1,4}[ ]?[0-9]{6,14}$/
  },
  ville: { type: String, required: true},
  codePostal: {type: String, required: true},
  abonnement: { type: mongoose.Schema.Types.ObjectId, ref: 'Abonnement' } 
});

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);

module.exports = Utilisateur;

