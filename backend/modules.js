const makeItem = (body,files)=>{
    return {
        title:body.title,
        category: body.category,
        price: parseFloat(body.price),
        // condition:body.condition,
        description: body.description,
        // dealMethod:body.dealMethod,
        // paymentMethod:body.paymentMethod,
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

const bulkDelete = (deleteObjs,s3) =>{
    // const deleteObjs = file.map(ele=>{
    //     return {
    //         Key: ele.filename
    //     }
    // })
    // console.log(deleteObjs)
    const params = {
        Bucket: "marketplacesg", 
        Delete: {
            Objects: deleteObjs, 
            Quiet: false
        }
       }
       s3.deleteObjects(params, function(err, data) {
            if (err) console.log(err); // an error occurred
            else     console.log(data);           // successful response
       });
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

const makeCart = (cart) => cart.map(ele=>{
    const item ={
        price_data:{
            currency: 'sgd',
            product_data: {
            name: ele.title,
            // images: ['https://i.imgur.com/EHyR2nP.png'],
            },
            unit_amount: parseInt(ele.price*100),
        },
        quantity: parseInt(ele.qty)
    }
    console.log('make line item',item)
    return item

})

const makeOrder = (user,session,cart)=>{
    return {
        user:user,
        session_id:session.id,
        payment_status:session.payment_status,
        order:cart,
        timestamp: new Date()
    }
}

const makeSession = (user,session,token)=>{
    return{
        user:user,
        session_id:session.id,
        token:token,
        timestamp:new Date()
    }
}

const getBalance = (stripe)=>{
    
    return new Promise((res, rej) => {
        stripe.balance.retrieve((err, balance)=> {
            if(err)
                rej(err)
            res(balance)
          })
    })
    
}

module.exports = {bulkDelete,makeSession,makeOrder,makeItem,putObject,uploadFiles,summariseData,makeCart,getBalance}