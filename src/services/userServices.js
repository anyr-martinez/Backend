const User=require('../models/userModel');
const jwt = require('jsonwebtoken');
const config=require('../config/config');
const bcrypt=require('bcryptjs');
const pool = require('../utils/db');

//servicios de registro de usuario
exports.register = async (nombre, usuario, contrasena, rol) => {
    try {
        const existingUser = await User.getByUser(usuario);
        if (existingUser) {
            throw new Error('El usuario ya existe');
        }
        
        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash(contrasena, 12);

        // Crear usuario con rol
        const user = await User.register(nombre, usuario, hashedPassword, rol); // Asegúrate de incluir 'rol' en el método de la base de datos
        
        return { message: 'Usuario registrado con éxito', userId: user.insertId };
    } catch (error) {
        return { message: error.message };
    }
};

//servicio de logeo para usuario
exports.login = async (usuario, contrasena) => {
    try {
        const user = await User.getByUser(usuario);
        if (!user) {
            throw new Error("Usuario o contraseña incorrecto");
        }

        if (user.estado === 0) {
            throw new Error("El usuario está inactivo");
        }

        const isMatch = await bcrypt.compare(contrasena, user.contrasena);
        if (!isMatch) {
            throw new Error("Contraseña incorrecta");
        }

        // Generar el token JWT
        const token = jwt.sign(
            { id: user.id_usuario, usuario: user.usuario, rol: user.rol },  // Incluye el 'rol' en el token
            process.env.JWT_SECRET,
            { expiresIn: "4h" }
        );

        return {
            id: user.id_usuario,
            nombre: user.nombre,
            usuario: user.usuario,
            rol: user.rol,  // Incluye el rol en la respuesta
            token
        };
    } catch (error) {
        console.error("Error en login:", error.message);
        throw new Error(error.message);
    }
};


//Servicio para obtener todos los usuarios
 exports.getAllUsers = async() =>{
    const users = await User.getAllUsers();
  return users;
}

//Servicio para obtener usuario por usuario
exports.getByUser = async(usuario) =>{
    const user = await User.getByUser(usuario);
    return user;
}
// Servicio para obtener usuario por ID
exports.getUserById = async (id) => {
    return await User.getUserById(id);  
};

// Servicio para actualizar usuario
exports.updateUser = async (id_usuario, { nombre, usuario, rol }) => {
    try {
        if (!id_usuario) {
            throw new Error("El ID del usuario es obligatorio");
        }
        if (!nombre || !usuario || !rol) {
            throw new Error("Los campos 'nombre', 'usuario' y 'rol' son obligatorios");
        }

        console.log("Parámetros recibidos:", { id_usuario, nombre, usuario, rol });

        const query = 'UPDATE usuarios SET nombre = ?, usuario = ?, rol = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [nombre, usuario, rol, Number(id_usuario)]);

        if (result.affectedRows === 0) {
            throw new Error("No se pudo actualizar el usuario");
        }

        return { id_usuario, nombre, usuario, rol };
    } catch (error) {
        console.error("Error en updateUser:", error.message);
        throw error;
    }
};



//Servicio para cambiar contrasena
exports.updatePassword = async (id, newPass) => {
    try {
        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(newPass, 12);
        console.log("Contraseña encriptada:", hashedPassword);

        // Actualizar la contraseña en la base de datos
        const query = 'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [hashedPassword, id]);

        console.log("Resultado de la actualización:", result);

        if (result.affectedRows === 0) {
            throw new Error("No se pudo actualizar la contraseña. El Usuario no existe");
        }

        return { message: "Contraseña actualizada correctamente" };
    } catch (error) {
        console.error("Error en updatePassword:", error.message);
        throw error;  // Lanza el error para ser manejado por el controlador
    }
}

//Servicio para deshabilitar usuario
exports.deleteU = async (id) => {
    try {
        const user = await User.getUserById(id);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Realizar la eliminación sin llamar de nuevo a deleteU
        const query = 'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [id]);

        if (result.affectedRows === 0) {
            throw new Error('No se pudo eliminar el usuario');
        }

        return { message: 'Usuario eliminado correctamente' };
    } catch (error) {
        throw new Error(error.message);
    }
};


