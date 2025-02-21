const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

const validarJWT = async (req, res, next) => {
    let token = req.header('Authorization'); // Usando let en lugar de const
    console.log('Token recibido:', token); // Para verificar qué token se recibe

    if (token && token.startsWith('Bearer ')) {
        token = token.split(' ')[1]; // Remueve 'Bearer ' del token
    }

    if (!token) {
        return res.status(401).json({
            msg: "No hay token"
        });
    }

    try {
        const { uid } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.getUserById(uid);

        if (!user) {
            return res.status(401).json({
                msg: "Token No Valido - Usuario no existe"
            });
        }

        // Verificar si el UID no esta en false
        if (!user.estado) {
            return res.status(401).json({
                msg: "Token No Valido - Usuario estado False"
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({
            msg: "Token No Valido"
        });
    }
}

module.exports = {
    validarJWT
}
