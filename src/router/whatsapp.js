const express = require('express');
const router = express.Router();
const whatsapp = require('../controllers/whatsappController');
const {config} = require('../config/config');
const { authenticateUser } = require('../security/token-validation');

const endpointBase = config.endpointBase;

//middleware para proteger rutas
router.use( (req,res,next)=>{
    console.log("AUTHORIZANDO");
    try{
        authenticateUser(req.headers, res);
        next();
    }
    catch(err){
        console.log(err.message);
        res.send(err.message);
    }

})

//Definicion de rutas y asignacion de controlador//
router.post(endpointBase+'/conectarse', whatsapp.conectApi);
router.post(endpointBase+'/conectarsesinqr', whatsapp.conectApiNoQR);
router.get(endpointBase+'/desconectarse', whatsapp.disconectApi);
router.post(endpointBase+'/enviarmensaje', whatsapp.sendMessage);
router.post(endpointBase+'/enviarmensajexid', whatsapp.sendMessageToID);
router.post(endpointBase+'/enviarbucle', whatsapp.sendMessageLoop);
router.get(endpointBase+'/sesionesactivas', whatsapp.consultarSesionesActivas);
router.get(endpointBase+'/obteneridcontactos', whatsapp.obtenerContactoyJID);
router.get(endpointBase+'/obteneridgrupos', whatsapp.obtenerGruposyJID);
router.get(endpointBase+'/chequearconexion', whatsapp.obtenerMisDatos);
//Fin def rutas y asig de controlador//

module.exports = router;