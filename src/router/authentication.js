const express = require('express');
const router = express.Router();
const {login} = require('../controllers/authentication-controller');
const {config} = require('../config/config');

const endpointBase = config.endpointBase;

//Definicion de rutas y asignacion de controlador//
router.post(endpointBase +'/login', login );

//Fin def rutas y asig de controlador//

module.exports = router;