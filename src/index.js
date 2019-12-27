require('./db/mongoose')
const express = require('express')
const app = express()
const port = process.env.port
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log("Server is running on port: ", + port)
})

