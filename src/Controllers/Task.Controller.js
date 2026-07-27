import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Task } from "../Models/Task.model.js";
import { Column } from "../Models/Column.model.js";
import { Board } from "../Models/Board.model.js";

const verifyBoardAccessHelper = async (boardId, user) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, "Board not found");
  }

  const isOwner = board.owner.toString() === user._id.toString();
  const isMember = board.members.some(memberId => memberId.toString() === user._id.toString());
  const isAdmin = user.role === "admin";

  if (!isOwner && !isMember && !isAdmin) {
    throw new ApiError(403, "Forbidden - Board access required");
  }
  return { board, isOwner, isAdmin };
};

const verifyBoardOwnerHelper = async (boardId, user) => {
  const { board, isOwner, isAdmin } = await verifyBoardAccessHelper(boardId, user);
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Forbidden - Board owner access required");
  }
  return board;
};

const getBoardIdFromColumn = async (columnId) => {
    const col = await Column.findById(columnId);
    if (!col) throw new ApiError(404, "Column not found");
    return col.board;
};

export const createTask = asyncHandler(async (req, res) => {
    const { title, description, priority, dueDate, position, column, assignedTo } = req.body;
    
    if (!title || !column) {
        throw new ApiError(400, "Title and column are required");
    }

    const boardId = await getBoardIdFromColumn(column);
    await verifyBoardOwnerHelper(boardId, req.user);

    let taskPosition = position;
    if (taskPosition === undefined || taskPosition === null) {
        const lastTask = await Task.findOne({ column }).sort({ position: -1 });
        taskPosition = lastTask ? lastTask.position + 1000 : 1000;
    }

    const task = await Task.create({
        title,
        description,
        priority,
        dueDate,
        position: taskPosition,
        column,
        createdBy: req.user._id,
        assignedTo: assignedTo || null
    });

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "fullName email profilePicTag");

    return res.status(201).json(new ApiResponse(201, populatedTask, "Task created successfully"));
});

export const getTasksByBoard = asyncHandler(async (req, res) => {
    const { boardId } = req.params;
    
    if (!boardId) throw new ApiError(400, "Board ID is required");

    await verifyBoardAccessHelper(boardId, req.user);

    const columns = await Column.find({ board: boardId });
    const columnIds = columns.map(c => c._id);

    const tasks = await Task.find({ column: { $in: columnIds } }).populate("assignedTo", "fullName email profilePicTag");

    return res.status(200).json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

export const updateTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    const task = await Task.findById(id);
    if (!task) throw new ApiError(404, "Task not found");

    const boardId = await getBoardIdFromColumn(task.column);
    const { isOwner, isAdmin } = await verifyBoardAccessHelper(boardId, req.user);

    const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();
    const canFullEdit = isOwner || isAdmin;

    if (!canFullEdit) {
        if (!isAssignee) {
            throw new ApiError(403, "You can only move tasks assigned to you");
        }
        
        // Non-owners can ONLY modify 'column' and 'position'
        const allowedKeys = ["column", "position"];
        const updateKeys = Object.keys(updates);
        const invalidKeys = updateKeys.filter(key => !allowedKeys.includes(key));
        
        if (invalidKeys.length > 0) {
            throw new ApiError(403, "Only the board owner can edit task details or assignment");
        }
    }

    // If moving to a different column, verify access to the new column's board
    if (updates.column && updates.column !== task.column.toString()) {
        const newBoardId = await getBoardIdFromColumn(updates.column);
        if (newBoardId.toString() !== boardId.toString()) {
            throw new ApiError(400, "Cannot move task to a different board");
        }
    }

    Object.assign(task, updates);
    await task.save();

    const populatedTask = await Task.findById(task._id).populate("assignedTo", "fullName email profilePicTag");

    return res.status(200).json(new ApiResponse(200, populatedTask, "Task updated successfully"));
});

export const deleteTask = asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const task = await Task.findById(id);
    if (!task) throw new ApiError(404, "Task not found");

    const boardId = await getBoardIdFromColumn(task.column);
    await verifyBoardOwnerHelper(boardId, req.user);

    await Task.findByIdAndDelete(id);

    return res.status(200).json(new ApiResponse(200, {}, "Task deleted successfully"));
});
