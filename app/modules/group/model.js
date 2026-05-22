
 import mongoose from 'mongoose';
 
 const groupSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
        },
        members: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
 }, {
     versionKey: false,
 });
 
 const Group = mongoose.model('Group', groupSchema);
 
 export default Group;
 