const WhatsAppWeb = require('baileys');
const fs = require('fs');
const qr= require('qr-image');
const fetch= require('node-fetch');
const {config} = require ('../config/config');

let client = new WhatsAppWeb() 
let telConectado=false;
let todosContactos;
let bucleActivo=true;

// CONECTA WHATS - SERVIDOR
module.exports.conectApi = async (req, res) => {
    
   telConectado= await sesionActiva();
   
    if(telConectado){
        console.log("Ya hay un número conectado"); //describir el numero
        res.send({"error": "Ya existe una conexión a WhatsApp activa"});
        return;
    }else{
        console.log("No hay ninguna conexion activa");
        
        client= new WhatsAppWeb();

        client.connect()
        .then (([user, chats, contacts, unread]) => {
            guardarDatosAutenticacion();
            todosContactos= contacts;

            //enviar mensaje a mi whatsapp
            notificarAlDesarrollador(req);
        })
        .catch (err => {
            res.send(err);
            console.log(err)
        })
        
        setTimeout(async()=>{
            const strQR= await leerQRdeArchivo();
            console.log(strQR);
            let bufferQR= qr.imageSync(strQR,{type:'png'});
            await fs.writeFileSync("./qr.png",bufferQR);

            res.download("./qr.png", "imagen-qr.png", (err)=>{
                res.send(err);
            });

        },3000);

    }
}

module.exports.conectApiNoQR = async (req, res) => {
    console.log("Conectando sin QR");
    
    let autorizacion= req.body.autorizacion;

    if(!autorizacion){
        //console.log("NO hay autorizacion en el body");
        //console.log("Buscando autorizacion en archivo");
        try {
            let autorizacionJson= await leerDatosAutenticacion();
            autorizacionJson= JSON.parse(autorizacionJson);
            autorizacionJson= autorizacionJson[0].autorizacion;
            //console.log("Json de autorizacion es:",autorizacionJson);

            if(!autorizacionJson.clientID || !autorizacionJson.serverToken){
                //console.log("NO hay Autorizacion en archivo");
                res.send({"error":"No hay datos para iniciar sesión sin QR"});
                return;
            }else{
                autorizacion= autorizacionJson;
            }
        } catch (error) {
            res.send({"error":"No hay datos para iniciar sesión sin QR"});
            return;
        }

    }else{
        console.log("Hay autorizacion en el body");
        //se mantienen los datos iniciales del body en autorizacion
    }
    
    console.log(autorizacion);

    telConectado= await sesionActiva();
    
    if(telConectado){
        console.log("Ya hay un número conectado"); //describir el numero
        res.send({"error": "ya hay una conexión a whatsapp activa"});
        return;
    }else{
        console.log("No hay ninguna conexion activa");
    
        //client= new WhatsAppWeb();

        client.connect(autorizacion)
        .then (([user, chats, contacts, unread]) => {
            guardarDatosAutenticacion();
            todosContactos=contacts;
            res.jsonp({
                mensaje: 'Número conectado correctamente',
                datos: client.userMetaData
            });
        })
        .catch (err => {
            res.send(err);
            console.log(err)
        })
    }
}

module.exports.disconectApi = async (req, res) => {
    
    let datosAutenticacion= await client.base64EncodedAuthInfo();
    let datos= client.userMetaData;
    
    client.close(); //cierra la conexion pero matiene activa las credenciales (permite iniciar sesion mas adelante)
    //client.logout();// cierra la conexion y corta la actividad de las credeciales
    console.log("Desconectado, datos:",datosAutenticacion);
    client = new WhatsAppWeb();

    res.send({
        "mensaje":"Número desconectado correctamente",
        "datos": datos,
        "autorizacion": datosAutenticacion
    });
}

module.exports.obtenerMisDatos = async (req, res) => {
    telConectado= await sesionActiva();

    if(telConectado){
        let datosAutenticacion= await client.base64EncodedAuthInfo();
        let datos= client.userMetaData;

        res.send({
            "mensaje":"Número Conectado correctamente",
            "datos": datos,
            "autorizacion": datosAutenticacion
        });
    }else{
        res.send({
            "mensaje":"No hay ningún numero conectado",
        });
    }
}

