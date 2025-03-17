const pool = require('../utils/db');
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
        const query = `
            SELECT id_equipo, descripcion, tipo, numero_serie 
            FROM equipos 
            WHERE id_equipo = ? AND estado = 1
        `;
        const [rows] = await pool.execute(query, [id]);
        
        // Si la consulta devuelve un resultado, se devuelve la primera fila
        if (rows.length > 0) {
            return rows[0];  // Devolver el primer equipo encontrado
        } else {
            return null;  // Si no se encuentra, retornar null
        }
    } catch (error) {
        console.error('Error al obtener el equipo por ID:', error);
        throw error;
    }
};


// Actualizar el estado o la descripción de un equipo
exports.updateEquipment = async (id, data) => {
    try {
        // Verificar que todos los datos necesarios estén presentes
        if (!data.descripcion || !data.tipo || !data.numero_serie || !data.fecha_registro) {
            throw new Error('Faltan parámetros obligatorios');
        }

        // Obtener equipo por id
        const equipment = await Equipment.getEquipmentById(id);
        if (!equipment) {
            throw new Error('Equipo no encontrado');
        }

        // Llamar al modelo para hacer la actualización
        const updatedResult = await Equipment.updateEquipmentById(
            id,  // Pasar el id al modelo
            data.descripcion, 
            data.tipo, 
            data.numero_serie, 
            data.fecha_registro
        );

        // Si se actualizó al menos una fila, obtén los nuevos datos del equipo
        if (updatedResult.affectedRows > 0) {
            const updatedEquipment = await Equipment.getEquipmentById(id);
            return updatedEquipment;  // Devolver los datos actualizados del equipo
        } else {
            throw new Error('No se actualizó ninguna fila');
        }
    } catch (error) {
        console.error('Error al actualizar el equipo:', error.message);
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
        return {id, message: 'Equipo Eliminado'};
    } catch (error) {
        throw new Error(error.message);
    }
};
