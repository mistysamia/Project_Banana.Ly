const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const User = require('./models/user')
const Txn = require('./models/txn')
const Ad = require('./models/ad')
const app = express()

mongoose.connect('mongodb://localhost/bananaLy', {
    useNewUrlParser: true, useUnifiedTopology: true
})

app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended:false }))

app.get('/', async (req, res) => {
    res.render('index', {shortUrls: {short:""}})
})

app.post('/', async (req, res) => {
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' }) 
    if(x == null){
        await ShortUrl.create({full: req.body.fullUrl})
        res.render('index', {shortUrls: await ShortUrl.findOne({full: req.body.fullUrl, userEmail: 'admin'})})
    }
    else{
        res.render('index', {shortUrls : x})
    }
})

app.post('/SignUpLogIn', (req, res) => {
    res.render('SignUpLogIn')
})
// app.post('/SignUpLogIn', (req, res) => {
//     res.render('signup_login')
// })

app.post('/signUpButtonAction', async (req, res) => {
    const x = await User.findOne({ userEmail: req.body.email })
    if(x == null){
        await User.create( {name: req.body.name, userEmail: req.body.email, password: req.body.password} )
        res.render('test', {User: await User.findOne({userEmail: req.body.email})})
    }
    else{
        // already registered with this email
        return res.sendStatus(404)
    }
})
app.post('/logInButtonAction', async (req, res) => {
    const x = await User.findOne({ userEmail: req.body.email2 })
    if(x == null){
        // not registered
        return res.sendStatus(404)
    }
    else{
        if(req.body.password2 == x.password)
            res.render('test', {User: x})
        else
            return res.sendStatus(404)
    }
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl }) 
    if(shortUrl == null)
        return res.sendStatus(404)
    
    shortUrl.clicks++
    shortUrl.save()
    
    res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);
