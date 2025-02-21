const maintenanceService = require('../services/maintenanceServices');

const checkEquipoStatus = async (req, res, next) => {
    try {
        const { id_equipo } = req.body;

        // Verificar el estado del equipo en la base de datos
        const equipo = await maintenanceService.getEquipoById(id_equipo);  
        if (!equipo) {
            return res.status(404).json({ message: "Equipo no encontrado" });
        }

        if (equipo.estado === 0) {
            return res.status(400).json({ message: "El equipo está inhabilitado y no se puede asignar a mantenimiento" });
        }

        // Si todo está bien, continuar con el siguiente middleware o controlador
        next();
    } catch (error) {
        console.error("Error al verificar estado del equipo:", error.message);
        res.status(500).json({ message: "Error al verificar estado del equipo", error: error.message });
    }
};

module.exports = checkEquipoStatus;
