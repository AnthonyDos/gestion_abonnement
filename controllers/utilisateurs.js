const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Utilisateur = require('../models/utilisateurSchema');

exports.recupererUtilisateurs = async (req, res) => {
    try {
      const utilisateurs = await Utilisateur.find();
      res.json(utilisateurs);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

exports.inscriptionUtilisateur = async (req, res) => {
  const champsObligatoires = ['civilite', 'nom', 'prenom', 'email', 'motDePasse', 'ville', 'codePostal', 'telephone'];
  
  try {
    for (const champ of champsObligatoires) {
      if (!req.body[champ]) {
        return res.status(400).json({ error: `Le champ ${champ} est obligatoire.` });
      }
    }
    const email = req.body.email;
    const utilisateurExistant = await Utilisateur.findOne({email});
    if (utilisateurExistant) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    const dernierUtilisateur = await Utilisateur.findOne().sort({ _id: -1 });  
    const nouvelId = dernierUtilisateur ? dernierUtilisateur._id + 1 : 1; 

    const salt = await bcrypt.genSalt(10); 
    const motDePasseCrypte = await bcrypt.hash(req.body.motDePasse, salt); 
    const payload = {
      utilisateurId: nouvelId,
      email: email,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    const nouvelUtilisateur = new Utilisateur({
      _id: nouvelId, 
      civilite: req.body.civilite,
      nom:req.body.nom,
      prenom: req.body.prenom,
      email,
      motDePasse: motDePasseCrypte,
      adresse: req.body.adresse,
      ville: req.body.ville,
      codePostal: req.body.codePostal,
      telephone: req.body.telephone
    });

    await nouvelUtilisateur.save();
    res.status(201).json({
          message: 'Inscription réussie!',
          token,
          nouvelUtilisateur
        });
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
  }
};

  
// Récupérer un utilisateur par ID
exports.recupererUtilisateurParId = async (req, res) => {
    try {
      const utilisateur = await Utilisateur.findById(req.params.id);
      if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur non trouvé' });
      }
      res.json(utilisateur);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
};

exports.connexionUtilisateur = async (req, res) => {
  const { email, motDePasse } = req.body;

  try {
      if (!email || !motDePasse) {
          return res.status(400).json({ error: 'L\'email et le mot de passe sont requis.' });
      }

      const utilisateur = await Utilisateur.findOne({ email });
      if (!utilisateur) {
          return res.status(404).json({ error: 'Utilisateur non trouvé.' });
      }

      const isMatch = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
      if (!isMatch) {
          return res.status(400).json({ error: 'Mot de passe incorrect.' });
      }

      const payload = {
          utilisateurId: utilisateur.id,
          email: utilisateur.email,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(200).json({
          message: 'Connexion réussie!',
          token,
          utilisateur: {
              email: utilisateur.email,
              _id: utilisateur.id,
              nom: utilisateur.nom,
              prenom: utilisateur.prenom
          }
      });
  } catch (err) {
      res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
  }
};

// Modification utilisateur 
exports.mettreAJourUtilisateur = async (req, res) => {
  const { id } = req.params;
  const { nom, prenom, email, motDePasse } = req.body;

  try {
    const utilisateur = await Utilisateur.findById(id);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    utilisateur.nom = nom || utilisateur.nom;
    utilisateur.prenom = prenom || utilisateur.prenom;
    utilisateur.email = email || utilisateur.email;
    
    if (motDePasse) {
      const motDePasseCrypté = await bcrypt.hash(motDePasse, 10);
      utilisateur.motDePasse = motDePasseCrypté;
    }

    await utilisateur.save();
    res.status(200).json({ message: 'Utilisateur mis à jour avec succès.', utilisateur });
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
  }
};

// Suppression d'un utilisateur
exports.supprimerUtilisateur = async (req, res) => {
  const { id } = req.params;

  try {
    const utilisateur = await Utilisateur.findById(id);
    if (!utilisateur) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    await Utilisateur.findByIdAndDelete(id);
    res.status(200).json({ message: 'Utilisateur supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
  }
};