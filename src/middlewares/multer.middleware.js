import multer from "multer";

const storage = multer.diskStorage({
  // file parameter are in the hand of multer and it includes all our file information  and req is from user
  // callback cb function need two paramter 1: error handler which we specify as null and 2 is destination or directory in our folder structure to store the files
  destination: function (req, file, cb) {
    cb(null, "../public");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const uploadFileUsingMulter = multer({ storage: storage });
export { uploadFileUsingMulter };
