const express = require("express")
const router = express.Router()
const User = require("../models/users")
const auth = require("../middleware/auth")
const multer  = require("multer")
const sharp = require("sharp")
const {sendWelcomeEmail, sendCancelEmail} = require('../email/acount')

router.post('/users', async (req, res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.GenerateAuthToken()
        res.status(201).send({user, token})
        
    } catch (e) {
        res.status(400).send(e.message)
    }
    // console.log(user)
    // user.save().then(() => {
    //     res.status(201).send(user)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

router.post('/users/login', async (req, res) => {
    try{
        const user = await User.FindByCredentials(req.body.email, req.body.password)
        const token = await user.GenerateAuthToken()
        res.send({user, token})
    }
    catch(e){
        res.status(400).send(e.message)
    }
})

router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token})
        await req.user.save()
        res.send("Logged Out")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send("Logged Out From All Sessions")
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/users/me',auth, async (req, res) => {
    try {
        res.send(req.user)
    } catch (e) {
        res.status(501).send(e)
    }

    // User.find({}).then((users) => {
    //     res.send(users)
    // }).catch((e) =>{
    //     res.status(501).send("Error with connecting to the Database")
    // })
})

router.get('/users/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const user = await User.findById(_id)
        if(!user){
            return res.status(400).send("User not found")
        }
        return res.send(user)
    } catch (e) {
        res.status(501).send("Error with connecting to the Database")
    }

    // User.findById(_id).then((user) => {
    //     if(user){
    //         return res.send(user)
    //     }
    //     else {
    //         return res.status(400).send("User not found")
    //     }
    // }).catch((e) => {
    //     res.status(501).send("Error with connecting to the Database")
    // })
})

router.patch('/users/me', auth,  async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ["name", "password"]
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    if(!isValidUpdate){
        return res.status(400).send("Invalid Updates!")
    }
    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await user.save()
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth,  async(req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.id)
        // if(!user){
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendCancelEmail(req.user.email, req.user.name)
        res.send({user: req.user, msg:"User Deleted"})
    } catch (e) {
        res.status(400).send(e)
    }
} )

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg or jpeg or png file'))
        }

        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({width:250, height:250}).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("Your Avatar has been uploaded successfully")
}, (e, req, res, next) => {
    res.status(400).send({
        error: e.message
    })
})

router.delete('/users/me/avatar', auth, async (req, res)=> {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        const userAvatar = user.avatar
        if(!user){
            throw new Error("Error with finding the user or the avatar")
        }
        res.set('Content-Type', 'image/jpg')
        res.send(userAvatar)
    } catch (e) {
        res.status(400).send(e.message)
    }
})

module.exports = router 
