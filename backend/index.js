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
const {bulkDelete,makeSession,makeOrder,makeItem,putObject,uploadFiles,summariseData,makeCart} = require('./modules')
const {generateToken,mkAuth,authGoogle,generateUserInfo} = require('./auth.modules')

// configure local stratgey
passport.use(
    new LocalStrategy(
        { usernameField: 'username', passwordField: 'password',session:false },
        ( user, password, done) => {
            // perform the authentication
            let role = 0
            let name
            let picture
            console.info(`LocalStrategy> username: ${user}, password: ${password}`)
            client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({
                username: user
            }).then(result=>{
                console.log('result from mongo',result)
                
                if(result != null){
                    name = result['name']
                    picture = result['picture']
                    role = result['role']
                    return bcrypt.compare(password,result.password)
                }
                throw new Error('Incorrect login details')  
            })
            .then((result) => {
                console.log('result from hashcompare',result)
                if(result){
                    done(null, {
                        username: user,
                        name,
                        picture,
                        role: role
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
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
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


app.post('/signup/google',async (req,res)=>{
    const idToken = req.body.idToken
    console.log(idToken)
    let email
    let name
    let picture
    let userInfo
    try{
        const authResult = await authGoogle(idToken,oauthClient,GOOGLE_CLIENT_ID)
        console.log('userDetails',authResult)
        email = authResult.email
        name = authResult.firstname + ' ' + authResult.lastname
        picture = authResult.picture
        const data = await client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({username:email})
        console.log('mongo result',data)
        // generate JWT token
        userInfo = generateUserInfo(email,name,0,picture)
        console.log('user info',userInfo)
        if(data==null){
           const insertUser = await client.db(MONGO_DB).collection(MONGO_COL_USERS).insertOne(userInfo)
           console.log('new user',insertUser)   
        }
        const token = generateToken(jwt,userInfo,TOKEN_SECRET)
        res.status(200)
        res.type('application/json')
        res.json({ message: `Login in at ${new Date()}`, token,role:0 })
    } catch (err) {
        console.log(err)
        res.status(400);
        res.json({
            error: {
            message: err.message,
            }
        })
    }
    // authGoogle(idToken,oauthClient,GOOGLE_CLIENT_ID)
    //     .then(res=>{
    //         console.log('userDetails',res)
    //         email = res.email
    //         name = res.firstname + ' ' + res.lastname
    //         picture = res.picture
    //         return client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({user:email})
            
    //     })
    //     .then(data=>{
    //         console.log('mongo result',data)
    //         userInfo = generateUserInfo(email,name,data.role)
    //         if(data!=null){
    //             console.log('user info',userInfo)
    //             // generate JWT token
    //             const token = generateToken(jwt,userInfo,TOKEN_SECRET)
    //             res.status(200)
    //             res.type('application/json')
    //             res.json({ message: `Login in at ${new Date()}`, token,role:data.role })
    //         } else {
    //             client.db(MONGO_DB).collection(MONGO_COL_USERS).insertOne(userInfo).then(data=>{
    //                 console.log('new user',data)
    //                 const user = {
    //                     username: email,
    //                     name,
    //                     loginTime: (new Date()).toString(),
    //                     role: 0
    //                 }
    //                 console.log('user info',user)
    //                 // generate JWT token
    //                 const token = generateToken(jwt,user,TOKEN_SECRET)
    //                 res.status(200)
    //                 res.type('application/json')
    //                 res.json({ message: `Login in at ${new Date()}`, token,role:user.role })
    //             })
    //         }
    //     })
    //     .catch(e=>{
            
    //     })


})

app.post('/login/google',async (req,res)=>{

    const idToken = req.body.idToken
    console.log('idToken',idToken)
    try{
        const googleResult = await authGoogle(idToken,oauthClient,GOOGLE_CLIENT_ID)
        console.log('userDetails',googleResult)
        const email = googleResult.email
        const name = googleResult.firstname + ' ' +googleResult.lastname
        const picture = googleResult.picture
        const mongoResult = await client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({username:email})
        if (mongoResult != null) {
            const userInfo = generateUserInfo(email,name,0,picture)
            console.log('user info',userInfo)
            // generate JWT token
            const token = generateToken(jwt,userInfo,TOKEN_SECRET)
            res.status(200)
            res.type('application/json')
            res.json({ message: `Login in at ${new Date()}`, token,role:user.role })
        } else {
            res.status(400)
            res.type('application/json')
            res.json({error:{message:'user not found'}})
        }
    } catch(err) {
        console.log(err)
        res.status(400)
        res.type('application/json')
        res.json({
            error: {
            message: err.message,
            }
        })

    }
})

app.post('/login',mkAuth(passport),(req,res)=>{
    const user = req.user
    console.log('user info',user)
    // generate JWT token
    const token = generateToken(jwt,user,TOKEN_SECRET)
    res.status(200)
    res.type('application/json')
    res.json({ message: `Login in at ${new Date()}`, token,role:user.role })

})

app.post('/signup', async (req,res)=>{
    const username = req.body.username
    const name = (req.body.name).trim()
    const password = (req.body.password).trim().toString()
    const password1 = (req.body.password1).trim().toString()
    const picture = `https://ui-avatars.com/api/?name=${name}`
    if(password1!=password){
        res.status(400)
        res.type('application/json')        
        res.json({
            message: 'bad details'
        })
    }
    else {
        try{
            const isFound = await client.db(MONGO_DB).collection(MONGO_COL_USERS).findOne({username:username})
            if(isFound !=null){
                res.status(400)
                res.type('application/json')
                res.json({
                    message: 'Email exists'
                })    
            } else {
                const hash = await bcrypt.hash(password,saltRounds)
                const isRegistered = await client.db(MONGO_DB).collection(MONGO_COL_USERS).insertOne({username:username,password:hash,role:0,picture:picture,name:name},{ writeConcern: { w: 'majority' }})
                console.log('isRegistered',isRegistered.insertedCount)
                const user = generateUserInfo(username,name,0,picture)
                const token = generateToken(jwt,user,TOKEN_SECRET)
                res.status(201)
                res.type('application/json')
                res.json({message:'User registered',token,role:user.role})
            }
        }catch(err){
            console.log(err)
            res.status(400)
            res.type('application/json')        
            res.json({
                message: err.message
            })
        }
    }
})

app.get('/check-session',async (req,res)=>{
    const session_id = req.query.session_id
    const status = req.query.status
    console.log('session_id',session_id)
    console.log('status',status)
    try{
        if(status=='success'){
            await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).findOneAndUpdate({session_id:session_id,payment_status:'unpaid'},{$set:{payment_status:'paid'}})
            const session = await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).findOne({session_id:session_id})
            console.log(session)
            const token = session['token']
            res.status(200)
            res.type('application/json')
            res.json({token})

            
        } else {
            const order = await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).findOne({session_id:session_id,payment_status:'unpaid'})
            const session = await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).findOne({session_id:session_id})
            console.log('order',order)
            console.log('session',session)
            const token = session['token']
            const orderItems = order['order']
            res.status(200)
            res.type('application/json')
            res.json({token,orderItems})
        }
    } catch (err) {
        console.log(err)
        res.status(400)
        res.type('application/json')
        res.json({error:{message:err.message}})
    }

})


// check if request has valid token before access
app.use(checkAuth)

app.get('/myorders',async (req,res)=>{
    // const user = req.token.sub
    const user = 'fred@gmail.com'
    try{
        const orders = await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).aggregate([
            {$match:{user:user}},
            { $sort : { payment_status:1,timestamp : -1 } },
            {$project:{_id:false,payment_status:true,order:true,timestamp:true}}
        ]).toArray()
        console.log(orders)
        res.status(200)
        res.type('application/json')
        res.json({orders})
        
    } catch(err){
        res.status(400)
        res.type('application/json')
        res.json({error:err.message})

    }

})

app.post("/create-checkout-session", async (req, res) => {
    const cart = req.body.cart;
    
    const user = req.token.sub
    console.log('user',user)
    console.log('cart recived',cart)
    const line_items = makeCart(cart)
    console.log(line_items)
    const token = req.encodedToken
    const sessionMongo = client.startSession();
    // See https://stripe.com/docs/api/checkout/sessions/create
    // for additional parameters to pass.
    try {
        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ["card"],
            line_items: line_items,
            client_reference_id:user,
            customer_email:user,
            success_url: 'http://localhost:4200/#/payment-status?session_id={CHECKOUT_SESSION_ID}&status=success',
            cancel_url: 'http://localhost:4200/#/payment-status?session_id={CHECKOUT_SESSION_ID}&status=fail',
        });
        console.log('session',session)
        const order = makeOrder(user,session,cart)
        const sessionData = makeSession(user,session,token)
        await client.db(MONGO_DB).collection(MONGO_COL_ORDERS).insertOne(order)
        await client.db(MONGO_DB).collection(MONGO_COL_SESSIONS).insertOne(sessionData)
        // console.log(insertResult)
        res.json({
            sessionId: session.id,
        });
        
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
    // console.log(results)
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
                bulkDelete(files,s3)
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

// // oauth2.0
// const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

// // authenticate with google
// passport.use(new GoogleStrategy({
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback"
//   },
//   (accessToken,refreshToken, profile, done) =>{
//     return done(null, {profile,accessToken});
//   }
// ));




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