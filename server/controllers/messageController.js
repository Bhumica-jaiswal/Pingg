//get all users except logged in user

import Message from "../models/Message.js"

export const getUsersForSidebar=async(req,res)=>{
    try{
        const userId=req.user._id
        const filteredUsers=await User.find({_id:{$ne:userId}}).select("-password")
         //to get all users except the logged in user and select only the fullName and profilePic fields to send to the client
         //count no of messages not seen
         const unseenMessages={}
         const promises=filteredUsers.map(async(user)=>{
            const messages=await Message.find({senderId:user._id,receiverId:userId,seen:false})
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
        const myId=req.user._id
        const messages=await Message.find({
            $or:[
                {senderId:myId,receiverId:selectedUserId},
                {senderId:selectedUserId,receiverId:myId}       
            ]
        })

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