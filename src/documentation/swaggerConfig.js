// swagger/swaggerConfig.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Importar la definición centralizada de la documentación Swagger
const swaggerDefinition = require('./swaggerDoc');

// Generar la documentación Swagger usando la definición centralizada
const swaggerSpec = swaggerJsdoc({
  definition: swaggerDefinition,
  apis: ['./src/routes/*.js', './src/controller/*.js'], // Archivos que contienen las rutas y controladores
});

module.exports = {
  swaggerUi,
  swaggerSpec,
};
