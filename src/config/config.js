const date = new Date();

module.exports = {
    config: {
        currentDate: {   
            now: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`
        },
        endpointBase: '/api',
        defaultLogin: {
            username: 'usuario',
            password: 'contraseña'
        },
        //url: "http://192.168.0.13",
        //url: "http://localhost",
        url: "https://api-whatsapp-fer.herokuapp.com",
        port: process.env.PORT || 4001,
        secretKey: 'secret_key',
        tokenConfig: {
            expiration: 60 * 60 * 60
        }
    }
}