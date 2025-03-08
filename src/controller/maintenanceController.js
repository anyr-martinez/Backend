const maintenanceService = require('../services/maintenanceServices');
const checkEquipoStatus = require('../middlewares/checkEquipoStatus');
const equipmentService = require ('../services/equipmentServices');
const { Equipment } = require('../models/equipmentModel');

// Crear un nuevo mantenimiento
const createMaintenance = async (req, res) => {
    try {
        console.log("Datos recibidos en la solicitud:", req.body);

        const { id_equipo, descripcion, fecha_entrada, fecha_salida } = req.body;

        if (!id_equipo || !descripcion || !fecha_entrada || !fecha_salida) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Validar si el equipo existe y está activo
        const equipo = await equipmentService.getEquipmentById(id_equipo);

        if (!equipo) {
            return res.status(404).json({ message: "El equipo no existe o está inactivo" });
        }

        // Si pasa la validación, se crea el mantenimiento
        const result = await maintenanceService.createMaintenance(id_equipo, descripcion, fecha_entrada, fecha_salida);

        res.status(201).json({
            message: "Mantenimiento creado exitosamente",
            data: result,
            equipo: equipo // Información del equipo incluida en la respuesta
        });
    } catch (error) {
        console.error("Error al crear mantenimiento:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Obtener todos los mantenimientos
const getAllMaintenances = async (req, res) => {
    try {
      const maintenances = await maintenanceService.getAllMaintenances({
        where: {
          estado: 1, 
        },
        include: [
          {
            model: Equipment,
            where: { estado: 1 }, 
          }
        ]
      });
  
      if (maintenances.length === 0) {
        return res.status(404).json({ message: 'No se encontraron mantenimientos con los criterios especificados' });
      }
  
      res.status(200).json({
        message: 'Mantenimientos obtenidos exitosamente',
        data: maintenances
      });
    } catch (error) {
      console.error("Error al obtener mantenimientos:", error.message);
      res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
  };
  

// Actualizar un mantenimiento
const updateMaintenance = async (req, res, next) => {
    try {
        // Obtener los datos de la solicitud
        const { id } = req.params;
        const { descripcion, fecha_entrada, fecha_salida } = req.body;

        // Verificar que el ID sea válido
        if (!id) {
            return res.status(400).json({ message: "ID del mantenimiento es requerido" });
        }
        console.log("ID recibido:", id);

        // Validar que los campos requeridos estén presentes
        if (!descripcion || !fecha_entrada || !fecha_salida) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Obtener el mantenimiento antes de actualizar
        const maintenance = await maintenanceService.getMaintenanceById(id);
        console.log("Mantenimiento encontrado antes de actualizar:", maintenance);

        if (!maintenance) {
            return res.status(404).json({ message: "Mantenimiento no encontrado o inactivo" });
        }

        // Actualizar el mantenimiento
        const updatedMaintenance = await maintenanceService.updateMaintenance(id, {
            descripcion,
            fecha_entrada,
            fecha_salida
        });

        // Verificar si la actualización se realizó correctamente
        if (!updatedMaintenance) {
            return res.status(500).json({ message: "No se pudo actualizar el mantenimiento" });
        }

        res.status(200).json({ message: "Mantenimiento actualizado exitosamente", data: updatedMaintenance });
    } catch (error) {
        console.error("Error al actualizar el mantenimiento:", error.message);
        next(error);
    }
};




//Obtener un Mantenimiento por ID 
const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const maintenance = await maintenanceService.getMaintenanceById(id);

        if (!maintenance) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado' });
        }

        // Verificar si el mantenimiento está deshabilitado (estado === 0)
        if (maintenance.estado === 0) {
            return res.status(400).json({ message: 'Mantenimiento deshabilitado' });
        }

        // Si el mantenimiento está activo, lo mostramos
        return res.status(200).json({ message: 'Mantenimiento activo', maintenance });

    } catch (error) {
        console.error('Error al obtener el mantenimiento:', error);
        return res.status(500).json({ message: 'Error al obtener el mantenimiento' });
    }
};


//Eliminar o deshabilitar un mantenimiento
const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el mantenimiento existe y su estado
        const maintenance = await maintenanceService.getMaintenanceById(id);
        if (!maintenance) {
            return res.status(404).json({ message: "Mantenimiento no encontrado" });
        }

        // Verificar si el mantenimiento ya está inhabilitado
        if (maintenance.estado === 0) {
            return res.status(400).json({ message: "El mantenimiento ya está terminado" });
        }

        // Deshabilitar el mantenimiento
        await maintenanceService.deleteMaintenance(id);

        res.status(200).json({
            message: "Mantenimiento eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error al inhabilitar el mantenimiento:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

module.exports = {
    createMaintenance,
    getAllMaintenances,
    updateMaintenance,
    getMaintenanceById,
    deleteMaintenance
};
