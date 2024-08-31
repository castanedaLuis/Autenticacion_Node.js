import express from "express";
import { PORT } from "./config.js";
import { UserRepository } from "./user-repository.js";

const app = express()
app.use(express.json())

app.post('/login', async (req,res)=>{
    const { username, password } = req.body
    try {
        const user = await UserRepository.login({username, password})
        res.json({message:"Login seccesful", user})
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

app.post('/logout',(req,res)=>{})

app.post('/protected',(req,res)=>{})




app.get('/', (req, res)=>{
    res.send('API Auth with Node!!')
})

app.listen(PORT, () =>{
    console.log('server running on port : ' + PORT);
    
})