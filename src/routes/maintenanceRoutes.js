const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenanceController');
const reportesMantenimientos = require('../reports/reportesMantenimientos');
//const reportesMantenimientosInactivos = require('../reports/reportesMantenimientosInactivos');
const checkEquipoStatus = require('../middlewares/checkEquipoStatus');
const checkMaintenanceStatus = require('../middlewares/checkMaintenanceStatus');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarCampos } = require('../middlewares/validar-campos');

// Documentación para crear un mantenimiento
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

// Documentación para mostrar todos los mantenimientos existentes
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

//Actualizar datos de un mantenimiento
/**
 * @swagger
 * /api/maintenance/updateMaintenance/{id}:
 *   put:
 *     summary: Actualiza los datos de un mantenimiento
 *     description: Actualiza la información de un mantenimiento solo si su estado es 1. Si el estado es 0 o 2, no se permitirá la actualización.
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
 *               id_equipo:
 *                 type: integer
 *                 description: ID del equipo asociado al mantenimiento.
 *     responses:
 *       200:
 *         description: Mantenimiento actualizado exitosamente.
 *       400:
 *         description: El mantenimiento no se puede actualizar porque está en estado 0 o 2.
 *       404:
 *         description: Mantenimiento no encontrado.
 *       500:
 *         description: Error interno del servidor.
 */
router.put('/updateMaintenance/:id',  validarCampos, validarJWT, maintenanceController.updateMaintenance);

// Obtener un mantenimiento por ID
/**
 * @swagger
 * /api/maintenance/maintenances/{id}:
 *   get:
 *     summary: 'Obtener Mantenimiento por ID'
 *     description: 'Obtiene un mantenimiento específico según su ID. El estado se muestra en formato legible: "Pendiente", "En Proceso", o "Terminado".'
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
 *                   description: 'Mensaje de éxito'
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
 *                    
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
router.get('/maintenances/:id', validarCampos, validarJWT, maintenanceController.getMaintenanceById);

//Docuemntacion para cambiar estado 
/**
 * @swagger
 * /api/maintenance/maintenance/status/{id}:
 *   put:
 *     summary: 'Actualizar estado de mantenimiento'
 *     description: 'Cambia el estado de un mantenimiento existente.'
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID del mantenimiento a actualizar'
 *         schema:
 *           type: 'integer'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             properties:
 *               estado:
 *                 type: 'integer'
 *                 description: 'Nuevo estado del mantenimiento (0: Pendiente, 1: En proceso, 2: Completado)'
 *     responses:
 *       200:
 *         description: 'Estado actualizado exitosamente'
 *       400:
 *         description: 'Datos inválidos'
 *       404:
 *         description: 'Mantenimiento no encontrado'
 *       500:
 *         description: 'Error del servidor'
 */
router.put('/maintenance/status/:id', validarCampos, validarJWT, maintenanceController.updateMaintenanceStatus);

// Documentación para deshabilitar o eliminar un mantenimiento
/**
 * @swagger
 * /api/maintenance/deleteMaintenance/{id}:
 *   delete:
 *     summary: 'Deshabilitar un mantenimiento'
 *     description: 'Permite deshabilitar un mantenimiento específico, cambiando su estado a inhabilitado (estado = 0).'
 *     tags:
 *      - Mantenimientos
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID único del mantenimiento a deshabilitar'
 *         schema:
 *           type: 'integer'
 *     responses:
 *       200:
 *         description: 'Mantenimiento deshabilitado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Mantenimiento deshabilitado con éxito'
 *       400:
 *         description: 'Error al deshabilitar mantenimiento'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Error al deshabilitar mantenimiento'
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
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Error al procesar la solicitud'
 */
router.delete('/deleteMaintenance/:id', maintenanceController.deleteMaintenance);

//RUTA DE REPORTES
// RUTA PARA REPORTE POR FECHA Y ESTADO
/**
 * @swagger
 * /api/maintenance/report/date:
 *   get:
 *     summary: Genera un reporte de mantenimiento por fechas y estado.
 *     description: Genera un reporte de mantenimiento basado en un rango de fechas y estado.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Fecha de inicio del rango 
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Fecha de fin del rango 
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: estado
 *         in: query
 *         description: Estado del mantenimiento. 0 = Pendiente, 1 = En proceso, 2 = Completado, 3 = Todos los estados.
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3]
 *           default: 3
 *     responses:
 *       200:
 *         description: El archivo PDF de reporte generado.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros incorrectos.
 *       404:
 *         description: No se encontraron mantenimientos en el rango de fechas.
 *       500:
 *         description: Error interno al generar el reporte.
 */
router.get('/report/date', validarCampos, validarJWT,reportesMantenimientos.generateMaintenanceReportByDate);


//RUTA PARA POR TIPO DE EQUIPO Y ESTADO
/**
 * @swagger
 * /api/maintenance/report/type:
 *   get:
 *     summary: Genera un reporte de mantenimiento por tipo de equipo y estado.
 *     description: Genera un reporte de mantenimiento basado en el tipo de equipo y estado.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: tipoEquipo
 *         in: query
 *         description: El tipo de equipo por el cual filtrar los mantenimientos.
 *         required: true
 *         schema:
 *           type: string
 *           
 *       - name: estado
 *         in: query
 *         description: El estado por el cual filtrar los mantenimientos.
 *         required: false
 *         schema:
 *           type: string
 *           
 *     responses:
 *       200:
 *         description: El archivo PDF de reporte generado.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetro tipoEquipo faltante o estado no válido.
 *       404:
 *         description: No se encontraron mantenimientos para el tipo de equipo y estado especificado.
 *       500:
 *         description: Error interno al generar el reporte.
 */
router.get('/report/type', validarCampos, validarJWT,reportesMantenimientos.generateMaintenanceReportByType);

// REPORTE GENERAL
/**
 * @swagger
 * /api/maintenance/report:
 *   get:
 *     summary: Genera un reporte general de mantenimiento.
 *     description: Genera un reporte que incluye todos los mantenimientos filtrados por estado.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: estado
 *         in: query
 *         description: Estado del mantenimiento. 0 = Pendiente, 1 = En proceso, 2 = Completado, 3 = Todos los estados.
 *         required: false
 *         schema:
 *           type: integer
 *           enum: [0, 1, 2, 3]
 *           default: 3
 *     responses:
 *       200:
 *         description: El archivo PDF de reporte generado.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: El estado es inválido o no se ha proporcionado.
 *       404:
 *         description: No se encontraron mantenimientos para el estado y rango de fechas proporcionados.
 *       500:
 *         description: Error interno al generar el reporte.
 */
router.get('/report', validarCampos, validarJWT,reportesMantenimientos.generateGeneralMaintenanceReport);


module.exports=router;