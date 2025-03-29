const maintenanceService = require('../services/maintenanceServices');
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

        // Crear el mantenimiento con estado inicial en 'Pendiente' (0)
        const result = await maintenanceService.createMaintenance(id_equipo, descripcion, fecha_entrada, fecha_salida, 0);

        res.status(201).json({
            message: "Mantenimiento creado exitosamente",
            data: result,
            equipo: equipo 
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
            include: [{
                model: Equipment
            }]
        });

        res.status(200).json({
            message: 'Mantenimientos obtenidos exitosamente',
            data: maintenances
        });
    } catch (error) {
        console.error("Error al obtener mantenimientos:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Obtener un mantenimiento por ID
const getMaintenanceById = async (req, res) => {
    try {
        const { id } = req.params;
        const maintenance = await maintenanceService.getMaintenanceById(id);

        if (!maintenance) {
            return res.status(404).json({ message: 'Mantenimiento no encontrado' });
        }

        // Aquí ya deberías recibir el estado formateado
        const { id_mantenimiento, id_equipo, descripcion, fecha_entrada, fecha_salida, estado } = maintenance;

        return res.status(200).json({
            message: 'Mantenimiento encontrado',
            maintenance: {
                id_mantenimiento,
                id_equipo,
                descripcion,
                fecha_entrada,
                fecha_salida,
                estado
            }
        });
    } catch (error) {
        console.error('Error al obtener el mantenimiento:', error);
        return res.status(500).json({ message: 'Error al obtener el mantenimiento' });
    }
};


// Actualizar un mantenimiento
const updateMaintenance = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { descripcion, fecha_entrada, fecha_salida } = req.body;

        if (!id) {
            return res.status(400).json({ message: "ID del mantenimiento es requerido" });
        }

        if (!descripcion || !fecha_entrada || !fecha_salida) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const maintenance = await maintenanceService.getMaintenanceById(id);

        if (!maintenance) {
            return res.status(404).json({ message: "Mantenimiento no encontrado" });
        }

        const updatedMaintenance = await maintenanceService.updateMaintenance(id, {
            descripcion,
            fecha_entrada,
            fecha_salida
        });

        if (!updatedMaintenance) {
            return res.status(500).json({ message: "No se pudo actualizar el mantenimiento" });
        }

        res.status(200).json({ message: "Mantenimiento actualizado exitosamente", data: updatedMaintenance });
    } catch (error) {
        console.error("Error al actualizar el mantenimiento:", error.message);
        next(error);
    }
};

// Actualizar estado de mantenimiento
const updateMaintenanceStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await maintenanceService.getMaintenanceById(id);
        if (!maintenance) {
            return res.status(404).json({ message: "Mantenimiento no encontrado" });
        }

        if (maintenance.estado === 0) {
            await maintenanceService.updateMaintenance(id, { estado: 2 });
            return res.status(200).json({ message: "Mantenimiento actualizado a Terminado" });
        }

        return res.status(400).json({ message: "El mantenimiento ya está en proceso o terminado" });
    } catch (error) {
        console.error("Error al actualizar el estado del mantenimiento:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

// Eliminar o deshabilitar un mantenimiento
const deleteMaintenance = async (req, res) => {
    try {
        const { id } = req.params;

        const maintenance = await maintenanceService.getMaintenanceById(id);
        if (!maintenance) {
            return res.status(404).json({ message: "Mantenimiento no encontrado" });
        }

        if (maintenance.estado === 2) {
            return res.status(400).json({ message: "El mantenimiento ya está terminado" });
        }

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
    getMaintenanceById,
    updateMaintenance,
    updateMaintenanceStatus,
    deleteMaintenance
};
