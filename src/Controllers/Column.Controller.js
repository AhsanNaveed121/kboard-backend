import { asyncHandler } from "../Utils/asyncHandler.js";
import { ApiError } from "../Utils/ApiError.js";
import { ApiResponse } from "../Utils/ApiResponse.js";
import { Column } from "../Models/Column.model.js";
import { Board } from "../Models/Board.model.js";
import { Task } from "../Models/Task.model.js";

/**
 * Helper to check if a user has access to a board (owner, member, admin)
 */
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
  return board;
};

/**
 * Helper to check if a user is the owner (or admin) of a board
 */
const verifyBoardOwner = async (boardId, user) => {
  const board = await Board.findById(boardId);
  if (!board) {
    throw new ApiError(404, "Board not found");
  }
  const isOwner = board.owner.toString() === user._id.toString();
  const isAdmin = user.role === "admin";
  
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Forbidden - Board owner access required");
  }
  return board;
};


const createColumn = asyncHandler(async (req, res) => {
  const { title, position } = req.body;
  const boardId = req.params.boardId || req.body.boardId || req.body.board;

  if (!title || title.trim() === "") {
    throw new ApiError(400, "Column title is required");
  }

  if (!boardId) {
    throw new ApiError(400, "Board ID (tableId) is required");
  }

  // Ensure user has access to the target board
  await verifyBoardOwner(boardId, req.user);

  // If position is not specified, calculate next spaced position (e.g., 1000, 2000, 3000...)
  let colPosition = position;
  if (colPosition === undefined || colPosition === null) {
    const lastCol = await Column.findOne({ board: boardId }).sort({ position: -1 });
    colPosition = lastCol ? lastCol.position + 1000 : 1000;
  }

  const column = await Column.create({
    title: title.trim(),
    position: colPosition,
    board: boardId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, column, "Column created successfully"));
});


const createDefaultColumns = asyncHandler(async (req, res) => {
  const { boardId, titles } = req.body;
  const targetBoardId = req.params.boardId || boardId;

  if (!targetBoardId) {
    throw new ApiError(400, "Board ID (tableId) is required");
  }

  await verifyBoardOwner(targetBoardId, req.user);

  const columnTitles = Array.isArray(titles) && titles.length > 0
    ? titles
    : ["To Do", "In Progress", "Done"];

  const columnDocs = columnTitles.map((title, index) => ({
    title: title.trim(),
    position: (index + 1) * 1000,
    board: targetBoardId,
  }));

  const createdColumns = await Column.insertMany(columnDocs);

  return res
    .status(201)
    .json(new ApiResponse(201, createdColumns, "Default columns created successfully"));
});


const getColumnsByBoard = asyncHandler(async (req, res) => {
  const boardId = req.params.boardId || req.query.boardId;

  if (!boardId) {
    throw new ApiError(400, "Board ID (tableId) is required");
  }

  await verifyBoardAccessHelper(boardId, req.user);

  const columns = await Column.find({ board: boardId }).sort({ position: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, columns, "Columns fetched successfully"));
});


const updateColumn = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, position } = req.body;

  if (!title && position === undefined) {
    throw new ApiError(400, "At least one field (title or position) is required to update");
  }

  const column = await Column.findById(id);
  if (!column) {
    throw new ApiError(404, "Column not found");
  }

  // Check board ownership
  await verifyBoardOwner(column.board, req.user);

  if (title !== undefined) column.title = title.trim();
  if (position !== undefined) column.position = position;

  await column.save();

  return res
    .status(200)
    .json(new ApiResponse(200, column, "Column updated successfully"));
});


const deleteColumn = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const column = await Column.findById(id);
  if (!column) {
    throw new ApiError(404, "Column not found");
  }

  await verifyBoardOwner(column.board, req.user);

  // Delete all tasks in this column
  await Task.deleteMany({ column: id });

  // Delete column
  await Column.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Column and associated tasks deleted successfully"));
});

export {
  createColumn,
  createDefaultColumns,
  getColumnsByBoard,
  updateColumn,
  deleteColumn,
};
