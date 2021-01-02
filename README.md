# Integración WhatsApp-Web

_El proyecto consta de una API Rest que permite conectarse al servicio de Whatsapp a través del servicio de Whatsapp-Web._

#### Configuración del proyecto ⚙️

_Las configuraciones se encuentran en la carpeta src/config , la cual contiene 2 archivos:_

* **config.js** _donde podemos cambiar:_
	* _usuario y contraseña para autenticarnos con JWT._
	* _url del servidor donde va a estar alojada._
	* _puerto._

* **whatsapp-auth.json** _donde se almacena la información para volver a iniciar la última sesión usada en whatsapp web en caso de falla en el servidor._


# Utilizando Whatsapp-Web 📋

_El mismo funciona a través de la utilización de un paquete de nodeJs llamado Baileys, permite la conexión de un dispositivo a través del uso de Whatsapp-Web escaneando un código QR._


### Pre-requisitos 📋

_Para integrar esta API es necesario Node y un Dispositivo Móvil con whatsapp instalado y conexión a internet las 24 hs (para poder continuar enviando mensajes, en caso de desconexión momentánea se restaura la sesión)._


### Iniciando el servidor⚙️

_Para poder levantar el servidor es necesario ejecutar los siguientes comandos:_


```
npm install
```
```
npm run start
```

_Esto nos habilita el acceso al Swagger a través de la siguiente dirección:_ {url}:{puerto}/api-docs

### Ejemplo de carga inicial de la API 🔩

_Para poder conectar nuestro dispositivo primero tenemos que loguearnos en el swagger a través del recurso “Login” el cual nos pedirá en el body el usuario y contraseña previamente configurados por nosotros._

_Obtendremos la siguiente respuesta:_

```
{
  "auth": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImVwaVdoYXQyMDIwIiwicGFzc3dvcmQiOiJlcGlXaGF0MjAyMCIsImlhdCI6MTYwNTY0NzcwMCwiZXhwIjoxNjA1NjUxMzAwfQ.OXvJ_Xnqf02w-ZRuc8WBjCJo6_B4IiWs8zcgQCZ45Wo"
}
```

_Debemos copiar el contenido de “token” y pegarlo en el Authorize en la parte superior de Swagger. Hecho esto ya tendremos accesos para poder conectar nuestro teléfono a través del recurso **“Conectar Número”**._

_Al ejecutar el recurso Conectar Número, se creará un código QR que sera enviado como respuesta en fomato png, el cual debe ser escaneado con el dispositivo que queremos configurar._
_Al hacerlo se inicia la sesión y se guardarán las credenciales para que no sea necesario volver a escanear el QR más adelante(a menos que cerremos la sesión desde el dispositivo movil)._

_Con esto tenemos habilitado el acceso a todos los recursos._


### Utilizando lo recursos de la API para envío de mensajes🔩

_Ya iniciada la sesión tenemos la posibilidad de utilizar los recursos “enviarmensaje”, “enviarmensajexid”, “enviarbucle”, “notificacionautomatizada”._

* _En enviar mensaje debemos cargar el body con el phone en el formato del ejemplo del swagger y en body el mensaje mismo._
* _En enviar mensaje x id debemos cargar el body con el jid en el formato del ejemplo del swagger y en body el mensaje mismo._
* _En enviar bucle podemos enviar a través del telefono cargado en "phone" o escribir el nombre del contacto/grupo en el campo "name"._
* _En notificación automatizada recibe el Json con todos los datos que quisieramos cargar, y es transformado a un mensaje de texto con la información cargada y se envía al telefono indicado._

### Otros recursos de la API🔩

_Además dispondremos de los recursos ”conectarsesinqr”, ”chequearconexion”, ”sesionesactivas”, ”obteneridcontactos”, ”obteneridgrupos” y ”desconectarse”._

* _En conectarse sin qr podemos cargar el body con los datos de autenticacion en el formato del ejemplo del swagger o vaciar el body para que se utilice la ultima cuenta que halla sido abierta._
* _En chequear conexion podemos verificar si el telefono esta correctamente conectado, nos devuelve nuestros datos y credenciales._
* _En sesiones activas nos da las sesiones que se iniciaron y no fueron finalizadas desde el dispositivo movil._
* _En obtener id contactos nos devuelve un array con nombre,id de cada contacto._
* _En obtener id grupos nos devuelve un array con nombre,id de cada grupo._
* _El recurso desconectarse debe utilizarse en el caso de querer cambiar el número o el dispositivo desde el que se esta usando Whatsapp, al utilizarlo nos devuelve las credenciales para volver a iniciar sesión sin escanear qr._

## Autor ✒️

* **Fernando Campos** - fer_eze_jose@hotmail.com

