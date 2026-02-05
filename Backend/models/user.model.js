import mongoose,{Schema} from 'mongoose';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
const UserSchema = new Schema(
    {
        name:{
            type:String,
            required:true,

        },
        email:{
            type:String,
            unique:true,
            lowercase:true,
            trim:true,
            required:true,
        },
        username:{
            type:String,
            unique:true,
            lowercase:true,
            trim:true,
            required:true,        
            index:true,
        },
        password:{
            type:String,
            required:[true,"Password is required"],  
            minlength:7,      
        },
        refreshToken:{
            type: String,
        }
    },
    {
        timestamps:true
    }
)

UserSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password,10);
    next();
})

UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password,this.password);
}

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_SECRET_EXPIRY
        }
    )
}
UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_SECRET_EXPIRY
        }
    )
}
export const User = mongoose.model('User',UserSchema);

