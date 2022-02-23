const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true  
    },
    email:{
        type:String,
        unique:true, 
        required:true,
        trim:true,
        lowercase:true, 
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid')
            }
        }
    },
    phone:{
        type:String,
        required:true,
        validate(value){
            let reg = new RegExp("^01[0-2-1-5]{1}[0-9]{8}");
            if(!reg.test(value)){
                throw new Error('invalid phone number')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true, 
        minLength:6
    } ,
    tokens:[
        {
            type:String,
            required:true

        }
    ],
    
    avatar:{
        type:Buffer
    }
})


userSchema.virtual('news',{
    ref:'News',
    localField:'_id',
    foreignField:'author'
})

userSchema.pre('save', async function(){
    const user = this
    if (user.isModified('password')){
    user.password = await bcrypt.hash(user.password,8)}
})



userSchema.statics.findByCredentials = async (email,password)=>{
    const user = await User.findOne({email})
    console.log(user)
    if(!user){
        throw Error ('unable to login ... check email or password')
    }
    const isMatch = await bcrypt.compare(password,user.password)
    if(!isMatch){
        throw Error ('unable to login ... check email or password')
    }
     return user
}

userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign({_id:user.id.toString()},'node')
    user.tokens = user.tokens.concat(token)
    await user.save()
    return token
}

const User = mongoose.model('User', userSchema)
module.exports = User