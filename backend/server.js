const express = require("express");
const multer = require("multer");
const app = express();
const db = require("./db");;

const PORT = 3000;

// Video Storage
const videoStorage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        cb(null, file.fieldname + "_" + req.body.filename);
    },
});


const videoUpload = multer({
    storage: videoStorage,
    limits: {
        fileSize: 15000000,     //15 MB
    }
});


app.post(
    "/uploadVideo",
    videoUpload.single("video"),
    (req, res) => {


        const videoPath = req.file.filename;

  //      console.log(req.getAllResponseHeaders());


        // Query to push video details into the db

        // NOTE: While it is possible to store the videos in the database,
        //       It is avoided as this task consumes a lot of resources and it would affect performance.


        var sql = "INSERT INTO videos (path) VALUES ('" + videoPath + "')";

        db.query(sql, function (err, result) {
            console.log(result);
            if (err)
                throw err;

        });
        res.send("video uploaded successfully");
    },
);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});