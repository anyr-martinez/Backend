
const Equipment = require('../models/equipmentModel');

// Crear un nuevo equipo
exports.createEquipment = async (descripcion, tipo, numero_serie, fecha_registro) => {
    console.log("Datos enviados al modelo:", descripcion, tipo, numero_serie, fecha_registro); 
    if (!descripcion || !tipo || !numero_serie || !fecha_registro) {
        throw new Error("Faltan parámetros obligatorios");
    }
    return await Equipment.createEquipment(descripcion, tipo, numero_serie, fecha_registro);
};


// Obtener todos los equipos
exports.getAllEquipments = async () => {
    try {
        const equipments = await Equipment.getAllEquipments();
        return equipments;
    } catch (error) {
        console.error('Error al obtener los equipos:', error);
        throw error;
    }
};

// Obtener un equipo por ID
exports.getEquipmentById = async (id) => {
    try {
        const equipment = await Equipment.getEquipmentById(id);
        return equipment;
    } catch (error) {
        console.error('Error al obtener el equipo por ID:', error);
        throw error;
    }
};

// Actualizar el estado o la descripción de un equipo
exports.updateEquipment = async (id, data) => {
    try {
        // Obtener equipo por id
        const equipment = await Equipment.getEquipmentById(id);
        if (equipment) {
            // Pasar los datos al modelo para hacer la actualización
            const updatedEquipment = await Equipment.updateEquipmentById(id, 
                data.descripcion, 
                data.tipo, 
                data.numero_serie, 
                data.fecha_registro, 
            
            );
            return updatedEquipment;
        } else {
            throw new Error('Equipo no encontrado');
        }
    } catch (error) {
        console.error('Error al actualizar el equipo:', error);
        throw error;
    }
};


// Eliminar un equipo
exports.deleteEquipment=async(id)=>{
    try {
        
        const equipment = await Equipment.getEquipmentById(id);
        if(!equipment){
            throw new Error('Equipo no encontrado');
        }
    
        await Equipment.deleteEquipment(id);
        return {message: 'Equipo Eliminado'};
    } catch (error) {
        throw new Error(error.message);
    }
};
