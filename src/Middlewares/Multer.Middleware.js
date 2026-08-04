import multer from "multer";
import path from "path";
import os from "os";

// Use OS temp directory for serverless compatibility (Vercel has read-only filesystem except /tmp)
const tempDir = os.tmpdir();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, tempDir)
    },
    filename: function (req, file, cb) {
      // Add timestamp to prevent filename collisions in shared /tmp
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName)
    }
  })
  
export const upload = multer({ 
    storage, 
})