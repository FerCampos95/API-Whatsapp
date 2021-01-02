const express = require('express');
const router = express.Router();
const {notificacionAutomatizada} = require('../controllers/notificacionAutomaticaController');
const {config} = require('../config/config');
const { authenticateUser } = require('../security/token-validation');

const endpointBase = config.endpointBase;

//middleware para proteger rutas
router.use( (req,res,next)=>{
    console.log("AUTHORIZANDO");
    try{
        //console.log(req.headers);
        authenticateUser(req.headers, res);
        next();
    }
    catch(err){
        console.log(err.message);
        res.send(err.message);
    }

})

//Definicion de rutas y asignacion de controlador//
router.post(endpointBase+'/notificacionautomatizada', notificacionAutomatizada);
//Fin def rutas y asig de controlador//

module.exports = router;