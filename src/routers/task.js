const express = require("express")
const router = express.Router()
const auth = require('../middleware/auth')
const Task = require("../models/tasks")

router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    // task.save().then(() => {
    //     res.status(201).send(task)
    // }).catch((e) => {
    //     res.status(400).send(e)
    // })
})

router.get('/tasks', auth, async (req, res) => {
    try {
        // const task = await Task.find({owner: req.user._id})
        const match = {}
        const sort = {}

        if(req.query.completed){
            match.completed = req.query.completed === 'true'
        }
        
        if(req.query.sortBy){
            const splittedString = req.query.sortBy.split('_')
            console.log(splittedString)
            sort[splittedString[0]] = splittedString[1] === 'desc' ? -1 : 1 
        }
        await req.user.populate({
            'path': 'tasks',
             match,
             options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
             }
        }).execPopulate()
        res.status(201).send(req.user.tasks)
    } catch (e) {
        res.status(400).send(e)
    }
    // Task.find({}).then((tasks) => {
    //     res.send(tasks)
    // }).catch((e) =>{
    //     res.status(501).send("Error with connecting to the Database")
    // })
})

router.get('/tasks/:id', auth,  async (req, res) => {
    const _id = req.params.id
    try {
        const task = await Task.findOne({_id, owner: req.user._id})
        if(!task){
            return res.status(404).send("Task not found")
        }
        res.send(task)
    } catch (e) {
        res.status(501).send("Error with connecting to the Database")
    }

    // Task.findById(_id).then((task) => {
    //     if(task){
    //         return res.send(task)
    //     }
    //     else {
    //         return res.status(400).send("Task not found")
    //     }
    // }).catch((e) => {
    //     res.status(501).send("Error with connecting to the Database")
    // })
})

router.patch('/tasks/:id', auth,async (req, res) => {
    const allowedUpdates = ["description","Completed"]
    const updates = Object.keys(req.body)
    const isValidUpdate = updates.every((update) => allowedUpdates.includes(update))
    
    if(!isValidUpdate){
        return res.status(400).send("Not Valid Updates!")
    }

    try {
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id})
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true})
        if(!task){
            return res.status(404).send("No task is found with that ID")
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.send(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id:req.params.id, owner: req.user._id})
        if(!task){
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
    
})

module.exports = router