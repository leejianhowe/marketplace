// express morgan
const express = require('express')
const morgan = require('morgan')

// mongo
const {MongoClient,ObjectId} = require('mongodb')

// s3
const AWS = require('aws-sdk')
const multer = require('multer')
const fs = require('fs')

// authentication with google with idtoken
const {
    OAuth2Client
} = require('google-auth-library');
const oauthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// authentication passport local
const passport = require('passport')

// Passport strategy
const LocalStrategy = require('passport-local').Strategy

// encrypt password
const bcrypt = require('bcrypt');
const saltRounds = 10;

// json web token
const jwt = require('jsonwebtoken')

// stripe
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_KEY);

// modules
const {makeItem,putObject,uploadFiles,summariseData,mkAuth,generateToken,makeCart} = require('./modules')
const { session } = require('passport')


// configure local stratgey
passport.use(
    new LocalStrategy(
        { usernameField: 'username', passwordField: 'password',session:false },
        ( user, password, done) => {
            // perform the authentication
            console.info(`LocalStrategy> username: ${user}, password: ${password}`)
            client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({
                user: user
            }).then(result=>{
                console.log('result from mongo',result)
                if(result != null)
                    return bcrypt.compare(password,result.password)
                throw new Error('Incorrect login details')  
            })
            .then((result) => {
                console.log('result from hashcompare',result)
                if(result){
                    done(null, {
                        username: user,
                        loginTime: (new Date()).toString()
                    })
                }else{
                    throw new Error('Incorrect login details')  
                }
            }).catch(err => {
                console.log('error',err)
                done(err.message, false)
            })
        }
    )
)

// verify that request has token
const checkAuth = (req, resp, next) => {
    // check if the request has Authorization header
    const auth = req.get('Authorization')
    if (null == auth) {
        resp.status(403)
        resp.json({ message: 'Missing Authorization header' })
        return
    }
    // Bearer authorization
    // Bearer <token>
    const terms = auth.split(' ')
    if ((terms.length != 2) || (terms[0] != 'Bearer')) {
        resp.status(403)
        resp.json({ message: 'Incorrect Authorization' })
        return
    }

    const token = terms[1]
    try {
        // verify token
        const verified = jwt.verify(token, TOKEN_SECRET)
        console.info(`Verified token: `, verified)
        req.token = verified
        req.encodedToken = token
        next()
    } catch(e) {
        resp.status(403)
        resp.json({ message: 'Incorrect token', error: e })
        return
    }

}

// ENV constants/ variables
const TOKEN_SECRET = process.env.TOKEN_SECRET || 'secret'

const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000
const maxSize = 5 * 1000 * 1000 // 5mb 
const upload = multer({dest:'uploads/',limits: { fileSize: maxSize }})

const MONGO_DB = 'marketplace'
const MONGO_COL = 'items'
const MONGO_COL_ORDERS = 'orders'
const MONGO_COL_USERS = 'users'
const MONGO_COL_SESSIONS = 'sessions'
// const MONGO_URL = 'mongodb://localhost:27017'
const MONGO_URI = `mongodb+srv://spaceman:${process.env.MONGO_PASS}@nosqldb.u0xa5.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`
const client = new MongoClient(MONGO_URI,{useNewUrlParser:true,useUnifiedTopology:true})

const credentials = new AWS.SharedIniFileCredentials({profile: 'marketplacesg'});
AWS.config.credentials = credentials
const endpoint = new AWS.Endpoint('sfo2.digitaloceanspaces.com')
const s3 = new AWS.S3({
    endpoint: endpoint,
})

const app = express()
app.use(morgan('combined'))
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(passport.initialize());
// app.use(login)

app.post('/login',mkAuth(passport),(req,res)=>{
    const user = req.user
    console.log('user info',user)
    // generate JWT token
    const token = generateToken(jwt,user,TOKEN_SECRET)
    res.status(200)
    res.type('application/json')
    res.json({ message: `Login in at ${new Date()}`, token })

})

app.post('/signup', async (req,res)=>{
    const username = req.body.username
    const password = (req.body.password).toString()
    const password1 = (req.body.password1).toString()
    if(password1!=password){
        res.status(400)
        res.type('application/json')        
        res.json({
            message: 'bad details'
        })
    }
    else {
        try{
            const isFound = await client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({user:username})
            if(isFound !=null){
                res.status(400)
                res.type('application/json')
                res.json({
                    message: 'Username exists'
                })    
            }else{
                const hash = await bcrypt.hash(password,saltRounds)
                const isRegistered = await client.db(MONGO_DB).collection(MONGO_COL_USERS).insertOne({user:username,password:hash})
                console.log(isRegistered.insertedCount)
                const user = {
                    username: username,
                    loginTime: (new Date()).toString()
                }
                const token = generateToken(jwt,user,TOKEN_SECRET)
                res.status(201)
                res.type('application/json')
                res.json({message:'User registered',token})
            }
        }catch(err){
            console.log(err)
        }
    }
})

