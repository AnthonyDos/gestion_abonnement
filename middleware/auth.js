const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = async (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]; 
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const id_user = decodedToken.utilisateurId
        
        if(parseInt(req.params.id) && parseInt(req.params.id) !== id_user ){
            throw 'User id non valide ! '   
        } else {  
            next()
        }
    }catch (error) {
        res.status(401).json({ error: error , message: 'Requête non authentifiée !'});   
    } 
};