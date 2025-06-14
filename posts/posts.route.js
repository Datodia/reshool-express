const { Router } = require("express");
const postModel = require("../models/post.model");
const { isValidObjectId } = require("mongoose");


const postRouter = Router()
/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     example: "60d0fe4f5311236168a109ca"
 *                   title:
 *                     type: string
 *                     example: "Post Title"
 *                   content:
 *                     type: string
 *                     example: "Post content goes here."
 *                   author:
 *                     type: object
 *                     properties:
 *                       fullName:
 *                         type: string
 *                         example: "John Doe"
 *                       email:
 *                         type: string
 *                         example: "john.doe@example.com"
 */
postRouter.get('/', async (req, res) => {
    const posts = await postModel
        .find()
        .sort({ _id: -1 })
        .populate({ path: 'author', select: 'fullName email' })


    res.status(200).json(posts)
})

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Post Title"
 *               content:
 *                 type: string
 *                 example: "Post content goes here."
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "post created successfully"
 *       400:
 *         description: Bad request (missing fields)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "content is required"
 */
postRouter.post('/', async (req, res) => {
    const {content, title} = req.body
    if(!content) {
        return res.status(400).json({message:'content it requred'})
    }

    await postModel.create({content, title, author: req.userId})
    res.status(201).json({message: "post created successfully"})
})

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to retrieve
 *     responses:
 *       200:
 *         description: Post details returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   example: "60d0fe4f5311236168a109ca"
 *                 title:
 *                   type: string
 *                   example: "Post Title"
 *                 content:
 *                   type: string
 *                   example: "Post content goes here."
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "id is invalid"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "not found"
 */
postRouter.get('/:id', async (req, res) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).json({message: "id is invalid"})
    }

    const post = await postModel.findById(id)

    if(!post){
        return res.status(404).json({message: 'not dound'})
    }

    res.status(200).json(post)
})


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "post deleted successfully"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "id is invalid"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "you don't have permission"
 */
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

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Updated Post Title"
 *               content:
 *                 type: string
 *                 example: "Updated post content goes here."
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "post updated successfully"
 *       400:
 *         description: Invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "id is invalid"
 *       401:
 *         description: Unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "you don't have permission"
 */
postRouter.put('/:id', async (req, res) => {
    const {id} = req.params
    if(!isValidObjectId(id)){
        return res.status(400).json({message: "id is invalid"})
    }

    const post = await postModel.findById(id)

    if(post.author.toString() !== req.userId){
        return res.status(401).json({message: 'you dont have permition'})
    }

    const {title, content} = req.body

    await postModel.findByIdAndUpdate(id, {title, content}, {new: true})
    res.status(200).json({message: "post updated successfully"})
})

/**
 * @swagger
 * /posts/{id}/reactions:
 *   post:
 *     summary: Add reactions to a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the post to react to
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "like"
 *                 enum:
 *                   - like
 *                   - dislike
 *     responses:
 *       200:
 *         description: Reaction added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: "added successfully"
 *       400:
 *         description: Invalid reaction type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "wrong reaction type"
 */
postRouter.post('/:id/reactions', async (req, res) => {
    const id = req.params.id
    const {type} = req.body
    const supportReactionType = ['like', 'dislike']
    if(!supportReactionType.includes(type)){
        return res.status(400).json({error: "wrong reaction type"})
    }
    const post = await postModel.findById(id)

    const alreadyLikedIndex = post.reactions.likes.findIndex(el => el.toString() === req.userId)
    const alreadyDislikedIndex = post.reactions.dislikes.findIndex(el => el.toString() === req.userId)

    if(type === 'like'){
        if(alreadyLikedIndex !== -1){
            post.reactions.likes.splice(alreadyLikedIndex, 1)
        }else{
            post.reactions.likes.push(req.userId)
        }
    }
    if(type === 'dislike'){
        if(alreadyDislikedIndex !== -1){
            post.reactions.dislikes.splice(alreadyDislikedIndex, 1)
        }else{
            post.reactions.dislikes.push(req.userId)
        }
    }

    if(alreadyLikedIndex !== -1 && type === 'dislike'){
        post.reactions.likes.splice(alreadyLikedIndex, 1)
    }

     if(alreadyDislikedIndex !== -1 && type === 'like'){
        post.reactions.dislikes.splice(alreadyDislikedIndex, 1)
    }
   
    await post.save()
    res.send('added successfully')
})


module.exports = postRouter