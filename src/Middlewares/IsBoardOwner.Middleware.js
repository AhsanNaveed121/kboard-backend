export const verifyBoardOwner = async (req, res, next) => {
  const { boardId } = req.params;
  const board = await Board.findById(boardId);

  if (!board) 
    return res.status(404).json({ message: "Board not found" });

  const isOwner = board.owner.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ message: "Only the board owner can perform this action." });
  }

  req.board = board; // Attach board to request for downstream controllers
  next();
};