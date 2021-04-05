const express = require('express')
const mongoose = require('mongoose')
const ShortUrl = require('./models/shortUrl')
const User = require('./models/user')
const Txn = require('./models/txn')
const Ad = require('./models/ad')
const shortUrl = require('./models/shortUrl')
const { json } = require('express')
const app = express()

mongoose.connect(process.env.MONGODB_URI ||'mongodb://localhost/bananaLy', {
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
        res.render('userHome', { User: await User.findOne({ userEmail: req.body.email }), shortUrls: { short: "" }, urlList:[] })
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
        if (req.body.password2 == x.password){
            const urlList = await shortUrl.find({ userEmail: req.body.email2 }).limit(3) ;
            // console.log(urlList) ;
            res.render('userHome', { User: x, shortUrls: { short: "" }, urlList: urlList })
        }
        else
        return res.sendStatus(404)
    }
})

app.post('/uShrink', async (req, res) => {
    const f = (req.body.toggle == "monetized") // monetized option is checked or not
    const x = await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
    const urlList = await shortUrl.find({ userEmail: req.body.email }).limit(3) ;
    
    if (x == null) {
        await ShortUrl.create({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f })
        res.render('userHome', {
            shortUrls: await ShortUrl.findOne({ full: req.body.fullUrl, userEmail: req.body.email, monetized: f }),
            User: await User.findOne({ userEmail: req.body.email }),
            urlList: urlList
        })
    }
    else {
        res.render('userHome', {
            shortUrls: x,
            User: await User.findOne({ userEmail: req.body.email }),
            urlList: urlList
        })
    }
})

app.get('/u/:user_email', async (req, res) => {
    const user = await User.findOne({ userEmail: req.params.user_email })
    if (user == null)
        return res.sendStatus(404)
    else 
        res.render('user', {User: user})
})

app.post('/editUserInfo', async (req, res) => {
    const user = await User.findOne({ userEmail: req.body.email }) ;
    if (user == null)
    return res.sendStatus(404)
    
    user.name = req.body.name ;
    user.password = req.body.new_password ;
    user.save() ;
    
    res.render('SignUpLogIn')
})

app.post('/managePage', async (req, res) => {
    const user = await User.findOne({ userEmail: req.body.email }) ;
    const urlList = await shortUrl.find({ userEmail: req.body.email }).limit(3) ;
    res.render('managePage', {
        User: user,
        urlList: urlList
    })
})

app.post('/walletPage', async (req, res) => {
    const user = await User.findOne({ userEmail: req.body.email }) ;
    const txns = await Txn.find({ userEmail: req.body.email }).limit(3) ;
    const urlList = await ShortUrl.find({ userEmail: req.body.email, monetized: true }) ;
    // console.log(urlList) ;
    res.render('walletPage', {
        User: user,
        Txns: txns,
        urlList: urlList
    })
})

app.post('/adSubmission', async (req, res) =>{
    const user = await User.findOne({ userEmail: req.body.email }) ;
    res.render('AdSubmissionForm', {
        User : user
    })
})

app.post('/payment', async (req, res) => {
    const user = await User.findOne({ userEmail: req.body.email }) ;
    const adsAr =  JSON.parse(req.body.ads_ar) ;
    
    await adsAr.forEach(element => {
        Ad.create({
            userEmail: user.userEmail,
            adType: element["type"],
            adEmbed: element["embedded"],
            adRedirect: element["redirected"]
        })
    });
    
    res.render('AdSubmissionForm', {
        User : user
    })
})

app.get('/:shortUrl', async (req, res) => {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null)
    return res.sendStatus(404)
    
    shortUrl.clicks++
    shortUrl.save()

    if(shortUrl.monetized == false){
        res.redirect(shortUrl.full)
    }
    else{
        
        var x = {
            "full" : shortUrl.full,
    
            "videoEmbed": "",
            "videoRedirect": "",
    
            "bannerEmbed": "",
            "bannerRedirect": "",
    
            "newTabEmbed": "",
            "newTabRedirect": "",
    
            "smallBoxEmbed": "",
            "smallBoxRedirect": "",
        }

        // const video = await Ad.findOne({adType: 'video'}) ;
        // const banner = await Ad.findOne({adType: 'banner'}) ;
        // const newTab = await Ad.findOne({adType: 'newTab'}) ;
        // const smallBox = await Ad.findOne({adType: 'smallBox'}) ;

        const video0 = (await Ad.aggregate([  
            { $match:  {adType: 'video'} } ,
            { $sample: {size: 1} }
        ]))

        const banner0 = (await Ad.aggregate([  
            { $match:  {adType: 'banner'} },
            { $sample: {size: 1} }
        ]))
        
        const newTab0 = (await Ad.aggregate([  
            { $match:  {adType: 'newTab'} },
            { $sample: {size: 1} } 
        ]))
        
        const smallBox0 = (await Ad.aggregate([  
            { $match:  {adType: 'smallBox'} },
            { $sample: {size: 1} }
        ]))
    
        if(video0 != null && video0.length == 1){
            const video = await Ad.findOne({_id : video0[0]._id}) ;
            video.servedCnt++ ;
            video.remainingCnt-- ;
            video.save() ;
    
            x["videoEmbed"] = video.adEmbed ;
            x["videoRedirect"] = video.adRedirect ;
    
            if(video.remainingCnt == 0){
                Ad.deleteOne({_id: video._id}) ;
            }
        }
        if(banner0 != null && banner0.length == 1){
            const banner = await Ad.findOne({_id : banner0[0]._id}) ;
            banner.servedCnt++ ;
            banner.remainingCnt-- ;
            banner.save() ;
    
            x["bannerEmbed"] = banner.adEmbed ;
            x["bannerRedirect"] = banner.adRedirect ;
    
            if(banner.remainingCnt == 0){
                Ad.deleteOne({_id: banner._id}) ;
            }
        }
        if(newTab0 != null && newTab0.length == 1){
            const newTab = await Ad.findOne({_id : newTab0[0]._id}) ;
            newTab.servedCnt++ ;
            newTab.remainingCnt-- ;
            newTab.save() ;
            
            x["newTabEmbed"] = newTab.adEmbed ;
            x["newTabRedirect"] = newTab.adRedirect ;
    
            if(newTab.remainingCnt == 0){
                Ad.deleteOne({_id: newTab._id}) ;
            }
        }
        if(smallBox0 != null && smallBox0.length == 1){
            const smallBox = await Ad.findOne({_id : smallBox0[0]._id}) ;
            smallBox.servedCnt++ ;
            smallBox.remainingCnt-- ;
            smallBox.save() ;
            
            x["smallBoxEmbed"] = smallBox.adEmbed ;
            x["smallBoxRedirect"] = smallBox.adRedirect ;
    
            if(smallBox.remainingCnt == 0){
                Ad.deleteOne({_id: newTab._id}) ;
            }
        }
    
        res.render('medium', x)
    }
})

app.listen(process.env.PORT || 5000);
