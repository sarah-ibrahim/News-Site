const express = require('express')
const app = express()
const port = process.env.PORT ||  5000
const userRouter = require('./routers/user')
const newsRouter = require('./routers/news')
require('./db/mongoose')

app.use(express.json())
app.use(userRouter)
app.use(newsRouter)

app.listen(port,()=>{
    console.log('Server is running')
})