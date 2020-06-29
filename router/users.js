const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const passport = require('passport')

const User = require('../models/User')
const key = require('../config/keys').key

const router = express.Router()

router.get('/', (request, response) => {
    User.find().then(users=>{
        response.json({
            status:1,
            message:null,
            data:users
        })
    })
})

// router.get("/:id", (request, response) => {
//     const id = request.params.id
//     let usr = users.find(user => user.id == id)
//     response.json(usr)
// })

router.post('/register', (request, response) => {
    
    if(request.body.account == null || request.body.account == ''){
        response.json({
            status:0,
            message:'缺少參數 account',
            data:null
        })
    }

    if(request.body.password == null || request.body.password == ''){
        response.json({
            status:0,
            message:'缺少參數 password',
            data:null
        })
    }

    if(request.body.name == null || request.body.name == ''){
        response.json({
            status:0,
            message:'缺少參數 name',
            data:null
        })
    }

    if(request.body.email == null || request.body.email == ''){
        response.json({
            status:0,
            message:'缺少參數 email',
            data:null
        })
    }


    User.findOne({
        account: request.body.account
    }).then((user) => {
        if (user) {
            response.json({
                status:0,
                message:'你註冊過了',
                data:null
            })
        }
        else {
            const newUser = new User({
                account: request.body.account,
                password: request.body.password,
                name: request.body.name,
                email: request.body.email
            })
            bcrypt.hash(newUser.password, 10, (error, hash) => {
                if (error) {
                    throw error
                }
                else {
                    newUser.password = hash
                    newUser.save()
                        .then((user) => {
                            response.json({
                                status:1,
                                message:null,
                                data:user
                            })
                        })
                        .catch((error) => {
                            response.json({
                                status:0,
                                message:error,
                                data:null
                            })
                        })
                }
            })

        }
    })
})

router.post('/login', (request, response) => {

    if(request.body.account == null || request.body.account == ''){
        response.json({
            status:0,
            message:'缺少參數 account',
            data:null
        })
    }

    if(request.body.password == null || request.body.password == ''){
        response.json({
            status:0,
            message:'缺少參數 password',
            data:null
        })
    }


    User.findOne({
        account: request.body.account
    }).then((user) => {
        if (user) {
            bcrypt.compare(request.body.password, user.password)
            .then((result)=>{
                if(result){
                    const rule = {
                        id:user.id,
                        account:user.account,
                        name:user.name,
                        email:user.email
                    }
                    jwt.sign(rule, key, { expiresIn:3600 }, (error, token)=>{
                        if(error){
                            throw error
                        }
                        
                        response.json({
                            status:1,
                            message:null,
                            data:{token: `Bearer ${token}`}
                        })
                    })
                }
                else{
                    response.json({
                        status:0,
                        message:'密碼錯誤',
                        data:null
                    })
                }
            })
        }
        else {
            response.json({
                status:0,
                message:'你應該先註冊',
                data:null
            })
        }
    })
})

router.get('/current', passport.authenticate('jwt', { session:false }), (request, response)=>{
    response.json({
        status:1,
        message:null,
        data:request.user
    })
})

router.post('/edit', passport.authenticate('jwt', { session:false }), (request, response) => {

    if(request.body.name == null || request.body.name == ''){
        response.json({
            status:0,
            message:'缺少參數 name',
            data:null
        })
    }


    User.findById(request.user.id)
    .then(user=>{
        if(user){
            user.name = request.body.name
            user.save()
            .then((result)=>{
                response.json({
                    status:1,
                    message:null,
                    data:result
                })
            })
            .catch(err => {
                response.json({
                    status: 0,
                    message: err,
                    data: null
                })
            })
        }
        else{
            response.json({
                status:0,
                message:'沒有該使用者',
                data:null
            })
        }
    })
})


router.post('/verified', passport.authenticate('jwt', { session:false }), (request, response) => {

    User.findById(request.user.id)
    .then(user=>{
        if(user){
            user.verified = true
            user.save()
            .then((result)=>{
                response.json({
                    status:1,
                    message:null,
                    data:result
                })
            })
            .catch(err => {
                response.json({
                    status: 0,
                    message: err,
                    data: null
                })
            })
        }
        else{
            response.json({
                status:0,
                message:'沒有該使用者',
                data:null
            })
        }
    })
})


module.exports = router