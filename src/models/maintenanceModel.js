
const pool = require('../utils/db'); 

const Maintenance = {
    // Crear un nuevo mantenimiento
    createMaintenance: async (id_equipo, descripcion, fecha_entrada, fecha_salida) => {
        // Verificar si el equipo existe y si su estado es diferente de "0" (eliminado)
        const [maintenance] = await pool.execute('SELECT * FROM mantenimientos WHERE id_mantenimiento = ? AND estado != 0', [id_mantenimiento]);

        if (maintenance.length === 0) {
            throw new Error('El mantenimiento no existe o está eliminado.');
        }

        // Crear el mantenimiento
        const query = `
            INSERT INTO mantenimientos (id_equipo, descripcion, fecha_entrada, fecha_salida)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [id_equipo, descripcion, fecha_entrada, fecha_salida]);

        return result;
    },

    // Obtener mantenimientos por equipo
    getMaintenanceByEquipment: async (id_mantenimiento) => {
        const query = `
            SELECT m.*, e.descripcion AS equipo_descripcion
            FROM mantenimientos m
            INNER JOIN equipos e ON m.id_equipo = e.id
            WHERE m.id_equipo = ?
        `;
        const [result] = await pool.execute(query, [id_mantenimiento]);
        return result;
    },

    // Obtener el mantenimiento y su equipo
    getMaintenanceWithEquipment: async (id_mantenimiento) => {
        const query = `
            SELECT m.*, e.descripcion AS equipo_descripcion
            FROM mantenimientos m
            INNER JOIN equipos e ON m.id_equipo = e.id
            WHERE m.id_mantenimiento = ?
        `;
        const [result] = await pool.execute(query, [id_mantenimiento]);
        return result;
    },


    // Obtener mantenimiento por ID
    getMaintenanceById: async (id_mantenimiento) => {
        try {
            const query = 'SELECT * FROM mantenimientos WHERE id_mantenimiento = ?';
            const [rows] = await pool.execute(query, [id_mantenimiento]);
            return rows[0];
        } catch (error) {
            throw new Error('Error al obtener el mantenimiento: ' + error.message);
        }
    },
    
    // Actualizar mantenimiento solo si el estado es 1
    updateMaintenanceById: async (id_mantenimiento, { id_equipo, descripcion, fecha_entrada, fecha_salida }) => {
        try {
            const query = `UPDATE mantenimientos 
                           SET id_equipo = ?, descripcion = ?, fecha_entrada = ?, fecha_salida = ? 
                           WHERE id_mantenimiento = ? AND estado = 1`;
            const [result] = await pool.execute(query, [id_equipo, descripcion, fecha_entrada, fecha_salida, id_mantenimiento]);
            
            return result.affectedRows > 0;
        } catch (error) {
            throw new Error('Error al actualizar el mantenimiento: ' + error.message);
        }
    },

    //Eliminar un manteniiento
    deleteMaintenance: async (id) => {
        console.log(id)
        const query = 'UPDATE mantenimientos SET estado=0 WHERE id_mantenimiento = ?';
        const [result] = await pool.execute(query, [id]);
        return result;
    }
    
}
module.exports = Maintenance;
