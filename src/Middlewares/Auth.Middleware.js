import { ApiError } from "../Utils/ApiError.js";
import { asyncHandler } from "../Utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../Models/User.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request - Token missing");
    }

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid access token");
  }
});

export const verifyAdmin = asyncHandler(async (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Forbidden - Admins only");
  }
  next();
});

export const verifyBoardOwner = asyncHandler(async (req, res, next) => {
  const boardId = req.params.boardId || req.params.id || req.body.boardId;
  if (!boardId) throw new ApiError(400, "Board ID is missing");

  // Avoid circular dependency if possible, import Board locally or at the top
  const { Board } = await import("../Models/Board.model.js");
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, "Board not found");

  const ownerId = board.owner?._id ? board.owner._id.toString() : board.owner?.toString();
  const isOwner = ownerId === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, "Forbidden - Board owner or admin access required");
  }

  req.board = board;
  next();
});

export const verifyBoardAccess = asyncHandler(async (req, res, next) => {
  const boardId = req.params.boardId || req.params.id || req.body.boardId;
  if (!boardId) throw new ApiError(400, "Board ID is missing");

  const { Board } = await import("../Models/Board.model.js");
  const board = await Board.findById(boardId);
  if (!board) throw new ApiError(404, "Board not found");

  const ownerId = board.owner?._id ? board.owner._id.toString() : board.owner?.toString();
  const isOwner = ownerId === req.user._id.toString();
  const isMember = board.members.some(
    memberId => (memberId?._id ? memberId._id.toString() : memberId?.toString()) === req.user._id.toString()
  );
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isMember && !isAdmin) {
    throw new ApiError(403, "Forbidden - Board access required");
  }

  req.board = board;
  next();
});
