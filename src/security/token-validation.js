const jwt = require('jsonwebtoken');
const {config} = require('../config/config');

module.exports = {
    authenticateUser: (header, res) =>{
        //------ Si la autorizacion del header no existe, arroja error -----//
        if(!header.authorization){
            throw new Error('Authorization token no encontrado.')
        }
        //------ Extraigo el token jwt del header ----------------- //
        const tokenReq = header.authorization.split(" ")[1];
        const decode = jwt.verify(tokenReq, config.secretKey);
        //------ Pregunto si los datos decodificados del token conciden con el harcodeado en config ----//
        if(decode.username !== config.defaultLogin.username && decode.password !== config.defaultLogin.password){
            throw new Error('Usuario inválido')
        }

    }
}