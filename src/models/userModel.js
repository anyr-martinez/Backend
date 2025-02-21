const mysql = require('mysql2');
const pool = require('../utils/db'); 



const User = {
    // Crear un nuevo usuario
    register: async (nombre, usuario, contrasena) => {
        const query = 'INSERT INTO usuarios (nombre, usuario, contrasena) VALUES (?, ?, ?)';
        const [result] = await pool.execute(query, [nombre, usuario, contrasena]);
        return result;
    },
    
    // Obtener todos los usuarios
    getAllUsers: async () => {
        const query = 'SELECT id_usuario, nombre, usuario FROM usuarios WHERE estado=1';
        const [rows] = await pool.execute(query);
        return rows;
    },

    
    // Obtener un usuario por ID
    getUserById: async (id) => {
    const query = 'SELECT id_usuario, nombre, usuario, estado FROM usuarios WHERE id_usuario = ?';
    const [rows] = await pool.execute(query, [id]);  
    return rows[0];  
    },  

    //Obtener un usuario por Usuario
    getUserByuser: async (usuario) => {
        const query = 'SELECT * FROM usuarios WHERE usuario = ?';
        const [rows] = await pool.execute(query, [usuario]);
        return rows[0];
    },
    

    // Actualizar datos de un usuario
    updateUserbyId: async (id_usuario, nombre, usuario) => {
        if (!id_usuario || !nombre || !usuario) {
            throw new Error('Parámetros inválidos');
        }
        const query = 'UPDATE usuarios SET nombre = ?, usuario = ? WHERE id_usuario = ?';
        const [result] = await pool.execute(query, [nombre, usuario, id_usuario]);
        return result;
    },
    

    // Cambiar la contraseña de un usuario
    updatePassword: async (id, newPass) => {
    const query = 'UPDATE usuarios SET contrasena = ? WHERE id_usuario = ?';
    const [result] = await pool.execute(query, [newPass, id]);
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
