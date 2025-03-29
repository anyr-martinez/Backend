// maintenanceService.js
const Maintenance = require("../models/maintenanceModel");
const Equipment = require("../models/equipmentModel");
const pool = require("../utils/db");
const { Op } = require("sequelize");

// Obtener equipo por ID
exports.getEquipoById = async (id_equipo) => {
  const query = `SELECT estado FROM equipos WHERE id_equipo = ?`; 
  const [result] = await pool.execute(query, [id_equipo]);
  return result[0]; // Retorna el estado del equipo
};

// Crear un mantenimiento
exports.createMaintenance = async (
  id_equipo,
  descripcion,
  fecha_entrada,
  fecha_salida
) => {
  try {
    const query = `
            INSERT INTO mantenimientos (id_equipo, descripcion, fecha_entrada, fecha_salida) 
            VALUES (?, ?, ?, ?)
        `;
    const [result] = await pool.execute(query, [
      id_equipo,
      descripcion,
      fecha_entrada,
      fecha_salida,
    ]);

    if (result.affectedRows > 0) {
      return {
        id: result.insertId,
        id_equipo,
        descripcion,
        fecha_entrada,
        fecha_salida,
      };
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
    const query = `
      SELECT m.*, 
             e.tipo AS equipo_descripcion, 
             e.numero_serie, 
             CASE 
                 WHEN m.estado = 0 THEN 'Pendiente'
                 WHEN m.estado = 1 THEN 'En proceso'
                 WHEN m.estado = 2 THEN 'Terminado'
                 ELSE 'Desconocido' 
             END AS estado_mantenimiento
      FROM mantenimientos m
      INNER JOIN equipos e ON m.id_equipo = e.id_equipo
    `;
    const [result] = await pool.execute(query);
    return result;
  } catch (error) {
    throw new Error("Error al obtener mantenimientos: " + error.message);
  }
};

// Obtener mantenimiento por ID
exports.getMaintenanceById = async (id) => {
  try {
      const query = `
          SELECT id_mantenimiento, id_equipo, descripcion, fecha_entrada, fecha_salida, 
              CASE 
                  WHEN estado = 0 THEN 'Pendiente'
                  WHEN estado = 1 THEN 'En Proceso'
                  WHEN estado = 2 THEN 'Terminado'
                  ELSE 'Estado desconocido'
              END AS estado
          FROM mantenimientos 
          WHERE id_mantenimiento = ?;
      `;
      const [rows] = await pool.execute(query, [id]);
      return rows.length > 0 ? rows[0] : null;
  } catch (error) {
      throw new Error("Error al obtener el mantenimiento: " + error.message);
  }
};



exports.updateMaintenance = async (id_mantenimiento, data) => {
  try {
    // Verificar si el mantenimiento existe
    const maintenance = await exports.getMaintenanceById(id_mantenimiento);

    if (!maintenance) {
      throw new Error("Mantenimiento no encontrado o inactivo");
    }

    // Ejecutar la actualización
    const updated = await Maintenance.updateMaintenanceById(
      id_mantenimiento,
      data
    );

    if (!updated) {
      throw new Error("No se pudo actualizar el mantenimiento");
    }

    return updated;
  } catch (error) {
    throw new Error("Error al actualizar el mantenimiento: " + error.message);
  }
};

//Obtener un mantenimiento por ID
exports.getMaintenanceById = async (id) => {
  const query = "SELECT * FROM mantenimientos WHERE id_mantenimiento = ?";
  const [result] = await pool.execute(query, [id]);
  return result.length > 0 ? result[0] : null;
};

//Eliminar o deshabilitar un mantenimiento
exports.deleteMaintenance = async (id) => {
  try {
    const maintenance = await Maintenance.getMaintenanceById(id);
    if (!maintenance) {
      throw new Error("Mantenimiento no encontrado");
    }

    await Maintenance.deleteMaintenance(id);
    return { message: "Mantenimiento Eliminado" };
  } catch (error) {
    throw new Error(error.message);
  }
};


//REPORTES
// Obtener mantenimientos por fecha y estado (pendiente, en proceso, o completado)
exports.getMaintenancesByDateAndState = async (startDate, endDate, estado = null) => {
  try {
      // Aquí generamos el filtro con los parámetros recibidos
      const filters = {
          startDate: startDate,
          endDate: endDate,
          estado: estado
      };

      // Llamamos a getAllMaintenances con los filtros
      return await Maintenance.getAllMaintenances(filters);
  } catch (error) {
      throw new Error('Error al obtener los mantenimientos por fecha y estado: ' + error.message);
  }
};

// Servicio para obtener mantenimientos por tipo de equipo y estado
exports.getMaintenanceReportByTypeAndStatus = async (tipoEquipo, estado) => {
  try {
      // Aquí generamos el filtro con los parámetros recibidos
      const filters = {
          tipo: tipoEquipo,
          estado: estado
      };

      // Llamamos a getAllMaintenances con los filtros
      return await Maintenance.getAllMaintenances(filters);
  } catch (error) {
      throw new Error('Error al obtener los mantenimientos por tipo de equipo y estado: ' + error.message);
  }
};


// Servicio para obtener mantenimientos por estado
exports.getGeneralMaintenanceReport = async (estado) => {
  try {
      return await Maintenance.getAllMaintenances({
          where: {
              estado: estado, // Filtrar por estado dinámico
          },
          include: [{
              model: Equipment,
              as: 'equipo',
              attributes: ['descripcion', 'numero_serie'],
          }]
      });
  } catch (error) {
      throw new Error('Error al obtener los mantenimientos generales: ' + error.message);
  }
};


