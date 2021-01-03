const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {config} = require ('./config/config');

//Settings
app.set('port', config.port);
app.set('llave', config.secretKey);

//Middlewares
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar cabeceras y cors
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Router
app.use(require('./router/swagger'))
app.use(require('./router/authentication'));
app.use(require('./router/whatsapp'));
app.use(require('./router/notificacionautomatizada'));

app.listen(app.get('port'), () => {
    console.log("Conectado en el puerto: " +app.get('port'));
    console.log("Acceso a Swagger a traves de: "+config.url+":"+app.get('port')+"/api-docs");
});