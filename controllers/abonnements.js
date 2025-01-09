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
            const startDate = new Date();
            const endDate = new Date(abonnement.date_fin);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            if (isNaN(startDate) || isNaN(endDate)) {
                return res.status(400).send("Les dates fournies ne sont pas valides.");
            }
            const diffInMilliseconds = endDate - startDate;
            
            // Calcul de la différence en jours
            const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
            const differenceEnJourCorrect = Math.floor(differenceEnJour);

            abonnement.expirationDans = differenceEnJourCorrect;
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
            const startDate = new Date();
            const endDate = new Date(abonnement.date_fin);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);

            if (isNaN(startDate) || isNaN(endDate)) {
                return res.status(400).send("Les dates fournies ne sont pas valides.");
            }
            const diffInMilliseconds = endDate - startDate;
            
            // Calcul de la différence en jours
            const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
            const differenceEnJourCorrect = Math.floor(differenceEnJour);

            abonnement.expirationDans = differenceEnJourCorrect;
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
        const startDate = new Date();
        const endDate = new Date(abonnement.date_fin);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (isNaN(startDate) || isNaN(endDate)) {
            return res.status(400).send("Les dates fournies ne sont pas valides.");
        }
        const diffInMilliseconds = endDate - startDate;
        
        // Calcul de la différence en jours
        const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
        const differenceEnJourCorrect = Math.floor(differenceEnJour);

        abonnement.expirationDans = differenceEnJourCorrect;
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
    const champsObligatoires = req.body;
    const tableauChamps = [champsObligatoires];

    for (const champ of tableauChamps) {
        if (![champ]) {
          return res.status(400).json({ error: `Le champ ${champ} est obligatoire.` });
        }
    }

    const startDate = new Date();
    const endDate = new Date(req.body.date_fin);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).send("Les dates fournies ne sont pas valides.");
    }
    const diffInMilliseconds = endDate - startDate;
    
    // Calcul de la différence en jours
    const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
    const differenceEnJourCorrect = Math.floor(differenceEnJour);

    if (isNaN(req.body.duree)) {
        return res.status(400).json({ error: 'La durée doit être un nombre valide.' });
    }

    const dernierAbonnement = await Abonnement.findOne().sort({ id: -1 });  
    const nouvelId = dernierAbonnement ? dernierAbonnement.id + 1 : 1;
    
    try {
        const abonnement = new Abonnement({
            id: nouvelId,
            utilisateur_id: req.body.utilisateur_id,
            nom_service: req.body.nom_service,
            date_debut: req.body.date_debut,
            date_fin: req.body.date_fin,
            montant: req.body.montant,
            duree: req.body.duree,
            adresse: req.body.adresse,
            ville: req.body.ville,
            codePostal: req.body.codePostal,
            telephone: req.body.telephone,
            numeroClient: req.body.numeroClient,
            expirationDans: differenceEnJourCorrect,
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
        const endDate = new Date(abonnement.date_fin);
        maintenant.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (isNaN(maintenant) || isNaN(endDate)) {
            return res.status(400).send("Les dates fournies ne sont pas valides.");
        }
        const diffInMilliseconds = endDate - maintenant;
        
        // Calcul de la différence en jours
        const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
        const differenceEnJourCorrect = Math.floor(differenceEnJour);

        abonnement.expirationDans = differenceEnJourCorrect;
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
    
        const maintenant = new Date();
        const endDate = new Date(abonnement.date_fin);
        maintenant.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        if (isNaN(maintenant) || isNaN(endDate)) {
            return res.status(400).send("Les dates fournies ne sont pas valides.");
        }
        const diffInMilliseconds = endDate - maintenant;
        
        // Calcul de la différence en jours
        const differenceEnJour = diffInMilliseconds / (1000 * 60 * 60 * 24);
        const differenceEnJourCorrect = Math.floor(differenceEnJour);

        abonnement.expirationDans = differenceEnJourCorrect;
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
    
    const leftColumnX = 50; 
    const rightColumnX = 300;
    const startY = doc.y; 

    doc.fontSize(12).text(
        `Le client :\n${utilisateur.civilite} ${utilisateur.nom} ${utilisateur.prenom}\nAdresse : ${utilisateur.adresse}\n${utilisateur.codePostal} ${utilisateur.ville}\nEmail : ${utilisateur.email}\nTéléphone : ${utilisateur.telephone}\n\n`,
        leftColumnX,
        startY
    );

    doc.fontSize(12).text(
        `La société :\n${abonnement.nom_service}\nAdresse : ${abonnement.adresse}\n${abonnement.codePostal} ${abonnement.ville}\nTéléphone : ${abonnement.telephone}\n\n`,
        rightColumnX,
        startY
    );

    doc.moveDown(2); 
    doc.x = 50; 

    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateDebut = new Intl.DateTimeFormat('fr-FR', options).format(abonnement.date_debut);
    const dateFin = new Intl.DateTimeFormat('fr-FR', options).format(abonnement.date_fin);

    doc.fontSize(12).text(`Conditions du contrat\n\n`);

    // Contenu du contrat
    doc.fontSize(11).text(`1. Objet du contrat\nLe présent contrat a pour objet l’abonnement aux services de ${abonnement.nom_service}, fournis par Subscr.\n\n`);
    doc.fontSize(11).text(`2. Date de souscription\nLa date de souscription au service est fixée au : ${dateDebut}\n\n`);
    doc.fontSize(11).text(`3. Durée de l'abonnement\nLe présent abonnement est conclu pour une durée de ${abonnement.duree} mois, à compter de la date de souscription.\n\n`);
    doc.fontSize(11).text(`4. Date de fin d'engagement\nLa fin d'engagement de l'abonnement est prévue pour le : ${dateFin}\n\n`);
    doc.fontSize(11).text(`5. Prix et conditions de paiement\nLe prix mensuel de l'abonnement est fixé à : ${abonnement.montant} € par mois.Le paiement sera effectué mensuellement, au début de chaque période de facturation.\n\n`);
    doc.fontSize(11).text('6. Conditions générales\nLes conditions générales des services fournis sont disponibles à l\'adresse suivante : des conditions générales\n\n');
    doc.fontSize(11).text('7. Résiliation\nLe client peut résilier son abonnement à tout moment avant la fin de la période d\'engagement en suivant les procédures de résiliation décrites dans les conditions générales.\n\n');

    // Ajouter la signature et le lieu
    const dateDuJour = new Date();
    const dateEnLettres = new Intl.DateTimeFormat('fr-FR', options).format(dateDuJour);

    // Signatures 
    const columnWidth = 200; 
    const signatureStartY = doc.y;

    doc.text(`Fait à ${utilisateur.ville}, le ${dateEnLettres}`, leftColumnX, signatureStartY, {
        width: columnWidth,
        align: 'left', 
    });

    doc.text(`Fait à ${abonnement.ville}, le ${dateEnLettres}`, rightColumnX, signatureStartY, {
        width: columnWidth,
        align: 'left', 
    });

    doc.moveDown(2);
    const signatureY = doc.y;

    doc.fontSize(11).text(`Signature du client :\n${utilisateur.civilite} ${utilisateur.nom} ${utilisateur.prenom}`, leftColumnX, signatureY, {
        width: columnWidth,
        align: 'left',
    });

    doc.fontSize(11).text('Signature de la société :\n Subscr\n Directeur général\n M. Dupont Jean', rightColumnX, signatureY, {
        width: columnWidth,
        align: 'left',
    });

    // Envoi du PDF à l'utilisateur
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=contrat_abonnement.pdf');
    doc.pipe(res);

    doc.end();
} 