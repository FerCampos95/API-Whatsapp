const fetch = require("node-fetch");
const {config} =require("../config/config");

module.exports = {
    //recibe el json de cierre de venta y agarro los campos importantes para enviar por whatsapp
    notificacionAutomatizada: async(req, res)=>{
        console.log("Recibiendo notificacion automatizada");
        let datos= req.body.datos;
        let telefono= req.body.phone;

        //console.log(req.headers);
        let authorization= req.headers.authorization;
        let endopint= config.url+":"+(process.env.port || config.port)+config.endpointBase+"/enviarmensaje";
        //console.log(authorization,endopint);
        
        let mensajeDetallado= armarDetalle(datos);
        

        console.log("RESULTADO DETALLADO",mensajeDetallado);
        

        let headers={
            "authorization": authorization,
            "Content-Type": "application/json"
        }
        let body={
            "body": mensajeDetallado,
            "phone": telefono
        }

        try{
            let envio= await fetch(endopint,{
                "method": "POST",
                "headers": headers,
                "body": JSON.stringify(body),
            })
            //let respuesta= envio.json();
            res.send({
                "estado":"Mensaje enviado",
                "numero": body.phone
            });
        }catch(err){
            console.log(err);
            res.sed(err.message);
        }
        
        //console.log(detalleVenta);
    }
}

function armarDetalle(datosCompletos){
    //console.log("datosCompletos Recibidos",datosCompletos);
    let detalle=``;

    datosCompletos.forEach((datos,index) => {
        for (const titulo in datos) {
            if (datos.hasOwnProperty(titulo)) {
                //console.log(titulo);
                detalle+=`*_===== ${titulo} =====_*\n`;

                let datoInterno= datos[titulo];
                for (const nombreDato in datoInterno) {
                    if (datoInterno.hasOwnProperty(nombreDato)) {
                        //console.log("    "+nombreDato +" === "+datoInterno[nombreDato]);
                        detalle+=`*${nombreDato}:* ${datoInterno[nombreDato]}\n`;
                    }
                }
                detalle+=`\n`;
            }
        }
    })

    return detalle;
}