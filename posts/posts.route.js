const { Router } = require("express");
const postModel = require("../models/post.model");
const { isValidObjectId } = require("mongoose");


const postRouter = Router()

postRouter.get('/', async (req, res) => {
    const posts = await postModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: 'author', select: 'fullName email' })


    res.status(200).json(posts)
})

postRouter.post('/', async (req, res) => {
    const {content} = req.body
    if(!content) {
        return res.status(400).json({message:'content it requred'})
    }

    await postModel.create({content, author: req.userId})
    res.status(201).json({message: "post created successfully"})
})

postRouter.delete('/:id', async (req, res) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).json({message: "id is invalid"})
    }

    const post = await postModel.findById(id)

    if(post.author.toString() !== req.userId){
        return res.status(401).json({message: 'you dont have permition'})
    }

    await postModel.findByIdAndDelete(id)
    res.status(200).json({message: "post deleted successfully"})
})


module.exports = postRouter