const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const { config } = require('./config/config');
const cors = require('cors')

//Settings
app.set('port', config.port);
app.set('llave', config.secretKey);

//Middlewares
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors())

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); //<-- you can change this with a specific url like http://localhost:4200
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json");
    next();
});


//Router
app.use(require('./router/swagger'))
app.use(require('./router/authentication'));
app.use(require('./router/whatsapp'));
app.use(require('./router/notificacionautomatizada'));

app.listen(app.get('port'), () => {
    console.log("Conectado en el puerto: " + app.get('port'));
    console.log("Acceso a Swagger a traves de: " + config.url + ":" + app.get('port') + "/api-docs");
});