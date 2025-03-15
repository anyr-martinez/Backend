const mysql = require('mysql2');
const pool = require('../utils/db'); 



const User = {
    // Crear un nuevo usuario
    register: async (nombre, usuario, contrasena, rol) => {
        const query = 'INSERT INTO usuarios (nombre, usuario, contrasena, rol) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [nombre, usuario, contrasena, rol]);
        return result;
    },

    
    // Obtener todos los usuarios
    getAllUsers: async () => {
        const query = 'SELECT id_usuario, nombre, usuario, rol FROM usuarios WHERE estado=1';
        const [rows] = await pool.execute(query);
        return rows;
    },

    
    // Obtener un usuario por ID
    getUserById: async (id) => {
        const query = 'SELECT id_usuario, nombre, usuario, rol, estado FROM usuarios WHERE id_usuario = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    },


    // Obtener un usuario por Usuario
    getByUser: async (usuario) => {
        const query = 'SELECT id_usuario, nombre, usuario, contrasena, rol, estado FROM usuarios WHERE BINARY usuario = ?';
        const [rows] = await pool.execute(query, [usuario]);
        return rows[0];
    },

    

    // Actualizar datos de un usuario
    updateUserbyId: async (id_usuario, nombre, usuario, rol) => {
        if (!id_usuario || !nombre || !usuario || !rol) {
            throw new Error('Parámetros inválidos');
        }
        const query = 'UPDATE usuarios SET nombre = ?, usuario = ?, rol = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [nombre, usuario, rol, id_usuario]);
        return result;
    },

    

    // Cambiar la contraseña de un usuario
    updatePassword: async (id, contrasena) => {
    const query = 'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?';
    const [result] = await pool.execute(query, [contrasena, id]);
    return result;
    },

    // Eliminar un usuario
    deleteU: async (id) => {
        const query = 'UPDATE usuarios SET estado = 0 WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
      }
      
};

module.exports = User;
