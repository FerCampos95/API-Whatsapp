const jwt = require('jsonwebtoken');
const {config} = require('../config/config')

module.exports = {
    login: async (req, res) =>{
        const login = config.defaultLogin;
        console.log(`${config.currentDate.now} | Intentando iniciar sesión...`)
        // ----------- Valido si el usuario coincide con el hardcodeado en config.js ------//
        if(req.body.username === login.username && req.body.password === login.password){
            console.log(`${config.currentDate.now} | Usuario "${req.body.username}" autorizado`)
            const token = jwt.sign({username: req.body.username, password: req.body.password}, config.secretKey,{
                expiresIn: config.tokenConfig.expiration
            });
            console.log(`${config.currentDate.now} | Token asignado: ${token}`)
            return res.status(200).send({auth: true, token: token});
        }else{
            console.log(`${config.currentDate.now} | Usuario "${req.body.username}" no válido`)
            return res.status(404).send({auth: false, message: 'Credenciales inválidas', input: req.body});
        }
    }
}