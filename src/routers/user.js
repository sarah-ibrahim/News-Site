const express = require('express')
const User = require('../models/user')
const router = new express.Router()
const auth = require('../middelware/auth')
const News = require("../models/news")
const multer = require('multer')



router.post('/signup',async (req,res)=>{
    try{
        const user = new User(req.body)
        await user.save()
        const token = await user.generateToken()
        res.status(200).send({user,token})

    }
   catch(e){
    res.status(400).send(e.message)
   }
})


router.post('/login',async(req,res)=>{
    try{
        const user = await User.findByCredentials(req.body.email,req.body.password)
        const token = await user.generateToken()
        const author = user._id
        const news = await News.find({author})
        res.status(200).send({user,news,token})
    }
    catch(e)
    {
        res.status(400).send(e.message)
    }
})


router.get('/profile', auth ,async(req,res)=>{
    res.status(200).send(req.user)
})



router.delete('/logout',auth,async(req,res)=>{
    try{
        
        req.user.tokens = req.user.tokens.filter((el)=>{
            return el !== req.token
        })
        await req.user.save()
        res.send('Logout Successfully')
    }
    catch(e){
        res.status(500).send(e)
    }
})


router.get('/profile/:id',auth,async(req,res)=>{
    
    try{
        const id = req.params.id
        const user = await User.findById(id)
        const token = await user.generateToken()
        const author = user.id
        console.log(author)
        const news = await News.find({author})
        if(!user){
            return res.status(404).send('No News is found')
        }
        res.status(200).send({user,news,token})
    }

    catch(e){
        res.status(500).send(e)
    }
    
})





router.patch('/profile/:id',auth,async(req,res)=>{
    try{
        const update = Object.keys(req.body)

        const user = await User.findById(req.params.id)
        if(!user){
            return res.status(404).send('No user is found')
        }

        update.forEach((el)=>(user[el]=req.body[el]))
        await user.save()
        res.status(200).send(user)
    }
    catch(e){
        res.status(400).send(e)
    }
})


router.delete('/profile/:id',auth,async(req,res)=>{
    try{
        const user = await User.findByIdAndDelete(req.params.id)
        if(!user){
            return res.status(404).send('No user is found')
        }
        res.status(200).send(user)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

const uploads =multer({
    limits:{
        fieldSize:1000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|jpge|png|jfif)$/)){
            cb(new Error('please upload image'))
        }
        cb(null,true)
    }
})

router.post('/profile/avatar',auth,uploads.single('avatar'), async(req,res)=>{
    try{
        req.user.avatar = req.file.buffer
        await req.user.save()
        res.send()
    }
    catch(e){
        res.status(500).send(e)
    }
})


module.exports = router