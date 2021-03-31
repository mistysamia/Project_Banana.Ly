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
app.use(express.urlencoded({ extended: false }))

app.get('/', async (req, res) => {
    res.render('index', { shortUrls: { short: "" } })
})

app.post('/', async (req, res) => {
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' })
    if (x == null) {
        await ShortUrl.create({ full: req.body.fullUrl })
        res.render('index', { shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: 'admin' }) })
    }
    else {
        res.render('index', { shortUrls: x })
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
    if (x == null) {
        await User.create({ name: req.body.name, userEmail: req.body.email, password: req.body.password })
        res.render('userHome', { User: await User.findOne({ userEmail: req.body.email }), shortUrls: { short: "" } })
    }
    else {
        // already registered with this email
        return res.sendStatus(404)
    }
})
app.post('/logInButtonAction', async (req, res) => {
    const x = await User.findOne({ userEmail: req.body.email2 })
    if (x == null) {
        // not registered
        return res.sendStatus(404)
    }
    else {
        if (req.body.password2 == x.password)
        res.render('userHome', { User: x, shortUrls: { short: "" } })
        else
        return res.sendStatus(404)
    }
})

app.post('/uShrink', async (req, res) => {
    const f = (req.body.toggle == "monetized") // monetized option is checked or not
    
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
    if (x == null) {
        await ShortUrl.create({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
        res.render('userHome', {
            shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f }),
            User: await User.findOne({ userEmail: req.body.email })
        })
    }
    else {
        res.render('userHome', {
            shortUrls: x,
            User: await User.findOne({ userEmail: req.body.email })
        })
    }
})
app.post('/managePage', async (req, res) => {
    res.render('managePage')

})

// app.post('/uShrink', async (req, res) => {
//     const x = await ShortUrl.findOne({ full: req.body.fullUrl })
//     if (x == null) {
//         await ShortUrl.create({ full: req.body.fullUrl })
//         res.render('userHome', {
//             shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl }),
//             // User: await User.findOne({ userEmail: "hehe" })
//             User:{
//                 name: "asddddddf",
//                 userEmail: "heheheeee"
//             }
//         })
//     }
//     else {
//         res.render('userHome', {
//             shortUrls: x,
//             // User: await User.findOne({ userEmail: "req.body.email" })
//             User: {
//                 name: "asdf",
//                 userEmail: "huhu"
//             }
//         })
//     }
// })

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null)
        return res.sendStatus(404)

    shortUrl.clicks++
    shortUrl.save()

    res.redirect(shortUrl.full)
})

app.listen(process.env.PORT || 5000);
