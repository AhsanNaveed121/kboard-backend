import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { User } from "../Models/User.model.js";
import { Board } from "../Models/Board.model.js";
import { uploadOnCloudinary } from "../Utils/cloudinary.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
const CreateBoard = asyncHandler(async (req, res) => {
    const { name, description } = req.body;

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Board name is required");
    }

    const createdBoard = await Board.create({
        name: name.trim(),
        description: description ? description.trim() : "",
        owner: req.user._id
    });

    if (!createdBoard) {
        throw new ApiError(500, "Something went wrong while creating the board");
    }

    return res
        .status(201)
        .json(new ApiResponse(201, createdBoard, "Board created successfully"));
});

const GetBoard = asyncHandler(async (req, res) => {
    let query = {};
    if (req.user.role !== "admin") {
        query = { $or: [{ owner: req.user._id }, { members: req.user._id }] };
    }
    const boards = await Board.find(query)
        .sort({ createdAt: -1 })
        .populate("owner", "fullName email profilePicTag")
        .populate("members", "fullName email profilePicTag");

    return res.status(200).json(
        new ApiResponse(200, boards, "Boards fetched successfully")
    );
});

const GetBoardById = asyncHandler(async (req, res) => {
    const board = await Board.findById(req.params.id)
        .populate("owner", "fullName email profilePicTag")
        .populate("members", "fullName email profilePicTag");

    if (!board) {
        throw new ApiError(404, "Board not found");
    }

    return res.status(200).json(
        new ApiResponse(200, board, "Board fetched successfully")
    );
});

const UpdateBoard = asyncHandler(async (req, res) => {
    const { name, description } = req.body;
    const { id } = req.params;

    if (!name && !description) {
        throw new ApiError(400, "At least one field (name or description) is required to update");
    }

    const updatedBoard = await Board.findByIdAndUpdate(
        id,
        {
            $set: {
                ...(name && { name }),
                ...(description && { description })
            }
        },
        { new: true }
    ).populate("owner", "fullName email profilePicTag")
     .populate("members", "fullName email profilePicTag");

    return res.status(200).json(new ApiResponse(200, updatedBoard, "Board updated successfully"));
});

const DeleteBoard = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const { Column } = await import("../Models/Column.model.js");
    const { Task } = await import("../Models/Task.model.js");

    const columns = await Column.find({ board: id });
    const columnIds = columns.map(c => c._id);

    await Task.deleteMany({ column: { $in: columnIds } });
    await Column.deleteMany({ board: id });
    await Board.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Board deleted successfully"));
});

const addBoardMember = asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const board = req.board;

    const isAlreadyMember = board.members.some(
        id => (id._id ? id._id.toString() : id.toString()) === userId.toString()
    );

    if (isAlreadyMember) {
        throw new ApiError(400, "User is already a member of this board");
    }

    board.members.push(userId);
    await board.save();

    const updatedBoard = await Board.findById(board._id)
        .populate("owner", "fullName email profilePicTag")
        .populate("members", "fullName email profilePicTag");

    return res.status(200).json(new ApiResponse(200, updatedBoard, "Member added successfully"));
});

const removeBoardMember = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const board = req.board;

    board.members = board.members.filter(
        id => (id._id ? id._id.toString() : id.toString()) !== userId.toString()
    );
    await board.save();

    const { Column } = await import("../Models/Column.model.js");
    const { Task } = await import("../Models/Task.model.js");
    const columns = await Column.find({ board: board._id });
    const columnIds = columns.map(c => c._id);
    await Task.updateMany(
        { column: { $in: columnIds }, assignedTo: userId },
        { $set: { assignedTo: null } }
    );

    const updatedBoard = await Board.findById(board._id)
        .populate("owner", "fullName email profilePicTag")
        .populate("members", "fullName email profilePicTag");

    return res.status(200).json(new ApiResponse(200, updatedBoard, "Member removed successfully"));
});

const leaveBoard = asyncHandler(async (req, res) => {
    const board = req.board;
    const userId = req.user._id.toString();
    const ownerId = board.owner?._id ? board.owner._id.toString() : board.owner?.toString();

    if (ownerId === userId) {
        throw new ApiError(400, "Board owner cannot leave the board. You must transfer ownership or delete the board.");
    }

    board.members = board.members.filter(
        id => (id._id ? id._id.toString() : id.toString()) !== userId
    );
    await board.save();

    const { Column } = await import("../Models/Column.model.js");
    const { Task } = await import("../Models/Task.model.js");
    const columns = await Column.find({ board: board._id });
    const columnIds = columns.map(c => c._id);
    await Task.updateMany(
        { column: { $in: columnIds }, assignedTo: userId },
        { $set: { assignedTo: null } }
    );

    return res.status(200).json(new ApiResponse(200, {}, "Successfully left the board"));
});

export { CreateBoard, GetBoard, GetBoardById, UpdateBoard, DeleteBoard, addBoardMember, removeBoardMember, leaveBoard };