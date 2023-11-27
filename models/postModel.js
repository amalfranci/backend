import mongoose, { Schema } from "mongoose";

const postSchema = new mongoose.Schema({
  userId: { type: Schema.Types.ObjectId, ref: "Users" },
  description: { type: String },
  image: [{ type: String }],
  likes: [{ type: String }],
  comments: [{ type: Schema.Types.ObjectId, ref: "Comments" }],
  status: { type: String,  enum: ["blocked", "active",'pending'],default: "active" }, // Add the status field
},
{ timestamps: true });

const Posts = mongoose.model("Posts", postSchema);
export default Posts;
