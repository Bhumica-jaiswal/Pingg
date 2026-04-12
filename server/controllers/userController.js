import bcrypt from "bcryptjs" 
import {generateToken} from "../lib/utils.js";
import User from "../models/User.js";

//signup a new user
export const signup=async(req,res)=>{
    const{fullName,email,password,bio}=req.body
        try{
            if(!fullName || !email || !password){
                return res.status(400).json({message:"All fields are required"})
            }
            const user=await User.findOne({email})
            if(user){
                return res.status(400).json({message:"User already exists"})
            }
            //if not found , then create a new user by hashing the password and saving the user to the database
            const salt=await bcrypt.genSalt(10)
            const hashedPassword=await bcrypt.hash(password,salt)
            const newUser= await User.create({
                fullName, email, password:hashedPassword, bio
            })

            //create the token to authenticate the user
            const token=generateToken(newUser._id);
            res.status(201).json({
                success:true,
                userData:newUser,token,
                message:"User created successfully"
            })

            }catch(error){
            res.status(500).json({success:false,message: error.message })
        }
}

//controller function to login a user
export const login=async(req,res)=>{
    try{
        const{email,password}=req.body
        const userData=await User.findOne({email})
        const isPasswordCorrect= await bcrypt.compare(password,userData.password) //password is that pass that we are getting from user in req and userdata is db stored password
        if(!isPasswordCorrect){
            return res.status(400).json({message:"Invalid credentials"})
        }
        //if password is correct, then generate a token and send the user data and token to the client
        const token=generateToken(userData._id)
        res.status(200).json({
            success:true,
            userData,token,
            message:"User logged in successfully"
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });

    }
}