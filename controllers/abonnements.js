const Abonnement = require('../models/abonnementSchema.js');
const moment = require('moment'); 
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Utilisateur = require('../models/utilisateurSchema.js');

// Récupérer tous les abonnements
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
        const abonnement = await Abonnement.findOne({id: parseInt(id)});
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
    const { id, nom_service, date_debut, duree, montant } = req.body;

    if (!id || !nom_service || !date_debut || !montant || !duree) {
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

    try {
        const abonnement = new Abonnement({
            id: nouvelId,
            utilisateur_id: id,
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

  // Générer un pdf
  exports.generationPdf= async(req, res) => {
    const id = req.params.id || req.body.id;
    const abonnement = await Abonnement.findOne({id: parseInt(id)});
    const utilisateur = await Utilisateur.findById(req.params.id);    
    const doc = new PDFDocument();
    doc.fontSize(18).text('CONTRAT D\'ABONNEMENT', { align: 'center' }).moveDown(1);

    // Ajout du texte du contrat
    doc.fontSize(12).text('Entre les soussignés :\n\n');
    doc.text(`La société ${abonnement.nom_service}\nAdresse : [Adresse de la société]\n.`);
    doc.text('Et\n\n');
    doc.text(`Le client ${utilisateur.nom}\nAdresse : [Adresse du client]\nEmail : ${utilisateur.email}\nTéléphone : [Numéro de téléphone du client]\n\n`);
    doc.text('1. Objet du contrat\nLe présent contrat a pour objet l’abonnement aux services de [Nom du service], fournis par [Nom de la société].\n\n');
    doc.text('2. Date de souscription\nLa date de souscription au service est fixée au : [Date de souscription]\n\n');
    doc.text('3. Durée de l\'abonnement\nLe présent abonnement est conclu pour une durée de [Durée du contrat en mois] mois, à compter de la date de souscription.\n\n');
    doc.text('4. Date de fin d\'engagement\nLa fin d\'engagement de l\'abonnement est prévue pour le : [Date de fin d\'engagement]\n\n');
    doc.text('5. Prix et conditions de paiement\nLe prix mensuel de l\'abonnement est fixé à : [Prix mensuel en €] € par mois.\nLe paiement sera effectué mensuellement, au début de chaque période de facturation.\n\n');
    doc.text('6. Conditions générales\nLes conditions générales des services fournis sont disponibles à l\'adresse suivante : [URL des conditions générales]\n\n');
    doc.text('7. Résiliation\nLe client peut résilier son abonnement à tout moment avant la fin de la période d\'engagement en suivant les procédures de résiliation décrites dans les conditions générales.\n\n');

    // Ajouter la signature et le lieu
    doc.text('Fait à [Lieu], le [Date]\n\n');
    doc.text('Signature de la société\n[Nom du représentant]\n[Poste du représentant]\n[Signature de la société]\n\n');
    doc.text('Signature du client\n[Nom du client]\n[Signature du client]\n');

    // Envoi du PDF à l'utilisateur
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=contrat_abonnement.pdf');
    doc.pipe(res);

    doc.end();
} 