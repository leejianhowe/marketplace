const { MongoClient, ObjectId } = require('mongodb')
const MONGO_DB = 'test'
const MONGO_COL = 'items'
const MONGO_COL_ORDERS = 'old'
const MONGO_COL_USERS = 'users'
const MONGO_COL_SESSIONS = 'new'
// const MONGO_URL = 'mongodb://localhost:27017'
const MONGO_URI = `mongodb+srv://spaceman:${process.env.MONGO_PASS}@nosqldb.u0xa5.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`
const client = new MongoClient(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
async function test() {
    await client.connect()
    const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'local' },
        writeConcern: { w: 'majority' },
    }
    const mongoSession = client.startSession()
    
    try {
        await mongoSession.withTransaction(async () => {
            const insert1 = client.db(MONGO_DB).collection(MONGO_COL_ORDERS)
            const result1 = await insert1.insertOne(
                { old: 1 },
                { mongoSession }
            )
            const insert2 = client.db(MONGO_DB).collection(MONGO_COL_SESSIONS)
            throw new Error('new error')
            const result2 = await insert2.insertOne(
                { new: 2 },
                { mongoSession }
            )
        }, transactionOptions);
        // mongoSession.startTransaction(transactionOptions)
        
        // const result2 = null
        // console.log(result1)
        // console.log(result2)
        // mongoSession.commitTransaction()
        
    } catch (err) {
        // mongoSession.abortTransaction()
        console.log(err)
    } finally {
        mongoSession.endSession()
        client.close()
    }
}
test()
