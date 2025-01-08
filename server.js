const express = require('express');
const connectDB = require('./db/connection.js');
const utilisateurRoutes = require('./routes/utilisateurs.js');
const abonnementRoutes = require('./routes/abonnements.js');
const cors = require('cors');  

require('dotenv').config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', 
}));

app.use(express.json());

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/abonnements', abonnementRoutes);

// Démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
