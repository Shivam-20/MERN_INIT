const fs = require('fs');
const path = require('path');
const swaggerJsdoc = require('swagger-jsdoc');

// Import the swagger options
const swaggerOptions = require('../config/swagger');

// Generate the Swagger specification
const specs = swaggerJsdoc(swaggerOptions);

// Define the output file path
const outputFile = path.join(__dirname, '../swagger-output.json');

// Write the specification to a file
fs.writeFileSync(outputFile, JSON.stringify(specs, null, 2));

console.log(`Swagger documentation generated at: ${outputFile}`);
