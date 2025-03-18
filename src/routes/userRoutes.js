const express = require('express');
const router=express.Router();
const userController = require('../controller/userController');
const {validarJWT} = require('../middlewares/validar-jwt');
const {validarCampos} = require('../middlewares/validar-campos');

//rutas de logeo
/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: El nombre del usuario
 *               usuario:
 *                 type: string
 *                 description: El nombre de usuario único
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario
 *               rol:
 *                 type: string
 *                 description: El rol del usuario (por ejemplo, 'admin' o 'usuario')
 *                  
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: Error en el registro
 */
router.post('/register', userController.registro);

//Documentacion de logeo de Usuario
/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Logear un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuario:
 *                 type: string
 *                 description: El nombre de usuario único
 *               contrasena:
 *                 type: string
 *                 description: La contraseña del usuario
 *     responses:
 *       200:
 *         description: Usuario logeado correctamente
 *       400:
 *         description: Error en el Login
 */
router.post('/login', validarCampos, userController.login);

//Documentacion de Actualizacion de usuario
/**
 * @swagger
 * /api/users/updateUser/{id} :
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar datos de un usuario
 *     description: Actualiza el nombre, el usuario y el rol de un usuario específico.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario a actualizar
 *         schema:
 *           type: integer
 *           example: 0
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: "Nuevo Nombre"
 *               usuario:
 *                 type: string
 *                 example: "nuevo_usuario"
 *               rol:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario actualizado"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     nombre:
 *                       type: string
 *                       example: "Nuevo Nombre"
 *                     usuario:
 *                       type: string
 *                       example: "nuevo_usuario"
 *                     rol:
 *                       type: string
 *                       example: "admin o usuario"
 *       400:
 *         description: Error en la solicitud (por ejemplo, usuario eliminado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario está eliminado o deshabilitado"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.put('/updateUser/:id', validarJWT, userController.updateUser);

//Docuemtacion de la actualizaion de contrasena
/**
 * @swagger
 * /api/users/updatePassword/{id}:
 *   put:
 *     tags:
 *       - Usuarios
 *     summary: Actualizar contrasena de un usuario
 *     description: Actualiza la contrasena de un usuario específico.
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID del usuario 
 *         schema:
 *           type: integer
 *           
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contrasena:
 *                 type: string
 *                       
 *     responses:
 *       200:
 *         description: Contrasena actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Contrasena actualizada"
 *                 usuario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 123
 *                     contrasena:
 *                       type: string
 *                       example: "Nueva Contrasena"
 *                    
 *       400:
 *         description: Error en la solicitud (por ejemplo, usuario eliminado)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "El usuario está eliminado o deshabilitado"
 *       404:
 *         description: Usuario no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Usuario no encontrado"
 *       500:
 *         description: Error interno del servidor
 */
router.put('/updatePassword/:id', validarCampos, validarJWT,userController.updatePassword);


//Documentacion de mostrar los usuarios existentes
/**
 * @swagger
 * /api/users/user:
 *   get:
 *     summary: Obtener usuarios activos
 *     description: Obtiene una lista de todos los usuarios activos registrados en la base de datos.
 *     tags:
 *       - Usuarios
 *     responses:
 *       200:
 *         description: Lista de usuarios activos en el sistema.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del usuario.
 *                   name:
 *                     type: string
 *                     description: Nombre completo del usuario.
 *                   usuario:
 *                     type: string
 *                     description: Nombre de usuario único para el login.
 *                   rol:
 *                     type: string
 *                     description: Rol que tiene el usuario.
 *       400:
 *         description: Error en la solicitud.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No hay usuarios activos disponibles"
 *       401:
 *         description: No autorizado. El usuario no tiene permisos para acceder a esta ruta.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/user', userController.getAllUsers);

//Documentacion para obtener usuario por ID
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Obtener el estado de un usuario
 *     description: Obtiene si un usuario está activo o no basado en el estado (estado = 1).
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID único del usuario.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Estado del usuario (activo o no activo).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Estado del usuario (activo o no activo).
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombre:
 *                       type: string
 *                     usuario:
 *                       type: string
 *       400:
 *         description: El parámetro ID es requerido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/:id', userController.getUserById);


// Documentación para obtener usuario por nombre de usuario
/**
 * @swagger
 * /api/users/users/{usuario}:
 *   get:
 *     summary: Obtener los detalles de un usuario por nombre de usuario
 *     description: Obtiene los detalles de un usuario, incluyendo su estado, basado en el nombre de usuario.
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - name: usuario
 *         in: path
 *         required: true
 *         description: Nombre de usuario único para buscar el usuario.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalles del usuario si está activo.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Estado del usuario (activo o inactivo).
 *                 user:
 *                   type: object
 *                   properties:
 *                     id_usuario:
 *                       type: integer
 *                     usuario:
 *                       type: string
 *                     nombre:
 *                       type: string
 *                     estado:
 *                       type: integer
 *       400:
 *         description: El parámetro `username` es requerido.
 *       404:
 *         description: Usuario no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.get('/users/:usuario', userController.getByUser);

//Documentacion de eliminar o inhabilitar un usuario
/**
 * @swagger
 * /api/users/deleteUser/{id}:
 *   delete:
 *     summary: 'Eliminar un usuario activo'
 *     description: 'Permite eliminar un usuario activo (marcarlo como eliminado en la base de datos).'
 *     tags:
 *       - Usuarios
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID del usuario a eliminar'
 *         schema:
 *           type: 'integer'
 *           example: 
 *     responses:
 *       200:
 *         description: 'Usuario eliminado correctamente'
 *         content:
 *           'application/json':
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Usuario eliminado correctamente'
 *       400:
 *         description: 'El usuario ya está eliminado'
 *         content:
 *           'application/json':
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'El usuario ya está eliminado'
 *       404:
 *         description: 'Usuario no encontrado'
 *         content:
 *           'application/json':
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Usuario no encontrado'
 *       500:
 *         description: 'Error interno del servidor'
 */
router.delete('/deleteUser/:id',validarJWT, userController.deleteU);




module.exports=router;