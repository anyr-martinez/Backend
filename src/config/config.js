require('dotenv').config();


const config = {
    db:{
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.PORT

    },
    jwsecret: process.env.JWT_SECRET
}

module.exports = {
    jwsecret: 'MyClaveSecreta'  // Cambia esto por un valor único y seguro
};

module.exports=config;