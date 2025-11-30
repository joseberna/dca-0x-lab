import swaggerJsdoc from "swagger-jsdoc";
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "PoC DCA API",
            version: "1.0.0",
            description: "API para ejecutar y monitorear planes DCA",
        },
        servers: [
            {
                url: "http://localhost:4000",
                description: "Servidor local",
            },
        ],
    },
    // 👇 Aquí especificamos dónde buscar las anotaciones
    apis: [
        "./src/infraestructure/api/routes/*.ts", // ajusta según tu estructura
    ],
};
export const swaggerSpec = swaggerJsdoc(options);
