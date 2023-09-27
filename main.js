require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express()
const port = process.env.PORT || 4000

// data base connection 
mongoose.connect(process.env.DB_URI,{useNewUrlParser: true, useUnifiedTopology:true,family:4});
const db = mongoose.connection;
db.on('error',(error)=>console.log(error));
db.once('open',()=>console.log('connected to the database'));


// middlewares
app.use(express.urlencoded({extended:false}));
app.use(express.json())

app.use(session(
    {
        secret:'my secret key',
        saveUninitialized:true,
        resave:false
    }
))

// middle ware for storing json messages
app.use((req,res,next)=>{
    res.locals.message = req.session.message
    delete req.session.message
    next();
})

// make upload folder as static
app.use(express.static("uploads"))

// set template engine
app.set('view engine','ejs')

// app.get('/',(req,res)=>{
//     res.send('Hello world')
// })

// routes prefix it will take care of all routes
app.use("",require('./routes/routes'))

app.listen(port,()=>{
    console.log(`The server is running at http://localhost:${port}`)
})
