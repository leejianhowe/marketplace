const authGoogle = async (idToken,oauthClient,GOOGLE_CLIENT_ID) => {
    try{
        const ticket = await oauthClient.verifyIdToken({
            idToken: idToken,
            audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        console.log(payload)
        const userDetails = {
            email: payload['email'],
            firstname: payload['given_name'],
            lastname: payload['family_name'],
            picture:payload['picture']
        }
        return userDetails

    }catch(err){

        return err
        
    }
}

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
        aud: 'marketplacefrontend',
        iss: 'marketplace',
        iat: timestamp,
        exp: timestamp + (60 * 15), //expire in 15mins
        data: {
            username: user.username,
            name: user.name,
            loginTime: (new Date()).toString(),
            role:user.role
        }
    }, TOKEN_SECRET)
}

const generateUserInfo = (email,name,role,picture)=>{
    return {
        username: email,
        name,
        role,
        picture
    }
}



module.exports = {generateToken,mkAuth,authGoogle,generateUserInfo}