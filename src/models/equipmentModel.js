const mysql = require('mysql2');
const pool = require('../utils/db'); 

const Equipment = {
    // Crear un nuevo equipo
    createEquipment: async (descripcion, tipo, numero_serie, fecha_registro) => {
        console.log("Parámetros recibidos en el modelo:", descripcion, tipo, numero_serie, fecha_registro);
    
        // Verificación de parámetros
        if (!descripcion || !tipo || !numero_serie || !fecha_registro) {
            throw new Error("Faltan parámetros obligatorios");
        }
    
        // Consulta para insertar el equipo
        const query = 'INSERT INTO equipos (descripcion, tipo, numero_serie, fecha_registro) VALUES (?, ?, ?, ?)';
        const [result] = await pool.execute(query, [descripcion, tipo, numero_serie, fecha_registro]);
    
        // Verificar que la inserción haya sido exitosa
        if (result.affectedRows === 1) {
            // Devolver los datos completos del equipo insertado
            return {
                id_equipo: result.insertId, // ID generado automáticamente
                descripcion,
                tipo,
                numero_serie,
                fecha_registro
            };
        } else {
            throw new Error("No se pudo crear el equipo");
        }
    },
    
    

    // Obtener todos los equipos
    getAllEquipments: async () => {
        const query = 'SELECT id_equipo, descripcion, tipo, numero_serie, fecha_registro, estado FROM equipos';
        const [rows] = await pool.execute(query);
        return rows;
    },

    // Obtener un equipo por ID
    getEquipmentById: async (id) => {
        const query = 'SELECT * FROM equipos WHERE id_equipo= ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0];
    },

    // Actualizar datos de un equipo
    updateEquipmentById: async (id, descripcion, tipo, numero_serie, fecha_registro) => {
        if (!id || !descripcion || !tipo || !numero_serie || !fecha_registro) {
            throw new Error('Parámetros inválidos');
        }
    
        // El query de actualización debe pasar correctamente los valores
        const query = 'UPDATE equipos SET descripcion = ?, tipo = ?, numero_serie = ?, fecha_registro = ? WHERE id_equipo = ?';
        const [result] = await pool.execute(query, [descripcion, tipo, numero_serie, fecha_registro, id]);  // Usar 'id' en lugar de 'id_equipo'
        return result;
    },
    



    // Eliminar un equipo (en lugar de eliminar, actualizamos el estado)
    deleteEquipment: async (id) => {
        console.log(id)
        const query = 'UPDATE equipos SET estado=0 WHERE id_equipo = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
    }

    
};



module.exports = Equipment;
