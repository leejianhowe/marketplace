const bcrypt = require('bcrypt');
const saltRounds = 10;

const testbcrypt = async () => {
    try {
        const hash = await bcrypt.hash('hello', saltRounds)

        const results = await bcrypt.compare('hello1', hash)
        console.log(results)
    } catch (err) {
        console.log(err)
    }
}

testbcrypt()