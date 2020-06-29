const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const passport = require('passport')
const path = require('path')

const users = require('./router/users')
const friends = require('./router/friends')
const pictures = require('./router/pictures')
const mongoUri = require('./config/keys').mongoUri

const app = express()
const port = 8011

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize())
require('./config/passport')(passport)
app.use('/static', express.static(__dirname + '/uploads'))
app.use('/api/users', users)
app.use('/api/friends', friends)
app.use('/api/pictures', pictures)

mongoose.connect(mongoUri, { useNewUrlParser: true })
    .then(() => {
        console.log('mongoDB connect')
    })
    .catch((error) => {
        console.log(error)
    })

app.get('/', (reqest, response) => {
    response.send(`Listening on port ${port}...`)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}...`)
});