module.exports.obtenerContactoyJID = async (req, res) => {
    let contactos= new Array();

    let data;
    let contacto;
    todosContactos.forEach( (contact)=>{
        data=contact[1];

        if(data.name){
            if(data.jid.includes("@c")){ //es contacto
                contacto={};
                contacto.nombre=data.name;
                contacto.jid= data.jid;
                contactos.push(contacto);
            }
        }
    })

    res.send({"contactos": contactos});
}

module.exports.obtenerGruposyJID = async (req, res) => {
    let grupos= new Array();

    let data;
    let grupo;
    todosContactos.forEach( (contact)=>{
        data=contact[1];

        if(data.name){
            if(data.jid.includes("@g")){//es grupo
                grupo={};
                grupo.nombre=data.name;
                grupo.jid= data.jid;
                grupos.push(grupo);
            }
        }
    })

    res.send({"grupos": grupos});
}

// ENVIAR MENSAJES
module.exports.sendMessage = async (req, res) => {
    options = {
        quoted: null,
        timestamp: new Date()
    }

    let conectado= await client.authInfo;
    let body= req.body.body;

    if(conectado.clientID!==null){
        client.sendTextMessage(`${req.body.phone}@s.whatsapp.net`, body, options)
        .then( res.jsonp({mensaje:'Mensaje enviado'}))
        .catch((err)=>{
            console.log(err.message);
            res.send(err.message);
        })
    }else{
        console.log("usuario NO conectado");
        res.send({estado:"Whatsapp no conectado"});
    }
}

//solo envia sabiendo el jid
module.exports.sendMessageToID = async (req, res) => {
    options = {
        quoted: null,
        timestamp: new Date()
    }

    let receptor= req.body.jid;
    if(receptor.includes("@c.us")){
        receptor= receptor.replace("@c.us", "@s.whatsapp.net");
        receptor= receptor.trim();
    }

    client.sendTextMessage(receptor, req.body.body, options)
    .then( res.jsonp({mensaje:'Notificación enviada'}))
    .catch( (err)=>{ res.send(err)})
        
}

module.exports.sendMessageLoop = async (req, res) => {
    try{
        options = {
            quoted: null,
            timestamp: new Date()
        }
        let receptor;
        let cantReceptores=0;
        bucleActivo=true;
        if(req.body.name){
            todosContactos.forEach(contacto => {
                console.log(contacto[1]);
                let nombreChat= contacto[1].name;
    
                if(nombreChat && nombreChat.toLowerCase().includes(req.body.name.toLowerCase())){
                    cantReceptores++;
                    receptor=contacto[1].jid;
                    if(cantReceptores>1){
                        res.send("Error, hay mas de 1 receptor");
                        return;
                    }
                }
            });
        }else{
            receptor=req.body.phone+"@s.whatsapp.net";
        }
    
        if(receptor.includes("@c.us")){
            console.log("contiene us");
            receptor= receptor.replace("@c.us", "@s.whatsapp.net");
            receptor= receptor.trim();
        }
    
        console.log("El receptor es:", receptor);
    
        
        const intevarlo= setInterval(async ()=>{
            if(!bucleActivo){
                clearInterval(intevarlo);
            }

            //console.log(num);
            let body= `${req.body.message}
            
            _Esto es una notificación automatizada que se enviara cada 5 segundos, para cortar el bucle debe enviar: *CORTAR-AUTOMATIZACION*_`;
        
            const envio= await client.sendTextMessage(receptor, body, options)
            console.log(envio);
        },5000)
            
        
        res.send("Ciclo Activado");
    }
    catch(err){
        console.log(err.code);
        let mensaje= err.message;
        if(err.code== "ERR_INVALID_ARG_TYPE"){
            mensaje="No inicio sesion";
        }
        res.send({
            estado: "No enviado",
            error: mensaje
        });
    }
}
client.setOnUnreadMessage (m => { //FUNCION PARA DETECTAR EL CORTE DEL BUCLE
    const [notificationType, messageType] = client.getNotificationType(m) // get what type of notification it is -- message, group add notification etc.
    console.log("got notification of type: " + notificationType) // message, groupAdd, groupLeave
    console.log("message type: " + messageType) // conversation, imageMessage, videoMessage, contactMessage etc.
    console.log("MENSAJE:",m.message.conversation);

    if(m.message.conversation=="CORTAR-AUTOMATIZACION"){
        bucleActivo=false;
    }

}, false)

