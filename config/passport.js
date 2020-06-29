const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const key = require('./keys').key
const mongoose = require('mongoose')
const User = mongoose.model('users')

module.exports = (passport)=>{
    passport.use(new JwtStrategy({
        jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey:key
    }, (payload, done)=>{
        User.findById(payload.id)
        .then((user)=>{
            if(user){
                return done(null, user)
            }
            
            return done(null, false)
        })
        .catch((error)=>{
            console.log(error)
        })
    }))
}