module.exports = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Simple Auth Backend',
            version: '1.0.0',
            description: 'API documentation for my Express app',
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
    },
    apis: [
        './auth/*.js',
        './users/*.js',
        './posts/*.js',
        './main.js',
    ],
};