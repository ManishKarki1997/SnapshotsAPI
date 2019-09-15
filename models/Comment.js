const mongoose=require('mongoose');

const schema=mongoose.Schema({
    comment:{
        type:String,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    commentedDate:{
        type:Date,
        default:Date.now()
    },
    snap:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Snap'
    },
    edited:{
        type:Boolean,
        default:false
    }
})

module.exports=mongoose.model('Comment',schema);