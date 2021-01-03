const express = require('express');
const router = express.Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('../../swagger.json');
const {config} = require('../config/config.js');

swaggerDocument.servers[0].url= config.url+":"+(config.port)+config.endpointBase;

router.use('/api-docs', swaggerUi.serve);
router.get('/api-docs', swaggerUi.setup(swaggerDocument));

module.exports = router;