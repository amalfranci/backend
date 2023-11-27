import mongoose from "mongoose";



const dbConnection = async () => {
    
    try {

        const connection = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology:true,
        })
        console.log("DB connected Sucessfully")
        
    }
    catch (error)
    {
        console.log("DB error:"+error)
    }
}

export default dbConnection
