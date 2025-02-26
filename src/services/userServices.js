const User=require('../models/userModel');
const jwt = require('jsonwebtoken');
const config=require('../config/config');
const bcrypt=require('bcryptjs');
const pool = require('../utils/db');

//servicios de registro de usuario
exports.register=async(nombre,usuario,contrasena)=>{
    try{
        const existingUser=await User.getUserByuser (usuario);
        if(existingUser){
            throw new Error('El usuario ya existe');
        }
        const hashedPassword = await bcrypt.hash(contrasena, 12);
        // const user = new User(nombre, usuario, hashedPassword);
        const user=await User.register(nombre,usuario,hashedPassword);
       
        return { message: 'Usuario registrado con éxito', userId: user.insertId };
    }catch(error){
        return {message: error.message}
    }
}

//servicio de logeo para usuario
exports.login = async (usuario, contrasena) => {
  try {
      const user = await User.getUserByuser(usuario);
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

      const token = jwt.sign(
          { id: user.id_usuario, usuario: user.usuario },  // 🔹 Usar id_usuario
          process.env.JWT_SECRET,
          { expiresIn: "4h" }
      );

      return {
          id: user.id_usuario,
          nombre: user.nombre,
          usuario: user.usuario,
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

// Servicio para obtener usuario por ID
exports.getUserById = async (id) => {
    return await User.getUserById(id);  
};

// Servicio para actualizar usuario
exports.updateUser = async (id_usuario, { nombre, usuario }) => {
    if (!id_usuario) {
        throw new Error("El ID del usuario es obligatorio");
    }
    if (!nombre || !usuario) {
        throw new Error("Los campos 'nombre' y 'usuario' son obligatorios");
    }

    console.log("Parámetros recibidos:", { id_usuario, nombre, usuario });

    const query = 'UPDATE usuarios SET nombre = ?, usuario = ? WHERE id_usuario = ?';
    await pool.execute(query, [nombre || null, usuario || null, Number(id_usuario)]);
    
    return { id_usuario, nombre, usuario };
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