module.exports.consultarSesionesActivas = async (req, res) => {
    const client2= new WhatsAppWeb();
    let sesionesValidas= new Array();

    telConectado= await sesionActiva();
    if(telConectado){
        res.send("Ya hay una sesión Activa, debe cerrar la sesión para hacer la consulta.");
        return;
    }

    try {
        let sesiones= await leerDatosAutenticacion();
        sesiones= JSON.parse(sesiones)
            

        for (const sesion of sesiones) {
            try {
                await client2.connectSlim(sesion.autorizacion);
                await client2.close();
                sesionesValidas.push(sesion.autorizacion);
            } catch (error) {
                console.log("no validaaaaaaa")
            }
        }
            
        
        res.send(sesionesValidas)
    } catch (error) {
        res.send(error);
    }
}

async function guardarDatosAutenticacion(){
    let infoAutenticacion={};
    const autenticacion= await client.base64EncodedAuthInfo();
    let info= client.userMetaData;
    let telefono= info.id.substring(0,info.id.indexOf("@"))
    let nombre= info.name;
    info={
        "telefono": telefono,
        "nombre": nombre
    }

    infoAutenticacion.datos=info;
    infoAutenticacion.autorizacion=autenticacion;

    let datosPrevios;

    try {
        datosPrevios = await leerDatosAutenticacion();
        datosPrevios= JSON.parse(datosPrevios);
    } catch (error) {
        console.log("error leyendo datos de autenticacion");
    }

    //pregunto si los datos previos no contienen info autenticacion guardo
    let credencialesRepetidas=false;
    datosPrevios.forEach((previo,index) => {
        console.log(previo.datos.telefono);
        if(previo.datos.telefono==telefono){
            credencialesRepetidas=true;
            datosPrevios.splice(index,1);
            console.log("Telefono ya guardado");
        }
    });
    datosPrevios.unshift(infoAutenticacion);

    fs.writeFileSync('./src/config/whatsapp-auth.json', JSON.stringify(datosPrevios),(err)=>{
        if(err){
            console.log("HAY UN ERROR GUARDANDO EL ARCHIVO",err);
        }
    });
}

async function leerDatosAutenticacion(){
    console.log("leyendo");
    
    let datos= await fs.readFileSync('./src/config/whatsapp-auth.json','utf-8',(err,data)=>{
        if(err){
            console.log("HAY UN ERROR LEYENDO EL ARCHIVO",err);
            //return null;
        }else{
            console.log("Archivo leido");
            //console.log(data);
            //return data;
        }
    });
    //console.log("Los Datos son", datos);
    return datos;
}

async function leerQRdeArchivo(){
    console.log("leyendo QR");
    
    let datos= await fs.readFileSync('./src/config/string-qr.txt','utf-8',(err,data)=>{
        if(err){
            console.log("HAY UN ERROR LEYENDO EL ARCHIVO",err);
            //return null;
        }else{
            console.log("Archivo leido");
            //console.log(data);
            //return data;
        }
    });
    //console.log("Los Datos son", datos);
    return datos;
}

async function sesionActiva(){
    //let datos = false;
    try {
        await client.base64EncodedAuthInfo();
        console.log("Retornando true");

        return true;
    } catch (error) {
        console.log("HAY ERROR",error.message);
        return false;
    }
    //console.log(datos);
}

async function notificarAlDesarrollador(req){
    console.log("Notificando Fer Campos");

    let authorization= req.headers.authorization;
    //let endopint= config.url+":"+(config.port)+config.endpointBase+"/enviarmensaje";
    let endopint= config.url+config.endpointBase+"/enviarmensaje"; //acomodado para heroku

    let mensajeDetallado=`_Mensaje automatizado:_ Hola Fernando, estoy utilizando tu Api`;

    let headers={
        "authorization": authorization,
        "Content-Type": "application/json"
    }
    let body={
        "body": mensajeDetallado,
        "phone": 5491167070753
    }

    try{
        let envio= await fetch(endopint,{
            "method": "POST",
            "headers": headers,
            "body": JSON.stringify(body),
        })
        //let respuesta= envio.json();
        console.log({
            "estado":"Mensaje enviado",
            "numero": body.phone
        });
    }catch(err){
        console.log(err);
    }
        
}