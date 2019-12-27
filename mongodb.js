const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID

const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

// const id = new ObjectID()
// console.log(id.id)
// console.log(id.toHexString())

MongoClient.connect(connectionURL, {useNewUrlParser: true,useUnifiedTopology: true }, (error, client) => {
    if(error){
        return console.log('Connection Failed')
    }
    const db = client.db(databaseName)
    // db.collection('users').insertOne({
    //     name: 'Ahmed',
    //     age: '22'
    // }, (error, result) => {
    //     if(error)
    //     return console.log("There is an error with the insertion")
    //     console.log(result.ops)
    // })

    db.collection('users').find({name: 'Karim'}).toArray( (error, users) =>{
        if(error)
        console.log("Error with fetching data!")
        console.log(users)
    })
})