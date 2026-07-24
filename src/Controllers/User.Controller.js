import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/User.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
const generateAccessAndRefereshTokens=async(userid)=>
{
    try{

    const user=await User.findById(userid)
    const refreshToken=user.generateRefreshToken()
    const accessToken=user.generateAccessToken()
    user.refreshToken=refreshToken
    await user.save({ validateBeforeSave: false })
    return {accessToken,refreshToken}
    }
    catch(err)
    {
        throw new ApiError(500,"error while genarating tokkens ")
    }

}

const RegisterUser = asyncHandler(async (req, res) => {
    const { fullName, email, dob, password, profilepic } = req.body;

    if (
        [fullName, email, dob, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
        throw new ApiError(409, "User with email already exists");
    }

    const coverImageLocalPath = req.files?.profilePicTag?.[0]?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image file is required");
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    const user = await User.create({
        fullName,
        dob,
        profilePicTag: coverImage?.url || "",
        email,
        password,
        role: "user",
    });

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    const options = {
        httpOnly: true,
        secure: true
    };

    return res
        .status(201)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                201,
                { user: createdUser, accessToken, refreshToken },
                "User registered and logged in successfully"
            )
        );
});
const LoginUser = asyncHandler( async (req, res) => {
    const { email, password } = req.body;
    if (
        [email, password].some((field) => !field || field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }
 const existedUser = await User.findOne({
    $or: [{ email }]
    }).select("+password")   // ← add this
    if (!existedUser) {
        throw new ApiError(409, "User with email not found ")
        
    }
    const ispasswordcorrect=await existedUser.isPasswordCorrect(password)
    if(!ispasswordcorrect){
        throw new ApiError(409, "Password is incorrect ")
    }
    const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(existedUser._id)

    const loggedInUser = await User.findById(existedUser._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, dob } = req.body;

    if (!fullName || fullName.trim() === "") {
        throw new ApiError(400, "Full Name is required");
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                dob: dob ? new Date(dob) : req.user.dob,
            },
        },
        { new: true }
    ).select("-password -refreshToken");

    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "Account details updated successfully"));
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Both old and new passwords are required");
    }

    const user = await User.findById(req.user?._id).select("+password");

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");
    return res.status(200).json(new ApiResponse(200, users, "Users fetched successfully"));
});

const updateUserRole = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
        throw new ApiError(400, "Invalid role");
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { role } },
        { new: true }
    ).select("-password -refreshToken");

    if (!updatedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedUser, "User role updated successfully"));
});

const searchUsers = asyncHandler(async (req, res) => {
    const { email } = req.query;
    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email query parameter is required");
    }
    
    const users = await User.find({ email: { $regex: email, $options: "i" } })
        .select("_id fullName email profilePicTag")
        .limit(10);

    return res.status(200).json(new ApiResponse(200, users, "Users found successfully"));
});

const deleteUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
        throw new ApiError(400, "Admins cannot delete their own active account from the dashboard");
    }

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(new ApiResponse(200, {}, "User deleted successfully"));
});

export { RegisterUser, LoginUser, getCurrentUser, updateAccountDetails, changeCurrentPassword, getAllUsers, updateUserRole, searchUsers, deleteUser };

