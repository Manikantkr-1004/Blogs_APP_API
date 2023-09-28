const express = require("express");
const { userModel } = require("../Model/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const {auth} = require("../Middleware/auth");
const { blogModel } = require("../Model/blogModel");

const allRouter = express.Router();

allRouter.post("/register",async(req,res)=>{
    const {username,avatar,email,password} =  req.body;

    let existUser = await userModel.findOne({email});
    try {
        if(!existUser){
            bcrypt.hash(password,5,async(err,hash)=>{
                if(err){
                    res.status(400).send({msg:"Something Went Wrong, Try again!"});
                    return;
                }
                let user = new userModel({username,avatar,email,password:hash});
                await user.save();
                res.status(201).send({msg:"Account Created Successfully!!"})
            })
        }else{
            res.status(400).send({msg:"Email Already Exists!!"})
        }
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.post("/login",async(req,res)=>{
    const {email,password} = req.body;
    let user = await userModel.findOne({email});
    try {
        if(user){
            bcrypt.compare(password,user.password,async(err,result)=>{
                if(result){
                    let token = jwt.sign({userId: user._id,username:user.username},"manikant");
                    res.status(200).send({msg:"Logged in Successfully!!",token});
                }else{
                    res.status(400).send({msg:"Your email or password is wrong!!"})
                }
            })
        }else{
            res.status(400).send({msg:"User doesn't Exists!!"})
        }
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.get("/blogs",auth,async(req,res)=>{
    const {title,category,sort,order} = req.query;
    try {
        let query = {};

        query.userId = req.body.userId;

        if(title!==""){
            query.title = {$regex: new RegExp(title,"i")}
        }

        if(category!==""){
            query.category = {$regex: new RegExp(category,"i")}
        }

        let sorting = {};
        if(sort!=="" && order!==""){
            let sortOrder = order==="asc"?1 : -1;
            sorting.sort = sortOrder;
        }

        let blog = await blogModel.find(query).sort(sorting);
        res.status(200).send({blog})
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.post("/blogs",auth,async(req,res)=>{
    try {
        let data = new blogModel(req.body);
        await data.save();
        res.status(200).send({msg:"Blog Created Successfully!!",data});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.patch("/blogs/:id",auth,async(req,res)=>{
    const {id} = req.params;
    try {
        let updateBlog = await blogModel.findByIdAndUpdate({_id:id,userId:req.body.userId},req.body);
        res.status(200).send({msg:"Blog Updated Successfully!!"});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.delete("/blogs/:id",auth,async(req,res)=>{
    const {id} = req.params;
    try {
        let deleteBlog = await blogModel.findByIdAndDelete({_id:id,userId:req.body.userId});
        res.status(200).send({msg:"Blog Deleted Successfully!!"});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.patch("/blogs/:id/like",auth,async(req,res)=>{
    const {id} = req.params;
    try {
        let blogs = await blogModel.findOne({_id:id});
        let value = blogs.likes+1;
        req.body = {...req.body,likes:value};
        let updateLike = await blogModel.findByIdAndUpdate({_id:id},req.body);
        res.status(200).send({msg:"Like Increased by 1"});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})

allRouter.patch("/blogs/:id/comment",auth,async(req,res)=>{
    const {id} = req.params;
    try {
        let blogs = await blogModel.findOne({_id:id});
        let value = {username:req.body.username,content:req.body.content};
        blogs.comments.push(value);

        let updateComment = await blogModel.findByIdAndUpdate({_id:id},blogs);
        res.status(200).send({msg:"Comments Published Successfully!!"});
    } catch (error) {
        res.status(500).send({msg:"Internal Server Error!!"})
    }
})



module.exports = {allRouter};