const jwt = require('jsonwebtoken');
const User = require('../models/userModel'); // Ajusta según tu modelo

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
        // Verifica el token y obtiene el id y el rol del usuario
        const { id, rol } = jwt.verify(token, process.env.JWT_SECRET);  
        console.log("ID del usuario decodificado:", id);
        console.log("Rol del usuario decodificado:", rol);

        // Verificar si el usuario existe
        const user = await User.getUserById(id);  

        if (!user) {
            return res.status(401).json({ msg: "Token No Valido - Usuario no existe" });
        }

        // Verificar si el usuario está activo
        if (!user.estado) {
            return res.status(401).json({ msg: "Token No Valido - Usuario estado False" });
        }

        // Asignar el usuario y el rol a la solicitud para usarlo en rutas protegidas
        req.user = user;
        req.rol = rol;

        next();
    } catch (error) {
        console.log("Error al verificar token:", error);
        res.status(401).json({ msg: "Token No Valido" });
    }
}

module.exports = { validarJWT };
