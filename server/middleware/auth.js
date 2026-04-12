//Middleware to protect routes that require authentication

export const protectRoute=async(req,res,next)=>{
    try{
        // Token decode hua
        //  User ID nikla
        // DB se user mil gaya
        const token=req.headers.token
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.userId).select("-password") //to get the user data from the database and exclude the password field
        if(!user){
            return res.status(401).json({message:"user not found"})
        }
//if user is found, then attach the user data to the request object and call the next (next can be controller function or the route handler or middleware function)
        req.user=user
        next()
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}