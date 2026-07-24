import mongoose, { Schema } from "mongoose";

const boardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [{
      type: Schema.Types.ObjectId,
      ref: "User",
      default: [],
    }],
  },
  { timestamps: true }
);

export const Board = mongoose.model("Board", boardSchema);