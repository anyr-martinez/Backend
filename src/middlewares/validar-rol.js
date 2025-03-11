// Middleware para validar el rol
const validarRol = (rolesPermitidos) => {
    return (req, res, next) => {
        const { rol } = req.user; // Suponiendo que el rol está en el objeto `user` después de validar el JWT

        // Verifica si el rol del usuario está en los roles permitidos
        if (!rolesPermitidos.includes(rol)) {
            return res.status(403).json({ msg: "Acceso denegado - Rol no permitido" });
        }

        next();
    };
};

module.exports = { validarRol };
