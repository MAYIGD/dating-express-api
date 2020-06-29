const express = require("express")
const passport = require('passport')
const multer = require('multer')
const fs = require('fs')
const path = require('path')


const User = require("../models/User")
const Picture = require("../models/Picture")
const key = require("../config/keys").key

const router = express.Router()

const UPLOAD_PATH = './uploads'
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, UPLOAD_PATH);
    },
    filename: function (req, file, callback) {
        console.log(file)
        const array = file.originalname.split('.')
        const ext = array[array.length - 1]
        callback(null, Date.now() + "." + ext);
    }
})


// router.post('/upload', function (req, res, next) {
//     var upload = multer({ storage : storage}).single('fileUpload');
//     upload(req,res,function(err) {
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.end("File is uploaded  "+req.file.filename);
//     });
// })

router.post('/upload', passport.authenticate('jwt', { session: false }), (request, response) => {

    var upload = multer({
        storage: storage,
        fileFilter: function (req, file, callback) {
            var ext = path.extname(file.originalname);
            if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
                return callback(new Error('Only images are allowed'))
            }
            callback(null, true)
        },
        limits: {
            files: 1
        }
    }).single('fileUpload');
    upload(request, response, function (err) {
        if (err) {
            return response.json({
                status: 0,
                message: "Error uploading file.",
                data: null
            })
        }

        const newPicture = new Picture({
            path: request.file.filename,
            userId: request.user.id
        })

        newPicture.save().then(result => {
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
})

router.delete('/:id', passport.authenticate('jwt', { session: false }), (request, response) => {
    const pId = request.params.id

    Picture.findById(pId)
        .then(obj => {
            if (obj) {
                if (request.user.id == obj.userId) {
                    Picture.findOneAndDelete({
                        _id: pId
                    }).then((result) => {

                        fs.unlink(`${UPLOAD_PATH}/${result.path}`, function (err) {
                            if (err) throw err
                            console.log('file deleted')
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
                }
                else {
                    response.json({
                        status: 0,
                        message: '不能刪除不是自己的',
                        data: null
                    })
                }
            }
            else {
                response.json({
                    status: 0,
                    message: '查無此資料',
                    data: null
                })
            }
        })
})

router.get("/self", passport.authenticate("jwt", { session: false }), (request, response) => {
   
    Picture.find({
        userId: request.user.id
    }).then(users => {
        response.json({
            status: 1,
            message: null,
            data: users
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