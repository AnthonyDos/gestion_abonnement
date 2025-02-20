const mongoose = require('mongoose');

// const connectDB = () => {
//   return mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('Connexion à MongoDB réussie'))
//     .catch((error) => console.error('Erreur de connexion à MongoDB:', error));
// };

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion à MongoDB réussie');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
  }
};

module.exports = connectDB;

