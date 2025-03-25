const express = require('express');
const router = express.Router();
const maintenanceController = require('../controller/maintenanceController');
const reportesMantenimientos = require('../reports/reportesMantenimientos');
const reportesMantenimientosInactivos  = require('../reports/reportesMantenimientosInactivos');
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


//Documentacion de Reportes 
/**
 * @swagger
 * /api/maintenance/report/date:
 *   get:
 *     summary: Generar reporte de mantenimiento por rango de fechas
 *     description: Genera un reporte de mantenimiento basado en un rango de fechas (startDate y endDate).
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string 
 *           format: date
 *         description: Fecha de inicio (en formato YYYY-MM-DD).
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (en formato YYYY-MM-DD).
 *     responses:
 *       200:
 *         description: Reporte de mantenimiento generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros inválidos
 *       404:
 *         description: No se encontraron mantenimientos en el rango de fechas
 *       500:
 *         description: Error al generar el reporte
 */

router.get('/report/date', validarCampos, validarJWT,reportesMantenimientos.generateMaintenanceReportByDate);

/**
 * @swagger
 * /api/maintenance/report/type:
 *   get:
 *     summary: Generar reporte de mantenimiento por tipo de equipo
 *     description: Genera un reporte de mantenimiento basado en el tipo de equipo.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - in: query
 *         name: tipoEquipo
 *         required: true
 *         schema:
 *           type: string
 *         description: Tipo de equipo.
 *     responses:
 *       200:
 *         description: Reporte de mantenimiento generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetro 'tipoEquipo' inválido
 *       404:
 *         description: No se encontraron mantenimientos para el tipo de equipo
 *       500:
 *         description: Error al generar el reporte
 */

router.get('/report/type', validarCampos, validarJWT,reportesMantenimientos.generateMaintenanceReportByType);

/**
 * @swagger
 * /api/maintenance/report:
 *   get:
 *     summary: Generar reporte general de mantenimiento
 *     description: Genera un reporte general de todos los mantenimientos.
 *     tags:
 *       - Mantenimientos
 *     responses:
 *       200:
 *         description: Reporte general de mantenimiento generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No se encontraron mantenimientos
 *       500:
 *         description: Error al generar el reporte
 */

router.get('/report',  validarCampos, validarJWT,reportesMantenimientos.generateGeneralMaintenanceReport);


//REPORTES INACTIVOS EN ESTADO 0
// Documentación para reporte de mantenimientos inactivos por fecha
/**
 * @swagger
 * /api/maintenance/reports/inactiveDate:
 *   get:
 *     summary: Generar reporte de mantenimientos inactivos por fecha
 *     description: Genera un reporte de mantenimientos inactivos dentro de un rango de fechas especificado.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: Fecha de inicio del rango.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Fecha de fin del rango.
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Reporte de mantenimientos inactivos por fecha generado correctamente.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetros inválidos o faltantes (startDate o endDate).
 *       404:
 *         description: No se encontraron mantenimientos inactivos en el rango de fechas proporcionado.
 *       500:
 *         description: Error al generar el reporte.
 */
router.get('/reports/inactiveDate', validarCampos, validarJWT,reportesMantenimientosInactivos.generateMaintenanceReportByDateInactive);

// Documentación para reporte de mantenimientos inactivos por tipo de equipo
/**
 * @swagger
 * /api/maintenance/reports/inactiveType:
 *   get:
 *     summary: Generar reporte de mantenimientos inactivos por tipo de equipo
 *     description: Genera un reporte de mantenimientos inactivos filtrados por tipo de equipo.
 *     tags:
 *       - Mantenimientos
 *     parameters:
 *       - name: tipoEquipo
 *         in: query
 *         description: Tipo de equipo para filtrar los mantenimientos inactivos.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reporte de mantenimientos inactivos por tipo generado correctamente.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Parámetro de tipo de equipo faltante.
 *       404:
 *         description: No se encontraron mantenimientos inactivos para el tipo de equipo proporcionado.
 *       500:
 *         description: Error al generar el reporte.
 */
router.get('/reports/inactiveType', validarCampos, validarJWT,reportesMantenimientosInactivos.generateMaintenanceReportByTypeInactive);

// Documentación para reporte general de mantenimientos inactivos
/**
 * @swagger
 * /api/maintenance/reports/general-inactive:
 *   get:
 *     summary: Generar reporte general de mantenimientos inactivos
 *     description: Genera un reporte general de todos los mantenimientos inactivos.
 *     tags:
 *       - Mantenimientos
 *     responses:
 *       200:
 *         description: Reporte general de mantenimientos inactivos generado correctamente.
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No se encontraron mantenimientos inactivos.
 *       500:
 *         description: Error al generar el reporte.
 */
router.get('/reports/general-inactive', validarCampos,validarJWT,reportesMantenimientosInactivos.generateGeneralMaintenanceReportInactive);

module.exports = router;
