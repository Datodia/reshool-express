const { Router } = require("express");
const userModel = require("../models/user.model");


const userRouter = Router()

userRouter.get('/', async (req, res) => {
    const users = await userModel.find().sort({_id: -1})
    res.status(200).json(users)
})


module.exports = userRouter