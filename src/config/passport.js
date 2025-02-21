const passport = require ('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;
const moment = require("moment");
const expirationTime = moment.duration(10, "days").asSeconds();
const User = require('../models/userModel');

exports.getToken = (data) =>{
    return jwt.sign(data, JWT_SECRET, { expiresIn: expirationTime});
};

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: JWT_SECRET,
};

exports.validarAutentication = passport.use(new JwtStrategy(opts, async (jwt_payload, done)=>{
    await User.getUserById(jwt_payload.id, (err, user)=>{
        if(err){
            return done(err, false);
        }
        if(user){
            return done(null, user);

        }else{
            return done(null, false);
        }
    });

}));