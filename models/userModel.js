import mongoose, { Schema } from "mongoose";

const userSchema = new mongoose.Schema({
    
    firstName: {
        type: String,
        required: [true, "First Name Required"]
    },
    lastName: {
        type: String,
        required: [true, "Last Name Required"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        
    },
    password: {

        type: String,
        required: [true, "Password is Required"],
        minlength: [6, "password length should be greater than 6 character"],
        select:true,
        
    },
    location: {
        type:String
        
    },
    profileUrl: {
        type:String
    },
    profession: {
        type:String
    },
    friends: [{ type: Schema.Types.ObjectId, ref: "Users" }],
    views: {
        type:String
    },
    verified: { type: Boolean, default: false },
     status: {
        type: String,
        enum: ["blocked", "unblocked"],
        default: "unblocked" 
    },
     account: {
        type: String,
        enum: ["public", "private"],
        default: "public"
    },

    
},
    {timestamps:true}

)
const Users = mongoose.model("Users", userSchema)
export default Users