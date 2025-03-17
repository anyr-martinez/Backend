const express = require('express');
const router = express.Router();
const equipmentController = require('../controller/equipmentController');
const reportesEquipos = require('../reports/reportesEquipos');
const {validarJWT} = require('../middlewares/validar-jwt');
const {validarCampos} = require('../middlewares/validar-campos');

// Crear un nuevo equipo
//Documentacion para crear un equipo
/**
 * @swagger
 * /api/equipment/create:
 *   post:
 *     summary: 'Crear un nuevo equipo'
 *     description: 'Permite crear un nuevo equipo y agregarlo a la base de datos.'
 *     tags:
 *       - Equipos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: 'object'
 *             properties:
 *               descripcion:
 *                 type: 'string'
 *                 description: 'Descripción del equipo'
 *               tipo:
 *                 type: 'string'
 *                 description: 'Tipo de equipo'
 *               numero_serie:
 *                 type: 'string'
 *                 description: 'Número de serie del equipo'
 *               fecha_registro:
 *                 type: 'string'
 *                 format: date
 *                 description: 'Fecha de registro del equipo como timestamp'
 *     responses:
 *       201:
 *         description: 'Equipo creado exitosamente'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                 data:
 *                   type: 'object'
 *                   properties:
 *                     descripcion:
 *                       type: 'string'
 *                     tipo:
 *                       type: 'string'
 *                     numero_serie:
 *                       type: 'string'
 *                     fecha_registro:
 *                       type: 'stringer'
 *                       format: date
 *                       description: 'Fecha de registro en formato timestamp'
 *       400:
 *         description: 'Error en los datos proporcionados (campo faltante)'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *       500:
 *         description: 'Error interno del servidor'
 */
router.post('/create', validarCampos, validarJWT,equipmentController.createEquipment);

// Obtener todos los equipos
//Documentacion para obtener todos los equipos
/**
 * @swagger
 * /api/equipment/equipments:
 *   get:
 *     summary: 'Obtener todos los equipos'
 *     description: 'Obtiene una lista de todos los equipos registrados en la base de datos.'
 *     tags:
 *       - Equipos
 *     responses:
 *       200:
 *         description: 'Lista de todos los equipos registrados en el sistema'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'array'
 *               items:
 *                 type: 'object'
 *                 properties:
 *                   id:
 *                     type: 'integer'
 *                     description: 'ID único del equipo'
 *                   descripcion:
 *                     type: 'string'
 *                     description: 'Descripción del equipo'
 *                   tipo:
 *                     type: 'string'
 *                     description: 'Tipo de equipo'
 *                   numero_serie:
 *                     type: 'string'
 *                     description: 'Número de serie del equipo'
 *                   fecha_registro:
 *                     type: 'integer'
 *                     format: 'int64'
 *                     description: 'Fecha de registro del equipo en formato timestamp'
 *                   estado:
 *                     type: 'integer'
 *                     description: 'Mostrar si el equipo está activo (1) o no (0)'
 *       500:
 *         description: 'Error interno del servidor'
 *       400:
 *         description: 'Error en la solicitud'
 */
router.get('/equipments', equipmentController.getAllEquipments);

// Obtener un equipo por ID
//Documentacion para llamar al equipo mediante ID
/**
 * @swagger
 * /api/equipment/equipments/{id}:
 *   get:
 *     summary: 'Obtener equipo por ID'
 *     description: 'Obtiene un equipo específico según su ID. Si el equipo está deshabilitado, devuelve un mensaje de equipo deshabilitado.'
 *     tags:
 *       - Equipos
 *     parameters:
 *       - name: 'id'
 *         in: 'path'
 *         required: true
 *         description: 'ID único del equipo a obtener'
 *         schema:
 *           type: 'integer'
 *     responses:
 *       200:
 *         description: 'Equipo encontrado y activo'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 id:
 *                   type: 'integer'
 *                   description: 'ID único del equipo'
 *                 descripcion:
 *                   type: 'string'
 *                   description: 'Descripción del equipo'
 *                 tipo:
 *                   type: 'string'
 *                   description: 'Tipo de equipo'
 *                 numero_serie:
 *                   type: 'string'
 *                   description: 'Número de serie del equipo'
 *                 fecha_registro:
 *                   type: 'string'
 *                   format: date
 *                   description: 'Fecha de registro del equipo'
 *       404:
 *         description: 'Equipo no encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Equipo no encontrado'
 *       400:
 *         description: 'Equipo deshabilitado'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Equipo deshabilitado'
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: 'object'
 *               properties:
 *                 message:
 *                   type: 'string'
 *                   example: 'Error al obtener el equipo'
 */
