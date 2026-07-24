import mongoose, { Schema } from "mongoose";

const columnSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    position: {
      type: Number,
      required: true, // used to spaced-out cols
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Column = mongoose.model("Column", columnSchema);