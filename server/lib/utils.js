//function to genearte the token 
import jwt from "jsonwebtoken"

export const generateToken=(userId)=>{
    const token=jwt.sign({userId},process.env.JWT_SECRET)
    return token
}