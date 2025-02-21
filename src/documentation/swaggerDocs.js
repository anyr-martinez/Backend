// swagger/swaggerDoc.js
const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'API de Usuarios',
      version: '1.0.0',
      description: 'Esta es la documentación de la API para la gestión de usuarios, incluyendo registro, login, actualización de datos y eliminación.',
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo',
      },
    ],
    paths: {
      '/users/registro': {
        post: {
          summary: 'Registrar un nuevo usuario',
          description: 'Permite registrar un nuevo usuario en la base de datos.',
          tags: ['Usuarios'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'El nombre completo del usuario',
                    },
                    usuario: {
                      type: 'string',
                      description: 'El nombre de usuario único',
                    },
                    password: {
                      type: 'string',
                      description: 'La contraseña del usuario',
                    },
                  },
                  required: ['name', 'usuario', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Usuario registrado correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        description: 'ID del usuario registrado',
                      },
                      name: {
                        type: 'string',
                        description: 'Nombre completo del usuario',
                      },
                      usuario: {
                        type: 'string',
                        description: 'Nombre de usuario',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Error al registrar el usuario',
            },
          },
        },
      },
      '/users/login': {
        post: {
          summary: 'Iniciar sesión',
          description: 'Permite iniciar sesión con el nombre de usuario y la contraseña.',
          tags: ['Usuarios'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    usuario: {
                      type: 'string',
                      description: 'Nombre de usuario',
                    },
                    password: {
                      type: 'string',
                      description: 'Contraseña del usuario',
                    },
                  },
                  required: ['usuario', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login exitoso. Retorna un token de acceso.',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      token: {
                        type: 'string',
                        description: 'Token de acceso JWT para autenticación.',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'Credenciales incorrectas',
            },
          },
        },
      },
      '/api/users/updateUser/{id}': {
    put: {
      summary: 'Actualizar datos de un usuario',
      description: 'Permite actualizar el nombre y el usuario de un usuario específico.',
      tags: ['Usuarios'],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'ID del usuario a actualizar',
          schema: {
            type: 'integer',
            example: 123,
          },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                nombre: {
                  type: 'string',
                  description: 'Nuevo nombre del usuario',
                  example: 'Nuevo Nombre',
                },
                usuario: {
                  type: 'string',
                  description: 'Nuevo nombre de usuario',
                  example: 'nuevo_usuario',
                },
              },
              required: ['nombre', 'usuario'],
            },
          },
        },
      },
      responses: {
        200: {
          description: 'Usuario actualizado correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Usuario actualizado',
                  },
                  usuario: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        example: 123,
                      },
                      nombre: {
                        type: 'string',
                        example: 'Nuevo Nombre',
                      },
                      usuario: {
                        type: 'string',
                        example: 'nuevo_usuario',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        400: {
          description: 'Error en la solicitud (por ejemplo, usuario eliminado o datos faltantes)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'El usuario está eliminado o deshabilitado',
                  },
                },
              },
            },
          },
        },
        404: {
          description: 'Usuario no encontrado',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Usuario no encontrado',
                  },
                },
              },
            },
          },
        },
        500: {
          description: 'Error interno del servidor',
        },
      },
    },
  },
       '/api/users/updatePassword/{id}': {
        put: {
          summary: 'Actualizar contrasena de un usuario',
          description: 'Permite actualizar la contrasena de un usuario específico.',
          tags: ['Usuarios'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              description: 'ID del usuario a actualizar',
              schema: {
                type: 'integer',
                example: 123,
              },
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    newPass: {
                      type: 'string',
                      description: 'Nueva contrasena de usuario',
                      example: 'nueva contrasena',
                    },
                  },
                  required: ['contrasena'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Contrasena actualizado correctamente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Contrasena actualizado',
                      },
                      usuario: {
                        type: 'object',
                        properties: {
                          id: {
                            type: 'integer',
                            example: 123,
                          },
                          newPass: {
                            type: 'string',
                            example: 'nueva contrasena',
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Error en la solicitud (por ejemplo, usuario eliminado o datos faltantes)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'El usuario está eliminado o deshabilitado',
                      },
                    },
                  },
                },
              },
            },
            404: {
              description: 'Usuario no encontrado',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'Usuario no encontrado',
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Error en la solicitud (por ejemplo, usuario eliminado o datos faltantes)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'El usuario está eliminado o deshabilitado',
                      },
                    },
                  },
                },
              },
            },
            500: {
              description: 'Error interno del servidor',
            },
          },
        },
      },
      
      'api/users/user': {
        get: {
          summary: 'Obtener usuarios activos',
          description: 'Obtiene una lista de todos los usuarios activos registrados en la base de datos.',
          tags: ['Usuarios'],
          responses: {
            200: {
              description: 'Lista de usuarios activos',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: {
                          type: 'integer',
                          description: 'ID del usuario',
                        },
                        nombre: {
                          type: 'string',
                          description: 'Nombre del usuario',
                        },
                        usuario: {
                          type: 'string',
                          description: 'Nombre de usuario',
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Error en la solicitud (por ejemplo, usuario eliminado o datos faltantes)',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      message: {
                        type: 'string',
                        example: 'El usuario está eliminado o deshabilitado',
                      },
                    },
                  },
                },
              },
            },
            401: {
              description: 'No autorizado',
            },
          },
        },
      },     
    },

    'api/users/deleteUser/{id}': {
      delete: {
        summary: 'Eliminar un usuario activo',
        description: 'Elimina un usuario activo registrados en la base de datos.',
        tags: ['Usuarios'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            description: 'ID del usuario a eliminar',
            schema: {
              type: 'integer',
              example: 123,
            },
          },
        ],
        responses: {
          200: {
            description: 'Usuario Eliminado Correctamente',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: {
                        type: 'integer',
                        description: 'ID del usuario',
                      },
                      nombre: {
                        type: 'string',
                        description: 'Nombre del usuario',
                      },
                      usuario: {
                        type: 'string',
                        description: 'Nombre de usuario',
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Error en la solicitud (por ejemplo, usuario eliminado o datos faltantes)',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'El usuario está eliminado o deshabilitado',
                    },
                  },
                },
              },
            },
          },
          401: {
            description: 'No autorizado',
          },
          404: {
            description: 'Usuario no encontrado',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: {
                      type: 'string',
                      example: 'Usuario no encontrado',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    
  }
  
module.exports = swaggerDefinition;
  