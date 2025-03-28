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
    const query = `SELECT m.*, e.tipo AS equipo_descripcion, e.numero_serie
                       FROM mantenimientos m
                       INNER JOIN equipos e ON m.id_equipo = e.id_equipo
                       WHERE m.estado = 1 AND e.estado = 1`; // Filtrar por estado = 1 en ambas tablas
    const [result] = await pool.execute(query);
    return result;
  } catch (error) {
    throw new Error("Error al obtener mantenimientos: " + error.message);
  }
};

// Actualizar el mantenimiento
exports.getMaintenanceById = async (id) => {
  try {
    const query = `SELECT * FROM mantenimientos WHERE id_mantenimiento = ? AND estado = 1`;
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

//Obtener mantenimiento por fecha
exports.getMaintenancesByDate = async (startDate, endDate) => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.descripcion AS equipo_descripcion, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE 
                (m.fecha_entrada <= ? AND (m.fecha_salida >= ? OR m.fecha_salida IS NULL))
                AND m.estado = 1
                AND e.estado = 1;
        `;

    const [rows] = await pool.execute(query, [endDate, startDate]);

    return rows;
  } catch (error) {
    throw new Error(
      "Error al obtener mantenimientos por fecha: " + error.message
    );
  }
};

// Obtener mantenimientos por tipo de equipo
exports.getMaintenancesByEquipmentType = async (tipoEquipo) => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.tipo AS equipo_tipo, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE 
                m.estado = 1
                AND e.estado = 1
                AND e.tipo = ?;
        `;

    const [rows] = await pool.execute(query, [tipoEquipo]);

    return rows;
  } catch (error) {
    throw new Error(
      "Error al obtener mantenimientos por fecha: " + error.message
    );
  }
};

// Reporte General
exports.getMaintenancesReport = async () => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.descripcion AS equipo_descripcion, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida, 
                m.estado 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE m.estado = 1 AND e.estado = 1;
        `;
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    throw new Error("Error al obtener mantenimientos: " + error.message);
  }
};

//REPORTES INACTIVOS EN ESTADO 0
exports.getMaintenancesByDateInactive = async (startDate, endDate) => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.descripcion AS equipo_descripcion, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE 
                (m.fecha_entrada <= ? AND (m.fecha_salida >= ? OR m.fecha_salida IS NULL))
                AND m.estado = 0;
        `;

    const [rows] = await pool.execute(query, [endDate, startDate]);

    return rows;
  } catch (error) {
    throw new Error(
      "Error al obtener mantenimientos por fecha: " + error.message
    );
  }
};

exports.getMaintenancesByEquipmentTypeInactive = async (tipoEquipo) => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.tipo AS equipo_tipo, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE 
                m.estado = 0
                AND e.tipo = ?;

        `;

    const [rows] = await pool.execute(query, [tipoEquipo]);

    return rows;
  } catch (error) {
    throw new Error(
      "Error al obtener mantenimientos por fecha: " + error.message
    );
  }
};

exports.getMaintenancesReportInactive = async () => {
  try {
    const query = `
            SELECT 
                m.id_mantenimiento, 
                e.descripcion AS equipo_descripcion, 
                e.numero_serie AS equipo_numero_serie, 
                m.descripcion, 
                m.fecha_entrada, 
                m.fecha_salida, 
                m.estado 
            FROM mantenimientos m
            LEFT JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE m.estado = 0;
        `;
    const [rows] = await pool.execute(query);
    return rows;
  } catch (error) {
    throw new Error("Error al obtener mantenimientos: " + error.message);
  }
};
