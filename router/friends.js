const express = require("express")
const passport = require('passport')

const User = require('../models/User')
const Friend = require('../models/Friend')

const router = express.Router()

router.get('/', (request, response) => {
    Friend.find().then(objs => {
        response.json({
            status: 1,
            message: null,
            data: objs
        })
    })
})

// router.get("/randam", passport.authenticate("jwt", { session: false }), (request, response) => {
  
//     User.find({
//         _id: {$ne: request.user.id}
//     }).then(objs => {
//         response.json({
//             status: 1,
//             message: null,
//             data: objs
//         })
//     })
// })

router.post("/like", passport.authenticate("jwt", { session: false }), (request, response) => {

    if (request.body.friendId == null || request.body.friendId == '') {
        return response.json({
            status: 0,
            message: '缺少參數 friendId',
            data: null
        })
    }

    if (request.user.id == request.body.friendId) {
        return response.json({
            status: 0,
            message: '自己不能喜歡自己',
            data: null
        })
    }

    User.find({
        $or:
            [
                {
                    _id: request.user.id,
                },
                {
                    _id: request.body.friendId
                }
            ]
    })
        .then(users => {
            if (users, users.length == 2) {

                Friend.findOne({
                    userId: request.user.id,
                    user2Id: request.body.friendId
                }).then((obj) => {
                    if (obj) {
                        return response.json({
                            status: 0,
                            message: '已喜歡',
                            data: null
                        })
                    }

                    const newObj = new Friend({
                        userId: request.user.id,
                        user2Id: request.body.friendId
                    })

                    newObj.save().then(result => {
                        response.json({
                            status: 1,
                            message: null,
                            data: result
                        })
                    }).catch(err => {
                        response.json({
                            status: 0,
                            message: err,
                            data: null
                        })
                    })
                })

            }
            else {
                response.json({
                    status: 0,
                    message: '沒有id',
                    data: null
                })
            }
        })
        .catch(err => {
            console.log(err)
            response.json({
                status: 0,
                message: '沒有id',
                data: null
            })
        })

})

router.get("/match", passport.authenticate("jwt", { session: false }), (request, response) => {

    Friend.find({
        $or:
            [
                {
                    userId: request.user.id,
                },
                {
                    user2Id: request.user.id
                }
            ]
    })
        .then(objs => {

            // console.log(objs)

            const meLike = objs.filter(obj => obj.userId == request.user.id).map(obj => obj.user2Id)
            const likeMe = objs.filter(obj => obj.user2Id == request.user.id).map(obj => obj.userId)

            // console.log(meLike)
            // console.log(likeMe)

            const result = meLike.filter((e) => {
                return likeMe.indexOf(e) > -1
            })

            response.json({
                status: 1,
                message: null,
                data: result
            })
        })
        .catch(err => {
            response.json({
                status: 0,
                message: err,
                data: null
            })
        })

})

router.get("/unmatch", passport.authenticate("jwt", { session: false }), (request, response) => {

    if (request.body.fId == null || request.body.fId == '') {
        return response.json({
            status: 0,
            message: '缺少參數 fId',
            data: null
        })
    }


    Friend.findOneAndDelete({
        _id: fId
    })
        .then((result) => {
            response.json({
                status: 1,
                message: null,
                data: result
            })
        })
        .catch(err => {
            response.json({
                status: 0,
                message: err,
                data: null
            })
        })

})

module.exports = router