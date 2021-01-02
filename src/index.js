const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {config} = require ('./config/config');

//Settings
app.set('port', process.env.PORT || config.port);
app.set('llave', config.secretKey);

//Middlewares
app.use(express.json());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

//Router
app.use(require('./router/swagger'))
app.use(require('./router/authentication'));
app.use(require('./router/whatsapp'));
app.use(require('./router/notificacionautomatizada'));

app.listen(app.get('port'), () => {
    console.log("Conectado en el puerto: " +app.get('port'));
    console.log("Acceso a Swagger a traves de: "+config.url+":"+app.get('port')+"/api-docs");
});