app.get('/check-session',async (req,res)=>{
    const session_id = req.query.session_id
    const status = req.query.status
    console.log('session_id',session_id)
    console.log('status',status)
    if(status=='success'){
        await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).findOneAndUpdate({session_id:session_id,payment_status:'unpaid'},{$set:{payment_status:'paid'}})
        const result = await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).findOne({session_id:session_id})
        console.log(result)
        const token = result['token']
        res.status(200)
        res.type('application/json')
        res.json({token})

        
    } else {
        await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).findOneAndUpdate({session_id:session_id,payment_status:'unpaid'},{$set:{payment_status:'failed'}})
        const result = await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).findOne({session_id:session_id})
        res.status(200)
        res.type('application/json')
        res.json({token})
    }
    res.end()

})


// check if request has valid token before access
app.use(checkAuth)

app.post("/create-checkout-session", async (req, res) => {
    const cart = req.body.cart;
    const user = req.token.sub
    console.log('user',user)
    console.log('cart recived',cart)
    const line_items = makeCart(cart)
    console.log(line_items)
    // See https://stripe.com/docs/api/checkout/sessions/create
    // for additional parameters to pass.
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: line_items,
            client_reference_id:user,
            customer_email:user,
            success_url: 'http://localhost:4200/#/success?session_id={CHECKOUT_SESSION_ID}&status=success',
            cancel_url: 'http://localhost:4200/#/failure?session_id={CHECKOUT_SESSION_ID}&status=fail',
        });
        console.log('session',session)
        const order = await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).insertOne({user:user,session_id:session.id,payment_status:session.payment_status,order:cart})
        const saveSession = await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).insertOne({user:user,session_id:session.id,token:req.encodedToken})
        Promise.all([session,order,saveSession]).then(()=>{
            // console.log(order)
            res.json({
                sessionId: session.id,
            });
        })
    } catch (e) {
        console.log(e)
        res.status(400);
        res.json({
            error: {
            message: e.message,
            }
        });
    }
  });



app.get('/items',async (req,res)=>{
    const results = await client.db(MONGO_DB).collection(MONGO_COL).find().toArray()
    console.log(results)
    const data = summariseData(results)
    res.status(200).type('application/json').json(data)

})

app.get('/items/:id',async (req,res)=>{
    try{
    const id = req.params.id
    const result  = await client.db(MONGO_DB).collection(MONGO_COL).findOne({_id:ObjectId(id)})
    res.status(200).type('application/json').json(result)
    }catch(err){
        console.log(err)
        res.status(404).type('application/json').json(err.message)
    }
})

app.get('/categories/:category', async (req,res)=>{
    const category = req.params.category
    console.log('category',category)
    const results = await client.db(MONGO_DB).collection(MONGO_COL).find({category:category}).toArray()
    console.log(results)
    const data = summariseData(results)
    res.status(200).type('application/json').json(data)
})

app.get('/search',async(req,res)=>{
    try{
        const search = req.query.search
        const results = await client.db(MONGO_DB).collection(MONGO_COL).find({title:{$regex:`${search}`,$options:'i'}}).toArray()
        console.log(results)
        res.status(200).type('application/json').json(results)
    } catch(err){
        res.status(400).type('application/')
    }
})

app.post('/item', upload.array('images',5), (req,res)=>{
        const files = req.files
        const body = req.body
        const newListing = makeItem(body, files)
        console.log('files', files)
        const uploadedFiles = files.map(ele => {
            return uploadFiles(ele, fs)
                .then(data => putObject(ele, s3, data))
                
        })
        Promise.all([...uploadedFiles])
            .then(()=>client.db(MONGO_DB).collection(MONGO_COL).insertOne(newListing))
            .then((data)=>{
                console.log('success Mongo',data.insertedId)
                res.status(200).type('application/json').json({message:"sucesss",insertId:data.insertedId})
            })
            .catch(err=>{
                console.log('error',err)
                res.status(500).type('application/json').json(err)
            })
})



app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err)
      }
    console.error('Error Catcher',err.stack)
    res.status(500).send(err)
})



client.connect().then(()=>{
    app.listen(PORT,()=>{
        console.log(`APP listening on ${PORT} on ${new Date()}`)
    })
})

// oauth2.0
// const passport = require('passport')
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// authenticate with google
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   (accessToken,refreshToken, profile, done) =>{
//     return done(null, {profile,accessToken});
//   }
// ));


// const login = async (req, res, next) => {
//     try{
//         console.log(req.headers['x-token'])
//         const ticket = await oauthClient.verifyIdToken({
//             idToken: req.headers['x-token'],
//             audience: process.env.GOOGLE_CLIENT_ID
//         });
//         const payload = ticket.getPayload();
//         const userDetails = {
//             email: payload['email'],
//             firstname: payload['given_name'],
//             lastname: payload['family_name']
//         }
//         let token = jwt.sign({data:userDetails}, process.env.GOOGLE_CLIENT_SECRET, {
//             expiresIn: 900 // 15mins
//         })
//         req.token = token
//         console.log(token)
//         next()
//     }catch(err){
//         console.log(err)
//     }
// }

// app.get('/auth/google',
//     passport.authenticate('google',{scope:['email','profile']})
// )


// app.get('/auth/google/callback',
//     passport.authenticate('google', {
//         session: false,
//         failureRedirect: '/auth/google'
//     }),
//     (req, res) => {
//         const user = req.user
//         console.log('user data',user)
//         console.log('user data',user['profile']['emails'])
//         console.log('user data',user['profile']['photos'])
//         res.send('login success')

//     })