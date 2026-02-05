import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import bcrypt from 'bcrypt';
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken =  user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({validateBeforeSave:false});
    return {accessToken:accessToken,refreshToken:refreshToken};
}
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, name } = req.body;
    if (!username || !email || !password || !name) {
      throw new ApiError(400, "All fields are required!");
    }
    const existedUser = await User.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      throw new ApiError(409, "User already existed");
    }
    const user = await User.create({
      username: username.toLowerCase(),
      name,
      email,
      password,
    });
    await user.save();
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(
        500,
        "Something went wrong while registering a a user"
      );
    }
    return res
      .status(201)
      .json(
        new ApiResponse(201, { createdUser }, "User successfully registered")
      );
  } catch (error) {

    next(error);
  }
};

const loginUser = async (req,res,next) => {
    try {
        const {username,email,password} = req.body;
        
        if (!username && !email) {
            throw new ApiError(400,"Email or Username is required");
        }

        const user = await User.findOne(
            {
                $or:[
                    {username}, 
                    {email}
                ]
            });

        if (!user) {
            throw new ApiError(404,"user does not exist");
        }

        const isValidPassword = await user.isPasswordCorrect(password);

        if (!isValidPassword) {
            throw new ApiError(401,"Invalid credentials");
        }
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id);

        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

        const options = {
            httpOnly:true,
            secure:true,
        }
        return res
        .status(200)
        .cookie("accessToken",accessToken,options)
        .cookie("refreshToken",refreshToken,options)
        .json(new ApiResponse(200,
            {user:loggedInUser,accessToken,refreshToken},
            "User successfully loggedIn")
        );
    } catch (error) {
        next(error);
    }
}
export { registerUser,loginUser };
