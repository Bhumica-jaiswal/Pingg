import cloudinary from "../lib/cloudinary.js"
import Message from "../models/Message.js"
import {io,userSocketMap} from "../server.js"

//get all users except logged in user
export const getUsersForSidebar=async(req,res)=>{
    try{
        const userId=req.user._id
        const filteredUsers=await User.find({_id:{$ne:userId}}).select("-password")
         //to get all users except the logged in user and select only the fullName and profilePic fields to send to the client
         //count no of messages not seen
         const unseenMessages={}
         const promises=filteredUsers.map(async(user)=>{ //running a loop to get all the users and for each user we are counting the number of messages that are not seen by the logged in user and storing it in an object with the user id as the key and the number of unseen messages as the value
            const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false}) //finding all the messages where the sender id is the user id and the receiver id is the logged in user id and the seen field is false
            if(messages.length>0){
                unseenMessages[user._id]=messages.length
            }

         })
         await Promise.all(promises)
         res.status(200).json({
            success:true,
            users:filteredUsers,
            unseenMessages, 
        })
    } catch (error) {
        console.error("Error in getUsersForSidebar:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}

//get all messages from selected user
export const getMessages=async(req,res)=>{
    try{
        const {id:selectedUserId} = req.params
        const myId=req.user._id //your id from the protected route (middleware)
        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}       
            ]
        })
//to make messages seen when user opens the chat
        await Message.updateMany({
            senderId:selectedUserId,receiverId:myId
        } ,{seen:true})

            res.status(200).json({
            success:true,
            messages
        })
    } catch (error) {
        console.error("Error in getMessages:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })

    }
}

//api to mark messages as seen when user opens the chat with the sender using message id
export const markMessagesAsSeen=async(req,res)=>{
    try{
        const {id}=req.params //message id
        //  one specific message seen
        await Message.findByIdAndUpdate(id,{seen:true})
        res.status(200).json({
            success:true,
            message:"Message marked as seen"
        })  
    } catch (error) {
        console.error("Error in markMessagesAsSeen:", error);
        res.status(500).json({
            success:false,
            message:error.message
        })

    }
}

//send messaage to selected user yhi s krna hai 
export const sendMessage=async(req,res)=>{
    try{
        const{text,image}=req.body
        const senderId=req.user._id //logged in user id
        const receiverId=req.params.id //selected user id from the url

        let imageUrl;
        if(image){
            const uploadResponse= await cloudinary.uploader.upload(image)
            imageUrl=uploadResponse.secure_url
        }
        const newMessage=await Message.create({  //creating instance
            senderId,
            receiverId,
            text,
            image: imageUrl || undefined
        })

        //emit the new message to the receiver using socket.io
        const receiverSocketId=userSocketMap[receiverId]
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage)
        }

        res.status(201).json({
            success:true,
            message:"Message sent successfully"
        })
    } catch (error) {
        console.error("Error in sendMessage:", error);
        res.status(500).json({
            success:false,
            message:"Internal server error"
        })
    }
}