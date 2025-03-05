// maintenanceService.js
const Maintenance = require('../models/maintenanceModel');
const pool = require('../utils/db');

// Obtener equipo por ID
exports.getEquipoById = async (id_equipo) => {
    const query = `SELECT estado FROM equipos WHERE id_equipo = ?`;  // Usa el nombre correcto de la columna
    const [result] = await pool.execute(query, [id_equipo]);
    return result[0];  // Retorna el estado del equipo
};

// Crear un mantenimiento
exports.createMaintenance = async (id_equipo, descripcion, fecha_entrada, fecha_salida) => {
    try {
        const query = `
            INSERT INTO mantenimientos (id_equipo, descripcion, fecha_entrada, fecha_salida) 
            VALUES (?, ?, ?, ?)
        `;
        const [result] = await pool.execute(query, [id_equipo, descripcion, fecha_entrada, fecha_salida]);

        if (result.affectedRows > 0) {
            return { id: result.insertId, id_equipo, descripcion, fecha_entrada, fecha_salida };
        } else {
            throw new Error("No se pudo insertar el mantenimiento");
        }
    } catch (error) {
        console.error("Error en createMaintenance:", error.message);
        throw error;
    }
};

// Obtener todos los mantenimientos
exports.getAllMaintenances = async () => {
    try {
      const query = `SELECT m.*, e.tipo AS equipo_descripcion, e.numero_serie
                     FROM mantenimientos m
                     INNER JOIN equipos e ON m.id_equipo = e.id_equipo`;
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      throw new Error('Error al obtener mantenimientos: ' + error.message);
    }
};

// Actualizar el mantenimiento
exports.getMaintenanceById = async (id_mantenimiento) => {
    try {
        return await Maintenance.getMaintenanceById(id_mantenimiento);
    } catch (error) {
        throw new Error('Error al obtener el mantenimiento: ' + error.message);
    }
};

// Actualizar mantenimiento por ID
exports.updateMaintenance = async (id_mantenimiento, data) => {
    try {
        const maintenance = await Maintenance.getMaintenanceById(id_mantenimiento);

        if (!maintenance) {
            throw new Error('Mantenimiento no encontrado');
        }

        const updated = await Maintenance.updateMaintenanceById(id_mantenimiento, data);
        
        if (!updated) {
            throw new Error('No se pudo actualizar el mantenimiento');
        }

        return updated;
    } catch (error) {
        throw new Error('Error al actualizar el mantenimiento: ' + error.message);
    }
};

//Obtener un mantenimiento por ID
exports.getMaintenanceById = async (id_mantenimiento) => {
    const query = "SELECT * FROM mantenimientos WHERE id_mantenimiento = ?";
    const [result] = await pool.execute(query, [id_mantenimiento]);
    return result.length > 0 ? result[0] : null;
};


//Eliminar o deshabilitar un mantenimiento
exports.deleteMaintenance=async(id)=>{
    try {
        
        const maintenance = await Maintenance.getMaintenanceById(id);
        if(!maintenance){
            throw new Error('Mantenimiento no encontrado');
        }
    
        await Maintenance.deleteMaintenance(id);
        return {message: 'Mantenimiento Eliminado'};
    } catch (error) {
        throw new Error(error.message);
    }
};








