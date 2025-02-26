const equipmentService = require('../services/equipmentServices');


//Crear datos de un equipo nuevo ingresado
const createEquipment = async (req, res) => {
    try {
        console.log("Datos recibidos en la solicitud:", req.body); 

        const { descripcion, tipo, numero_serie, fecha_registro } = req.body;

        if (!descripcion || !tipo || !numero_serie || !fecha_registro) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        const result = await equipmentService.createEquipment(descripcion, tipo, numero_serie, fecha_registro);

        // Revisar si la inserción fue exitosa y devolver la respuesta adecuada
        if (result) {
            res.status(201).json({
                message: "Equipo creado exitosamente",
                data: result // Devolvemos todos los datos del equipo creado
            });
        } else {
            res.status(500).json({
                message: "Hubo un error al crear el equipo"
            });
        }
    } catch (error) {
        console.error("Error al crear el equipo:", error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.message });
    }
};

//Mostrar todos los equipos existentes
const getAllEquipments=async(req,res,next)=>{
    try{
        const equipments=await equipmentService.getAllEquipments();
        res.status(200).json({equipments})
    }catch(error){
        next(error);
    }

};

//Buscar el equipo por ID
const getEquipmentById = async (req, res) => {
    try {
        const { id } = req.params;
        const equipment = await equipmentService.getEquipmentById(id);

        if (!equipment) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Verificar si el equipo está deshabilitado (estado === 0)
        if (equipment.estado === 0) {
            return res.status(400).json({ message: 'Equipo deshabilitado' });
        }

        // Si el equipo está activo, lo mostramos
        return res.status(200).json({ message: 'Equipo activo', equipment });

    } catch (error) {
        console.error('Error al obtener el equipo:', error);
        return res.status(500).json({ message: 'Error al obtener el equipo' });
    }
};


//Actualizar datos de un equipo
const updateEquipment = async (req, res, next) => {
    try {
        const { id } = req.params; // El ID del equipo se toma de los parámetros de la ruta
        const { descripcion, tipo, numero_serie, fecha_registro } = req.body;

        console.log("ID recibido:", id);
        console.log("Datos recibidos:", req.body);

        // Verificar que todos los campos necesarios están presentes
        if (!id) {
            return res.status(400).json({ message: "El ID del equipo es obligatorio" });
        }
        if (!descripcion || !tipo || !numero_serie || !fecha_registro) {
            return res.status(400).json({
                message: "Los campos 'descripcion', 'tipo', 'numero_serie', 'fecha_registro' son obligatorios"
            });
        }

        // Verificar el estado del equipo
        const equipment = await equipmentService.getEquipmentById(id);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Verificar si el equipo está inhabilitado (estado === 0)
        if (equipment.estado === 0) {
            return res.status(400).json({ message: 'El equipo está inhabilitado y no puede ser actualizado' });
        }

        // Llamar al servicio para actualizar el equipo
        const updatedEquipment = await equipmentService.updateEquipment(id, {
            descripcion, tipo, numero_serie, fecha_registro
        });

        // Verificar si la actualización fue exitosa
        if (updatedEquipment) {
            return res.status(200).json({ message: "Equipo actualizado", data: updatedEquipment });
        } else {
            return res.status(500).json({ message: "Hubo un error al actualizar el equipo" });
        }
    } catch (error) {
        next(error);
    }
};


//Eliminar un equipo
const deleteEquipment = async (req, res, next) => {
    try {
        const { equipmentId } = req.body;  // El ID del equipo a eliminar

        // Verificar si el equipo existe
        const equipment = await equipmentService.getEquipmentById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        // Verificar si el equipo ya está inhabilitado (estado === 0)
        if (equipment.estado === 0) {
            return res.status(400).json({ message: 'El equipo ya está inhabilitado y no puede ser eliminado' });
        }

        // Llamar al servicio para eliminar el equipo
        const deletedEquipment = await equipmentService.deleteEquipment(equipmentId);

        // Respuesta exitosa
        res.status(200).json({ message: 'Equipo eliminado exitosamente', data: deletedEquipment });

    } catch (error) {
        next(error);
    }
}


module.exports={
    createEquipment,
    getAllEquipments,
    getEquipmentById,
    updateEquipment,
    deleteEquipment
}
