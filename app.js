
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const userRoutes = require('./src/routes/userRoutes');
const equipmentRoutes = require('./src/routes/equipmentRoutes');
const maintenanceRoutes = require('./src/routes/maintenanceRoutes');


//const pool = require('./src/utilidades/db');
const app = express();

// Configuración de CORS y body parser
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Disposition'] // Permite descargar archivos PDF 
}));

app.use(bodyParser.json());

// Opciones para generar la documentación de Swagger con JSDoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0', // Versión de OpenAPI
    info: {
      title: 'API DE GESTION DE INVENTARIO EQUIPOS TI',
      version: '1.0.0',
      description: 'Documentación para la API de manejo de usuarios (registro, login, actualización, etc.)',
    },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  security: [{
    bearerAuth: []
  }],  
},
  apis: ['./src/routes/*.js', './src/controller/*.js'], // Archivos que contienen las rutas y controladores
};


// Generar la documentación Swagger
const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Ruta para mostrar la documentación Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


//prueba de conexion a la base de datos
// pool.getConnection()
//     .then(conn => {
//         console.log('Database connected succesfully!');
//         conn.release();
//     })
//     .catch(err => {
//         console.error('Error connecting to the database:', err);

//     });
//     const PORT = process.env.PORT || 3000;
//     app.listen(PORT, () => {
//         console.log(`Server is running on port ${PORT}`);
//     });

app.use(express.json());

//rutas del usuario, es decir por modulos
app.use('/api/users',userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/maintenance', maintenanceRoutes);

//manejo de errores
app.use((err, req, res, next) => {
  console.error(err);  // Opcional: para ver el error en la consola
  res.status(500).json({
      message: err.message || 'Ocurrió un error interno en el servidor',
  });
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  console.log('Accede a la documentación de Swagger en http://localhost:3000/api-docs');
});

module.exports = app;