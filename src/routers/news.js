const express = require('express')
const News = require('../models/news')
const router = new express.Router()
const auth = require('../middelware/auth')
const multer = require('multer')




router.post('/news',auth,async(req,res)=>{
    try{
        
        const news = new News({...req.body,author:req.user._id})
        await news.save()
        res.status(200).send(news)
    }
    catch(e){
        res.status(400).send(e)
    }
})



router.get('/news',auth,async(req,res)=>{
    try{
        const news = await News.find({})
        res.send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


router.get('/news/:id',auth,async(req,res)=>{
    const _id = req.params.id
    try{
        const news = await News.findOne({_id,author:req.user._id})
        if(!news){
            return res.status(404).send('No News are found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


router.patch('/news/:id',auth,async(req,res)=>{
    try{
        const _id =req.params.id
        const news = await News.findOneAndUpdate({_id,author:req.user._id},req.body,{
            new:true,
            runValidators:true
        })
        if(!news){
            res.status(404).send('No news are found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})


router.delete('/news/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOneAndDelete({_id,author:req.user._id})
        if(!news){
            res.status(404).send('No news are found')
        }
        res.status(200).send(news)
    }
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/userNews/:id',auth,async(req,res)=>{
    try{
        const _id = req.params.id
        const news = await News.findOne({_id,author:req.user._id})
        if(!news){
            return res.status(404).send('No news are found')
    }
    await news.populate('author')
    res.status(200).send(news.author)
}
    catch(e){
        res.status(500).send(e.message)
    }
})

router.get('/allnews',auth,async(req,res)=>{
    try{
        
    await req.user.populate('news')
    res.status(200).send(req.user.news)
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

router.post('/avatar/:id',auth,uploads.single('avatar'), async(req,res)=>{
    try{

        const news = await News.findById(req.params.id)
        if(!news){
            return res.status(404).send('No news are found')
    }
        news.avatar = req.file.buffer
        await news.save()
        res.status(200).send()
}
    
    catch(e){
        res.status(500).send(e)
    }
})

module.exports = router