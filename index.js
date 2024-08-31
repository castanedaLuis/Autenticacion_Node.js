import express from "express";
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser";
import { PORT, SECRET_JWT_KEY } from "./config.js";
import { UserRepository } from "./user-repository.js";

const app = express()
app.set('view engine', 'ejs')

app.use(express.json())
app.use(cookieParser())

//creamos un mildeware
app.use((req,res, next) =>{
    const token = req.cookies.access_token
    req.session = { user : null}
    try {
        const data = jwt.verify(token, SECRET_JWT_KEY)
        req.session.user = data
    } catch (error) {}

    //seguir a la sig ruta o mildleware
    next()
})

app.get('/', (req, res)=>{
    const { user } = req.session
    res.render('index',{name: user})   
})

app.post('/login', async (req,res)=>{
    const { username, password } = req.body
    try {
        const user = await UserRepository.login({username, password})
        const token = jwt.sign(
            { id:user._id , username:user.username}, 
            SECRET_JWT_KEY, 
            {
                expiresIn:'1h'
            }
        )

        res
        .cookie('access_token',token , {
            httpOnly:true, //la cookie solo puede ser accedida por el servidor
            secure: process.env.NODE_ENV === 'production', // la cookie solo se puede acceder por https
            sameSite: 'strict', // Que solo se pueda accerder desde el mismo dominio
            maxAge: 1000 * 60 *60 // la cookie solo tiene validez una hora (1h)
        })
        .json({message:"Login seccesful", user, token})
    } catch (error) {
        res.status(400).send(error.message)
    }
})

app.post('/register',(req,res)=>{
    const { username, password } = req.body

    try {
        const id = UserRepository.create({username,password})
        res.json({message:"Register seccesful", id})
    } catch (error) {
        console.error(error)
        res.status(400).send(error.message)
    }

})

app.post('/logout',(req,res)=>{
    const { user } = req.session
    res
    .clearCookie('access_token')
    .render('index',user)
})

app.post('/protected',(req,res)=>{
    const { user } = req.session
    if(!user){
        res.status(403).send('Access not authorized')
    }
    res.render('protected', user)
})



app.listen(PORT, () =>{
    console.log('server running on port : ' + PORT);
    
})