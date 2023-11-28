const express = require('express');

const app = express();
const path = require('path');
const  authRoutes= require('./router/authRoutes');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');

require('dotenv').config()
app.use(methodOverride('_method'));

app.set('view engine','ejs');
app.set("views",path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(authRoutes);
app.get('/portal',(req,res)=>{
    return res.render('portal')
})

app.listen(process.env.PORT,()=>{
    console.log(`server is listening at port ${process.env.PORT}`)
})
