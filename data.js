const express = require('express');
const multer = require('multer');
const csvParser = require('csv-parser');
const fs = require('fs');
const uuid = require('uuid');

const app = express();
const port = 3000;

// Create a unique folder for each upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderName = uuid.v4();
    fs.mkdirSync(folderName);
    cb(null, folderName);
  },
  filename: (req, file, cb) => {
    cb(null, 'questions.csv');
  },
});

// Check if the uploaded file is a CSV file
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

app.post('/upload', upload.single('file'), (req, res) => {
  const folderName = req.file.destination;
  const filePath = `${folderName}/questions.csv`;

  // Process the CSV file
  const questions = processCsv(filePath);

  res.json({
    status: 'success',
    folderName: folderName,
    questions: questions,
  });
});

function processCsv(filePath) {
  // Read the CSV file and extract questions
  const questions = [];
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', (row) => {
      questions.push(row['question']); // Assuming the question is in a column named 'question'
    })
    .on('end', () => {
      console.log('CSV file successfully processed.');
    });

  return questions;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});










///////---------------
const UploadDocument = require("../models/uploadDocumentModel");
const path = require("path");

const uploadmediadata = async (req, res) => {
    try {
        const ProjectList_Id = req.body.ProjectList_Id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }

        const document = req.file;
        const originalFileName = document.originalname;
        const uniqueFileName = Date.now() + "-" + originalFileName;

        // Define the folder structure based on ProjectList_Id
        const folderPath = path.join(__dirname, '../public/document', ProjectList_Id.toString());

        // Create the folder if it doesn't exist
        if (!fs.existsSync(folderPath)) {
            fs.mkdirSync(folderPath);
        }

        const filePath = path.join(folderPath, uniqueFileName);

        // Move the file to the specified path
        fs.renameSync(document.path, filePath);

        // Save the file information in the database
        const uploadData = new UploadDocument({
            ProjectList_Id: ProjectList_Id,
            document: filePath  // Save the complete file path
        });

        const resultdata = await uploadData.save();

        return res.status(200).json({ success: true, message: "CSV file uploaded successfully", resultdata });
    } catch (error) {
        console.log(error.message);
        return res.status(400).json({ success: false, message: error.message });
    }
}

module.exports = {
    // other functions...
    uploadmediadata
};