router.get('/equipments/:id', equipmentController.getEquipmentById);

// Actualizar un equipo
//Documentacion para actualizar datos de un equipo
/**
 * @swagger
 * /api/equipment/updateEquipment/{id}:
 *   put:
 *     summary: 'Actualizar información de un equipo'
 *     description: 'Permite actualizar los datos de un equipo específico usando su ID. Los equipos inhabilitados (estado 0) no pueden ser actualizados.'
 *     tags:
 *       - Equipos
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 'ID del equipo a actualizar'
 *         required: true
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
 *                 description: 'Descripción del equipo'
 *               tipo:
 *                 type: string
 *                 description: 'Tipo de equipo'
 *               numero_serie:
 *                 type: string
 *                 description: 'Número de serie del equipo'
 *               fecha_registro:
 *                 type: 'string'
 *                 format: date
 *                 description: 'Fecha de registro del equipo en formato timestamp'
 *     responses:
 *       200:
 *         description: 'Equipo actualizado exitosamente'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Equipo actualizado'
 *                 data:
 *                   type: object
 *                   properties:
 *                     descripcion:
 *                       type: string
 *                     tipo:
 *                       type: string
 *                     numero_serie:
 *                       type: string
 *                     fecha_registro:
 *                       type: 'string'
 *                       format: date
 *       400:
 *         description: 'Error debido a datos incompletos o equipo inhabilitado'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El equipo está inhabilitado y no puede ser actualizado'
 *       404:
 *         description: 'Equipo no encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Equipo no encontrado'
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al actualizar el equipo'
 */
router.put('/updateEquipment/:id', validarJWT,validarCampos,equipmentController.updateEquipment);

// Eliminar un equipo (actualizar estado a 0)
/**
 * @swagger
 * /api/equipment/deleteEquipment/{id}:
 *   delete:
 *     summary: 'Eliminar un equipo'
 *     security:
 *       - bearerAuth: []
 *     description: 'Permite eliminar un equipo específico usando su ID. Los equipos inhabilitados (estado 0) no pueden ser eliminados, y si ya están inhabilitados, se retorna un mensaje indicando que ya está eliminado.'
 *     tags:
 *       - Equipos
 *     parameters:
 *       - name: id
 *         in: path
 *         description: 'ID del equipo a eliminar'
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 'Equipo eliminado exitosamente'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Equipo eliminado exitosamente'
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 'ID del equipo eliminado'
 *       400:
 *         description: 'Equipo ya inhabilitado o error en la solicitud'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'El equipo ya está inhabilitado y no puede ser eliminado'
 *       404:
 *         description: 'Equipo no encontrado'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Equipo no encontrado'
 *       500:
 *         description: 'Error interno del servidor'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Error al eliminar el equipo'
 */

router.delete('/deleteEquipment/:id', validarJWT, validarCampos,equipmentController.deleteEquipment);

//Documentacion para reportes
/**
 * @swagger
 * /api/equipment/reporte:
 *   get:
 *     summary: Generar reporte en PDF de equipos activos
 *     description: Genera un reporte en formato PDF con la lista de equipos activos (estado 1).
 *     tags:
 *      - Equipos
 *     responses:
 *       200:
 *         description: Reporte generado con éxito
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No hay equipos activos disponibles para generar el reporte
 *       500:
 *         description: Error al generar el reporte
 */
router.get('/reporte', validarJWT,validarCampos,reportesEquipos.generateEquipmentReport);


module.exports = router;
