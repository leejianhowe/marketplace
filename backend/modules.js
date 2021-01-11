const makeItem = (body,files)=>{
    return {
        title:body.title,
        category: body.category,
        price: parseFloat(body.price),
        condition:body.condition,
        description: body.description,
        dealMethod:body.dealMethod,
        paymentMethod:body.paymentMethod,
        images:files.map((ele)=>ele.filename),
        timestamp: new Date()

    }
}

const putObject = (file, s3, data) => {
    const params = {
        Bucket: 'marketplacesg',
        Key: file.filename,
        ACL: 'public-read',
        Body: data,
        ContentType: file.mimetype,
        ContentLength: file.size,
    }
    return new Promise((res, rej) => {
        s3.putObject(params, (err, data) => {
            if (err)
                rej(err)
            res(data)
        })
    })
}

const uploadFiles = (file,fs) => {

    return new Promise((res, rej) => {
        fs.readFile(file.path, (err, data) => {
            if (err)
                rej(err)
            res(data)
        })
    })
}

const summariseData = (results)=>results.map(ele=>{
    return {
        _id:ele._id,
        timestamp: ele.timestamp,
        title: ele.title,
        price: ele.price,
        description: ele.description,
        images: ele.images[0]
    }
})

const mkAuth = (passport) => {
    return (req, resp, next) => {
        passport.authenticate('local',
            (err, user, info) => {
                if ((null != err) || (!user)) {
                    console.log('err in mkAuth',err)
                    console.log(user)
                    resp.status(401)
                    resp.type('application/json')
                    resp.json({ error: err })
                    return
                }
                // attach user to the request object
                req.user = user
                next()
            }
        )(req, resp, next)
    }
}

const generateToken = (jwt,user,TOKEN_SECRET)=>{
    const timestamp = (new Date()).getTime() / 1000
    
    return jwt.sign({
        sub: user.username,
        iss: 'marketplace',
        iat: timestamp,
        exp: timestamp + (60 * 15), //expire in 15mins
        data: {
            loginTime: user.loginTime
        }
    }, TOKEN_SECRET)
}

const makeCart = (cart) => cart.map(ele=>{
    const item ={
        price_data:{
            currency: 'sgd',
            product_data: {
            name: ele.title,
            images: ['https://i.imgur.com/EHyR2nP.png'],
            },
            unit_amount: parseInt(ele.price*100),
        },
        quantity: parseInt(ele.qty)
    }
    console.log('make line item',item)
    return item

})
    


module.exports = {makeItem,putObject,uploadFiles,summariseData,mkAuth,generateToken,makeCart}