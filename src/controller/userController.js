const userService=require('../services/userServices');


// Crear Usuario
const registro = async (req, res) => {
    try {
        // Obtén los datos del cuerpo de la solicitud
        const { nombre, usuario, contrasena } = req.body;

        // Verifica si los datos están presentes
        if (!nombre || !usuario || !contrasena) {
            return res.status(400).json({ error: 'Todos los campos son necesarios' });
        }

        // Llama a la función del servicio para crear el usuario
        const result = await userService.register(nombre, usuario, contrasena);

        // Si la creación fue exitosa, retorna la respuesta con el resultado
        console.log(result);
        res.status(201).json({
            message: result.message,
            userId: result.insertId, 
        });

        console.log(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear el usuario' });
    }
}


//Registro de Usuario
// const registro=async(req,res, next) => {
//     try{
//         const{nombre,usuario,contrasena}=req.body;
//         const user=await userService.register(nombre,usuario,contrasena);
//         res.status(200).json(user);
//     }catch(error){
//         next({error});
//     }
// }


//Logeo de Usuario
const login = async (req, res, next) => {
    try {
      const { usuario, contrasena } = req.body;
      const data = await userService.login(usuario, contrasena);
      //console.log("Token generado:", token);
  
      res.status(200).json({
        data
      });
      
    } catch (error) {
      console.error("Error al iniciar sesión:", error.message);
      res.status(401).json({ message: error.message });
    }
  }; 
  

//Actualizar Usuario
const updateUser = async (req, res, next) => {
    try {
        console.log("ID recibido:", req.params.id);
        console.log("Datos recibidos:", req.body);

        const { id} = req.params;
        const { nombre, usuario } = req.body;

        if (!id) {
            return res.status(400).json({ message: "El ID del usuario es obligatorio" });
        }

        if (!nombre || !usuario) {
            return res.status(400).json({ message: "Los campos 'nombre' y 'usuario' son obligatorios" });
        }
          // Verificar si el usuario existe
        const user = await userService.getUserById(id);  // Asegúrate de tener este método en tu servicio
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
  
          // Verificar si el usuario está eliminado o deshabilitado
        if (user.estado === 0) {
            return res.status(400).json({ message: 'El usuario está eliminado o deshabilitado' });
        }
        const userUpdated = await userService.updateUser(id, { nombre, usuario });

        res.status(200).json({ message: "Usuario actualizado", usuario: userUpdated });
    } catch (error) {
        next(error);
    }
}

//Actualizar Contrasena 
const updatePassword = async (req, res, next) => {
    try {
        // Obtener el ID del usuario desde los parámetros de la URL
        const { id } = req.params;
        
        // Obtener la nueva contraseña desde el cuerpo de la solicitud
        const { newPass } = req.body;

        // Verificar que ambos parámetros estén presentes
        if (!id || !newPass) {
            return res.status(400).json({ message: "El ID del usuario y la nueva contraseña son obligatorios" });
        }
        // Verificar si el usuario existe
        const user = await userService.getUserById(id);  // Asegúrate de tener este método en tu servicio
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
  
          // Verificar si el usuario está eliminado o deshabilitado
        if (user.estado === 0) {
            return res.status(400).json({ message: 'El usuario está eliminado o deshabilitado' });
        }
        // Llamar al servicio para actualizar la contraseña
        const updatedPass = await userService.updatePassword(id, newPass);

        // Enviar la respuesta si la contraseña fue actualizada
        res.status(200).json(updatedPass);
    } catch (error) {
        next(error); // Capturar y pasar el error al middleware de manejo de errores
    }
};

//Mostrar todos los usuarios existentes
const Alluser = async (req, res, next) => {
    try {
        const users = await userService.getAllUsers();
        res.status(200).json({ users });
    } catch (error) {
        next(error);
    }
};


// Controlador para obtener un usuario por su ID y verificar si está activo
const getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;  // Obtener el ID desde la URL

        // Verificar que el ID sea proporcionado
        if (!id) {
            return res.status(400).json({ message: "El parámetro ID es requerido" });
        }

        // Llamar al servicio para obtener el usuario por ID
        const user = await userService.getUserById(id);

        // Verificar si el usuario existe
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar el estado del usuario (si está activo o no)
        if (user.estado === 1) {
            return res.status(200).json({ message: "Usuario activo", user });
        } else {
            return res.status(200).json({ message: "Usuario no activo" });
        }
    } catch (error) {
        next(error);  // Manejo de errores
    }
};


//Eliminar Usuario
const deleteU = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      // Verificar si el usuario existe
      const user = await userService.getUserById(id);  
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
  
      // Verificar si el usuario ya está eliminado
      if (user.estado === 0) {
        return res.status(400).json({ message: 'El usuario ya está eliminado' });
      }
  
      // Realizar la eliminación (actualizando el estado a 0, por ejemplo)
      await userService.deleteU(id);  
        return res.status(200).json({ message: 'Usuario eliminado correctamente' });
      
    } catch (error) {
      next(error);
    }
  };
  

module.exports={
    registro,
    login,
    updateUser,
    updatePassword,
    deleteU,
    Alluser,
    getUserById
};





   