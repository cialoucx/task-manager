const swaggerUi = require('swagger-ui-express');

const openApiSpecification = {
  openapi: '3.0.0',
  info: {
    title: 'The Daily Docket API',
    version: '1.0.0',
    description: 'SaaS Task Management API Documentation'
  },
  servers: [
    {
      url: '/api',
      description: 'API Base Server'
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      Task: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          title: { type: 'string' },
          description: { type: 'string' },
          completed: { type: 'boolean' },
          dueDate: { type: 'string', format: 'date', nullable: true },
          priority: { type: 'string', enum: ['low', 'medium', 'high'] },
          columnPosition: { type: 'integer' },
          userId: { type: 'integer' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        }
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          username: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        }
      },
      Activity: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          taskId: { type: 'integer', nullable: true },
          userId: { type: 'integer' },
          action: { type: 'string' },
          timestamp: { type: 'string', format: 'date-time' },
          details: { type: 'string' }
        }
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ],
  paths: {
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Created successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        summary: 'Log in an existing user',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        user: { $ref: '#/components/schemas/User' },
                        token: { type: 'string' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/tasks': {
      get: {
        summary: 'List user tasks',
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['all', 'active', 'inactive'], default: 'all' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'dueDateFilter', in: 'query', schema: { type: 'string', enum: ['today', 'week', 'overdue', 'high'] } },
          { name: 'sortBy', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'priority', 'dueDate', 'alphabetical'], default: 'newest' } }
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Task' } },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      },
      post: {
        summary: 'Create a new task',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['title'],
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  dueDate: { type: 'string', format: 'date', nullable: true },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'], default: 'medium' },
                  columnPosition: { type: 'integer', default: 0 }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: 'Created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}': {
      get: {
        summary: 'Get a single task by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      },
      put: {
        summary: 'Update an existing task',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  description: { type: 'string' },
                  completed: { type: 'boolean' },
                  dueDate: { type: 'string', format: 'date', nullable: true },
                  priority: { type: 'string', enum: ['low', 'medium', 'high'] },
                  columnPosition: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      },
      delete: {
        summary: 'Delete a task',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Deleted',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/tasks/{id}/toggle': {
      patch: {
        summary: 'Toggle task completion state',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
        ],
        responses: {
          200: {
            description: 'Toggled',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Task' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/activity': {
      get: {
        summary: 'Retrieve user activity timeline logs',
        responses: {
          200: {
            description: 'Success',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { type: 'array', items: { $ref: '#/components/schemas/Activity' } },
                    count: { type: 'integer' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

function setupSwagger(app) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpecification));
}

module.exports = setupSwagger;
