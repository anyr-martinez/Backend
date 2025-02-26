const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const validarJWT = async (req, res, next) => {
    let token = req.header('Authorization');
    console.log('Token recibido:', token);

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ msg: "No hay token" });
    }

    try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);  
        console.log("ID del usuario decodificado:", id);

        const user = await User.getUserById(id);  

        if (!user) {
            return res.status(401).json({ msg: "Token No Valido - Usuario no existe" });
        }

        if (!user.estado) {
            return res.status(401).json({ msg: "Token No Valido - Usuario estado False" });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log("Error al verificar token:", error);
        res.status(401).json({ msg: "Token No Valido" });
    }
}

module.exports = { validarJWT };
