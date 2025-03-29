const pool = require("../utils/db");

const Maintenance = {
  // Crear un nuevo mantenimiento
  createMaintenance: async (
    id_equipo,
    descripcion,
    fecha_entrada,
    fecha_salida
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
            VALUES (?, ?, ?, ?, 0)  // Estado inicial = 0 (pendiente)
        `;
    const [result] = await pool.execute(query, [
      id_equipo,
      descripcion,
      fecha_entrada,
      fecha_salida,
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
      if (filters.estado !== undefined) {
        query += ` AND m.estado = ?`;
        params.push(filters.estado);
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
      const query = "SELECT * FROM mantenimientos WHERE id_mantenimiento = ?";
      const [rows] = await pool.execute(query, [id]);
      return rows[0];
    } catch (error) {
      throw new Error("Error al obtener el mantenimiento: " + error.message);
    }
  },

  // Actualizar mantenimiento solo si el estado es 1 (en proceso)
  updateMaintenanceById: async (
    id_mantenimiento,
    { descripcion, fecha_entrada, fecha_salida }
  ) => {
    try {
      const query = `UPDATE mantenimientos 
                           SET descripcion = ?, fecha_entrada = ?, fecha_salida = ?
                           WHERE id_mantenimiento = ? AND estado = 1`; 
      const [result] = await pool.execute(query, [
        descripcion,
        fecha_entrada,
        fecha_salida,
        id_mantenimiento,
      ]);

      return result.affectedRows > 0;
    } catch (error) {
      throw new Error("Error al actualizar el mantenimiento: " + error.message);
    }
  },

  // Eliminar un mantenimiento (ponerlo como "pendiente")
  deleteMaintenance: async (id) => {
    const query =
      "UPDATE mantenimientos SET estado = 0 WHERE id_mantenimiento = ?"; // Cambia el estado a "pendiente" (0)
    const [result] = await pool.execute(query, [id]);
    return result;
  },

//   //REPORTES
//   //Obtener por fecha reporte estado
//   getMaintenanceByDate: async (req, res) => {
//     try {
//       const { startDate, endDate } = req.query;

//       if (!startDate || !endDate) {
//         return res.status(400).json({
//           message:
//             "Debe proporcionar un rango de fechas (startDate y endDate).",
//         });
//       }

//       const start = new Date(startDate);
//       const end = new Date(endDate);

//       const query = `
//         SELECT m.id_mantenimiento, e.descripcion AS equipo_descripcion, e.numero_serie AS equipo_numero_serie, 
//             m.descripcion, m.fecha_entrada, m.fecha_salida, m.estado 
//         FROM mantenimiento m
//         JOIN equipos e ON m.id_equipo = e.id_equipo
//         WHERE m.fecha_entrada BETWEEN ? AND ? 
//         AND m.estado = 2;  -- Solo mantenimientos completados
//     `;

//       const [maintenances] = await db.query(query, [start, end]);
//       console.log(maintenances);

//       if (!maintenances.length) {
//         return res.status(404).json({
//           message:
//             "No se encontraron mantenimientos completados en el rango de fechas proporcionado.",
//         });
//       }

//       res.json(maintenances); 
//     } catch (error) {
//       console.error("Error generando el reporte:", error);
//       res.status(500).json({
//         message: `Hubo un error generando el reporte. Detalles: ${error.message}`,
//       });
//     }
//   },

//   generateMaintenanceReportByType: async (req, res) => {
//     try {
//       const { tipoEquipo } = req.query;

//       if (!tipoEquipo) {
//         return res.status(400).json({
//           message:
//             "Debe proporcionar el tipo de equipo en la query (tipoEquipo).",
//         });
//       }

//       const query = `
//                 SELECT m.id_mantenimiento, e.descripcion AS equipo_descripcion, e.numero_serie AS equipo_numero_serie, 
//                        m.descripcion, m.fecha_entrada, m.fecha_salida, m.estado
//                 FROM mantenimiento m
//                 JOIN equipos e ON m.id_equipo = e.id
//                 WHERE e.descripcion = ?;
//             `;

//       const [maintenances] = await db.query(query, [tipoEquipo]);

//       if (!maintenances.length) {
//         return res.status(404).json({
//           message: `No se encontraron mantenimientos para el tipo de equipo: ${tipoEquipo}.`,
//         });
//       }

//       // Resto del código para generar el PDF...
//     } catch (error) {
//       console.error("Error generando el reporte:", error);
//       res.status(500).json({
//         message: `Hubo un error generando el reporte. Detalles: ${error.message}`,
//       });
//     }
//   },

//   generateGeneralMaintenanceReport: async (req, res) => {
//     try {
//       const query = `
//                 SELECT m.id_mantenimiento, e.descripcion AS equipo_descripcion, e.numero_serie AS equipo_numero_serie, 
//                        m.descripcion, m.fecha_entrada, m.fecha_salida, m.estado
//                 FROM mantenimiento m
//                 JOIN equipos e ON m.id_equipo = e.id;
//             `;

//       const [maintenances] = await db.query(query);

//       if (!maintenances.length) {
//         return res
//           .status(404)
//           .json({ message: "No se encontraron mantenimientos." });
//       }

//       // Resto del código para generar el PDF...
//     } catch (error) {
//       console.error("Error generando el reporte:", error);
//       res.status(500).json({
//         message: `Hubo un error generando el reporte. Detalles: ${error.message}`,
//       });
//     }
//   },
};
module.exports = Maintenance;
