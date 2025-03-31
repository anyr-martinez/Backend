const pool = require("../utils/db");

const Maintenance = {
  // Crear un nuevo mantenimiento
  createMaintenance: async (
    id_equipo,
    descripcion,
    fecha_entrada,
    fecha_salida,
    estado = 0  
) => {
    // Verificar si el equipo existe y si su estado es diferente de "0" (eliminado)
    const [equipment] = await pool.execute(
      "SELECT * FROM equipos WHERE id_equipo = ? AND estado != 0",
      [id_equipo]
    );

    if (equipment.length === 0) {
      throw new Error("El equipo no existe o está eliminado.");
    }

    // Crear el mantenimiento
    const query = `
            INSERT INTO mantenimientos (id_equipo, descripcion, fecha_entrada, fecha_salida, estado)
            VALUES (?, ?, ?, ?, ?)
        `;
    const [result] = await pool.execute(query, [
      id_equipo,
      descripcion,
      fecha_entrada,
      fecha_salida,
      estado  
    ]);

    return result;
},



  // Obtener todos los mantenimientos
  getAllMaintenances: async (filters = {}) => {
    try {
      let query = `SELECT m.*, e.descripcion AS equipo_descripcion, e.numero_serie
                   FROM mantenimientos m
                   INNER JOIN equipos e ON m.id_equipo = e.id_equipo
                   WHERE 1=1`; // Para que los filtros sean opcionales
  
      const params = [];
  
      // Filtrar por estado si se proporciona
      if (filters.estado !== undefined && filters.estado !== null) {
        query += ` AND m.estado = ?`;
        params.push(Number(filters.estado)); // Asegurar que es un número
    }
    
  
      // Filtrar por fechas si se proporcionan
      if (filters.startDate && filters.endDate) {
        query += ` AND m.fecha_entrada BETWEEN ? AND ?`;
        params.push(filters.startDate, filters.endDate);
      }

       // Filtrar por tipo de equipo si se proporciona
       if (filters.tipo) {
        query += ` AND e.tipo = ?`;
        params.push(filters.tipo);
       }
  
      const [result] = await pool.execute(query, params);
      return result;
    } catch (error) {
      throw new Error("Error al obtener mantenimientos: " + error.message);
    }
  },
  

  // Obtener mantenimientos por equipo
  getMaintenanceByEquipment: async (id_equipo) => {
    const query = `
            SELECT m.*, e.descripcion AS equipo_descripcion
            FROM mantenimientos m
            INNER JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE m.id_equipo = ? AND e.estado = 1
        `;
    const [result] = await pool.execute(query, [id_equipo]);
    return result;
  },

  // Obtener el mantenimiento y su equipo
  getMaintenanceWithEquipment: async (id_mantenimiento) => {
    const query = `
            SELECT m.*, e.descripcion AS equipo_descripcion
            FROM mantenimientos m
            INNER JOIN equipos e ON m.id_equipo = e.id_equipo
            WHERE m.id_mantenimiento = ? AND e.estado = 1
        `;
    const [result] = await pool.execute(query, [id_mantenimiento]);
    return result;
  },
// Obtener mantenimiento por ID
getMaintenanceById: async (id) => {
  try {
    const query = "SELECT id_mantenimiento, descripcion, fecha_entrada, fecha_salida, estado, id_equipo FROM mantenimientos WHERE id_mantenimiento = ?";
    const [rows] = await pool.execute(query, [id]);
    return rows[0];
  } catch (error) {
    throw new Error("Error al obtener el mantenimiento: " + error.message);
  }
},

// Actualizar mantenimiento solo si el estado es 1 (en proceso) o 0 (pendiente)
updateMaintenanceById: async (id_mantenimiento, { descripcion, fecha_entrada, fecha_salida, id_equipo }) => {
  try {
    // Verificar si el mantenimiento está en estado 2 (completado), en cuyo caso no permitir la actualización
    const queryCheckState = "SELECT estado FROM mantenimientos WHERE id_mantenimiento = ?";
    const [rows] = await pool.execute(queryCheckState, [id_mantenimiento]);
    const maintenance = rows[0];

    if (maintenance.estado === 2) {
      throw new Error("No se puede actualizar el mantenimiento, ya está completado.");
    }

    // Realizar la actualización solo si el estado es 0 (Pendiente) o 1 (En Proceso)
    const query = `
      UPDATE mantenimientos 
      SET descripcion = ?, fecha_entrada = ?, fecha_salida = ?, id_equipo = ?
      WHERE id_mantenimiento = ? AND (estado = 0 OR estado = 1);
    `;
    const [result] = await pool.execute(query, [
      descripcion,
      fecha_entrada,
      fecha_salida,
      id_equipo,
      id_mantenimiento
    ]);

    return result.affectedRows > 0;
  } catch (error) {
    throw new Error("Error al actualizar el mantenimiento: " + error.message);
  }
},

  // Actualizar estado del mantenimiento
  updateMaintenanceStatus: async (id_mantenimiento, nuevoEstado) => {
  try {
    // Verificar que el mantenimiento existe
    const query = "SELECT * FROM mantenimientos WHERE id_mantenimiento = ?";
    const [rows] = await pool.execute(query, [id_mantenimiento]);

    if (rows.length === 0) {
      throw new Error("Mantenimiento no encontrado");
    }

    // Cambiar el estado del mantenimiento
    const updateQuery = "UPDATE mantenimientos SET estado = ? WHERE id_mantenimiento = ?";
    const [updateResult] = await pool.execute(updateQuery, [nuevoEstado, id_mantenimiento]);

    // Verificar si se actualizó
    if (updateResult.affectedRows === 0) {
      throw new Error("Error al actualizar el estado del mantenimiento");
    }

    return { success: true, message: "Estado actualizado correctamente" };
  } catch (error) {
    throw new Error("Error al actualizar el estado: " + error.message);
  }
},

  // Eliminar un mantenimiento (ponerlo como "pendiente")
  deleteMaintenance: async (id) => {
    const query =
      "UPDATE mantenimientos SET estado = 0 WHERE id_mantenimiento = ?"; // Cambia el estado a "pendiente" (0)
    const [result] = await pool.execute(query, [id]);
    return result;
  },
};
module.exports = Maintenance;
