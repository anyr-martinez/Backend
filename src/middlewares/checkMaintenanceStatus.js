const maintenanceService = require('../services/maintenanceServices');

const checkMaintenanceStatus = async (req, res, next) => {
    try {
        // Obtener el id del mantenimiento desde los parámetros
        const { id } = req.params;
        
        // Obtener el mantenimiento de la base de datos
        const mantenimiento = await maintenanceService.getMaintenanceById(id);

        // Si el mantenimiento no existe, retornar error 404
        if (!mantenimiento) {
            return res.status(404).json({ message: "Mantenimiento no encontrado" });
        }

        // Verificar si el mantenimiento está en estado terminado (estado 0)
        if (mantenimiento.estado === 0) {
            return res.status(400).json({ message: "No se puede modificar un mantenimiento que ya está terminado" });
        }

        // Si todo está bien, continuar con la siguiente operación
        next();
    } catch (error) {
        console.error("Error al verificar el estado del mantenimiento:", error.message);
        res.status(500).json({ message: "Error al verificar estado del mantenimiento", error: error.message });
    }
};

module.exports = checkMaintenanceStatus;
