const express = require('express');
const connectDB = require('./db/connection.js');
const utilisateurRoutes = require('./routes/utilisateurs.js');
const abonnementRoutes = require('./routes/abonnements.js');
const cors = require('cors');  

require('dotenv').config();

const app = express();

// Configurer CORS avec express
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); 
  next();
});

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
