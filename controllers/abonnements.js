const Abonnement = require('../models/abonnementSchema.js');
const moment = require('moment'); 

exports.recupererAbonnements = async (req, res) => {
    try {
        const abonnements = await Abonnement.find();

        const maintenant = new Date();
        const abonnementsAvecStatut = abonnements.map((abonnement) => {
            let statut = "inactif";
            if (!abonnement.date_fin || abonnement.date_fin > maintenant) {
                statut = "actif";
            }
             abonnement.statut = statut;
             abonnement.save();    
            return {
                ...abonnement.toObject(),
                statut
            };
        });
        res.status(200).json(abonnementsAvecStatut);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recupererTousLesAbonnementsUtilisateur = async (req, res) => {
    try {
        const abonnements = await Abonnement.find({ utilisateur_id: req.params.id });
        const maintenant = new Date();
        const abonnementsAvecStatut = abonnements.map((abonnement) => {
            let statut = "inactif";
            if (!abonnement.date_fin || abonnement.date_fin > maintenant) {
                statut = "actif";
            }
            abonnement.statut = statut;
            abonnement.save();    
            
            return {
                ...abonnement.toObject(),
                statut
            };
        });
        res.status(200).json(abonnementsAvecStatut);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.recupererAbonnementParId = async (req, res) => {
    const { id } = req.params;

    try {
        const abonnement = await Abonnement.findById(id);

        if (!abonnement) {
            return res.status(404).json({ error: "Abonnement non trouvé!" });
        }

        const maintenant = new Date();
        let statut = "inactif";
        if (!abonnement.date_fin || abonnement.date_fin > maintenant) {
            statut = "actif";
        }

        abonnement.statut = statut;

        await abonnement.save();

        const abonnementAvecStatut = {
            ...abonnement.toObject(),
            statut
        };

        res.status(200).json(abonnementAvecStatut);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la récupération de l'abonnement!", cause: err.message });
    }
};

exports.ajouterAbonnement = async (req, res) => {
    const { utilisateur_id, nom_service, date_debut, duree, montant } = req.body;
    console.log('Route POST /api/abonnements appelée avec :', req.body);

    if (!utilisateur_id || !nom_service || !date_debut || !montant || !duree) {
        return res.status(400).json({ error: 'Tous les champs doivent être renseignés.' });
    }

    if (isNaN(duree)) {
        return res.status(400).json({ error: 'La durée doit être un nombre valide.' });
    }
    
    const dateDuJour = new Date();
    let date_fin;
    if (duree) {
        date_fin = moment(dateDuJour).add(duree, 'months').toDate();  
    }

    const dernierAbonnement = await Abonnement.findOne().sort({ id: -1 });  
    const nouvelId = dernierAbonnement ? dernierAbonnement.id + 1 : 1;
    console.log(utilisateur_id)
    try {
        const abonnement = new Abonnement({
            id: nouvelId,
            utilisateur_id,
            nom_service,
            date_debut,
            date_fin,
            montant,
            duree,
            statut: 'actif'
        });

        await abonnement.save();
        res.status(201).json(abonnement);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.mettreAJourStatutAbonnement = async (req, res) => {
    const { abonnement_id } = req.params;

    try {
        const abonnement = await Abonnement.findById(abonnement_id);

        if (!abonnement) {
            return res.status(404).json({ error: "Abonnement non trouvé" });
        }

        const maintenant = new Date();
        let statut = "inactif";

        if (!abonnement.date_fin || abonnement.date_fin > maintenant) {
            statut = "actif";
        }
        abonnement.statut = statut;
        await abonnement.save();

        res.status(200).json({
            message: "Statut de l'abonnement mis à jour",
            abonnement
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la mise à jour du statut", cause: err.message });
    }
};

exports.mettreAJourAbonnement = async (req, res) => {
    const { id } = req.params;
    const { type, date_debut, date_fin, statut } = req.body;  
  
    try {
      const abonnement = await Abonnement.findById(id);
      if (!abonnement) {
        return res.status(404).json({ error: 'Abonnement non trouvé.' });
      }
  
      abonnement.type = type || abonnement.type;  
      abonnement.date_debut = date_debut || abonnement.date_debut;
      abonnement.date_fin = date_fin || abonnement.date_fin;
      abonnement.statut = statut || abonnement.statut;
  
      await abonnement.save();
  
      res.status(200).json({
        message: 'Abonnement mis à jour avec succès.',
        abonnement
      });
    } catch (err) {
      res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
    }
  };

// Suppression abonnement
exports.supprimerAbonnement = async (req, res) => {
    const { id } = req.params;
  
    try {
      const abonnement = await Abonnement.findById(id);
      if (!abonnement) {
        return res.status(404).json({ error: 'Abonnement non trouvé.' });
      }
  
      await Abonnement.deleteOne({ _id: id });
      res.status(200).json({ message: 'Abonnement supprimé avec succès.' });
    } catch (err) {
      res.status(500).json({ error: 'Erreur interne du serveur.', cause: err.message });
    }
  };