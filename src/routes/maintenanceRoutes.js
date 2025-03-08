const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenanceController');
const checkEquipoStatus = require('../middlewares/checkEquipoStatus');
const checkMaintenanceStatus = require('../middlewares/checkMaintenanceStatus');
const {validarJWT} = require('../middlewares/validar-jwt');
const {validarCampos} = require('../middlewares/validar-campos');

//Documentacion para crear un mantenimiento
/**
 * @swagger
 * /api/maintenance/create:
 *   post:
 *     summary: Crear un nuevo mantenimiento
 *     description: Este endpoint permite crear un nuevo mantenimiento solo si el equipo está activo (estado diferente a 0).
 *     tags: 
 *       - Mantenimientos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id_equipo:
 *                 type: integer
 *                 description: ID del equipo al que se le hará el mantenimiento
 *               descripcion:
 *                 type: string
 *                 description: Descripción del mantenimiento
 *               fecha_entrada:
 *                 type: string
 *                 format: date
 *                 description: Fecha de entrada del mantenimiento (solo fecha, sin hora)
 *               fecha_salida:
 *                 type: string
 *                 format: date
 *                 description: Fecha de salida del mantenimiento (solo fecha, sin hora)
 *     responses:
 *       201:
 *         description: Mantenimiento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Mantenimiento creado exitosamente"
 *                 mantenimiento:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     id_equipo:
 *                       type: integer
 *                       example: 101
 *                     descripcion:
 *                       type: string
 *                       example: "Reemplazo de batería"
 *                     fecha_entrada:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-14"
 *                     fecha_salida:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-15"
 *                     estado:
 *                       type: string
 *                       example: "pendiente"
 *       400:
 *         description: Error al crear el mantenimiento, el equipo está eliminado o no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "El equipo está eliminado o no existe, no se puede crear el mantenimiento."
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al crear el mantenimiento."
 */
router.post('/create', checkEquipoStatus, validarJWT, validarCampos, maintenanceController.createMaintenance);

//Documentacion para mostrar todos los mantenimientos existentes
/**
 * @swagger
 * /api/maintenance/maintenances:
 *   get:
 *     summary: Obtener todos los mantenimientos
 *     description: Devuelve todos los mantenimientos registrados en el sistema junto con las descripciones de los equipos asociados.
 *     operationId: getAllMaintenances
 *     tags:
 *       - Mantenimientos
 *     responses:
 *       '200':
 *         description: Lista de mantenimientos obtenidos exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id_mantenimiento:
 *                         type: integer
 *                       id_equipo:
 *                         type: integer
 *                       descripcion:
 *                         type: string
 *                       fecha_entrada:
 *                         type: string
 *                         format: date
 *                       fecha_salida:
 *                         type: string
 *                         format: date
 *                       equipo_descripcion:
 *                         type: string
 *       '404':
 *         description: No se encontraron mantenimientos.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Error interno del servidor.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.get('/maintenances', maintenanceController.getAllMaintenances);

//Documentacion para actualizar datos de un mantenimiento
/**
 * @swagger
 * /api/maintenance/updateMaintenance/{id}:
 *   put:
 *     summary: Actualiza los datos de un mantenimiento
 *     description: Actualiza la información de un mantenimiento solo si su estado es 1. Si el estado es 0, no se permitirá la actualización.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del mantenimiento a actualizar.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               descripcion:
 *                 type: string
 *                 description: Descripción del mantenimiento.
 *               fecha_entrada:
 *                 type: string
 *                 format: date
 *                 description: Fecha de entrada del mantenimiento.
 *               fecha_salida:
 *                 type: string
 *                 format: date
 *                 description: Fecha de salida del mantenimiento.
 *     responses:
 *       200:
 *         description: Mantenimiento actualizado exitosamente.
 *       400:
 *         description: El mantenimiento está terminado o datos inválidos.
 *       404:
 *         description: Mantenimiento no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/updateMaintenance/:id', checkMaintenanceStatus, validarCampos, validarJWT, maintenanceController.updateMaintenance);


//Documentacion para llamar al mantenimiento mediante ID
/**
 * @swagger
 * /api/maintenance/maintenance/{id}:
 *   get:
 *     summary: 'Obtener Mantenimiento por ID'
 *     description: 'Obtiene un mantenimiento específico según su ID. El middleware verifica el estado del mantenimiento antes de proceder. Si el estado es "terminado", muestra un mensaje indicándolo, de lo contrario, muestra el mantenimiento en progreso.'
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID único del mantenimiento a obtener'
 *         schema:
 *           type: 'integer'
 *     responses:
 *       200:
 *         description: 'Mantenimiento encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   description: 'Estado del mantenimiento'
 *                 maintenance:
 *                   type: 'object'
 *                   properties:
 *                     id_mantenimiento:
 *                       type: 'integer'
 *                       description: 'ID único del mantenimiento'
 *                     id_equipo:
 *                       type: 'integer'
 *                       description: 'ID único del equipo'
 *                     descripcion:
 *                       type: 'string'
 *                       description: 'Descripción del mantenimiento'
 *                     fecha_entrada:
 *                       type: 'string'
 *                       format: 'date'
 *                       description: 'Fecha de entrada del equipo a mantenimiento'
 *                     fecha_salida:
 *                       type: 'string'
 *                       format: 'date'
 *                       description: 'Fecha de salida del equipo a mantenimiento'
 *       404:
 *         description: 'Mantenimiento no encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Mantenimiento no encontrado'
 *       400:
 *         description: 'ID no proporcionado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'ID de mantenimiento no proporcionado'
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Error al obtener el mantenimiento'
 */
router.get('/maintenance/:id', maintenanceController.getMaintenanceById);

// Documentación para deshabilitar o eliminar un mantenimiento
/**
 * @swagger
 * /api/maintenance/deleteMaintenance/{id}:
 *   delete:
 *     summary: 'Deshabilitar un mantenimiento'
 *     description: 'Permite deshabilitar un mantenimiento específico, cambiando su estado a inhabilitado (estado = 0).'
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID del mantenimiento a deshabilitar'
 *         schema:
 *           type: 'integer'
 *     responses:
 *       200:
 *         description: 'Mantenimiento deshabilitado exitosamente'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Mantenimiento deshabilitado exitosamente'
 *       400:
 *         description: 'El mantenimiento ya está deshabilitado o terminado'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El mantenimiento ya está deshabilitado'
 *       404:
 *         description: 'Mantenimiento no encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Mantenimiento no encontrado'
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error interno del servidor'
 */
router.delete('/deleteMaintenance/:id', checkMaintenanceStatus, validarCampos, validarJWT, maintenanceController.deleteMaintenance);

module.exports = router;
