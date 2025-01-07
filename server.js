const express = require('express');
const connectDB = require('./db/connection.js');
const utilisateurRoutes = require('./routes/utilisateurs.js');
const abonnementRoutes = require('./routes/abonnements.js');

require('dotenv').config();

const app = express();
app.use(express.json());

// Connexion à la base de données
connectDB();

// Routes
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/abonnements', abonnementRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Hello from Express!');
});
// Démarrage du serveur
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
