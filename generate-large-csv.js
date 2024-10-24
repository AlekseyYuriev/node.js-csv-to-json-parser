const fs = require("fs");
const path = require("path");
const { faker } = require("@faker-js/faker");

// function generateLargeCSV(outputFilePath) {
//   (async () => {
//     const writeStream = fs.createWriteStream(outputFilePath);

//     for (let i = 0; i < 1e8; i++) {
//       const overWatermark = writeStream.write([faker.word.words(4)].join(","));

//       if (!overWatermark) {
//         await new Promise((resolve) => writeStream.once("drain", resolve));
//       }
//     }

//     writeStream.end();
//   })();
// }

// const outputFilePath = path.join(__dirname, "large-output.csv");

// generateLargeCSV(outputFilePath);

// Function to calculate the size of the file
function getFileSizeInGB(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size / (1024 * 1024 * 1024); // Convert bytes to GB
}

// Function to generate a random row based on the header structure
function generateRandomRow(headers) {
  return headers.map(() => faker.word.words(1)).join(",") + "\n";
}

// Function to generate a large CSV file with memory optimization
function generateLargeCSV(mockFilePath, outputFilePath, sizeLimitGB = 10) {
  // Read the mock file to get the headers
  const mockFileContent = fs.readFileSync(mockFilePath, "utf8");
  const lines = mockFileContent.trim().split("\n");
  const headers = lines[0].split(",");

  const writeStream = fs.createWriteStream(outputFilePath);

  // Write headers to the new file
  writeStream.write(lines[0] + "\n");

  let fileSizeInGB = getFileSizeInGB(outputFilePath);
  let batchSize = 10000; // Number of rows written per batch

  function writeBatch() {
    let canContinue = true;
    for (let i = 0; i < batchSize && fileSizeInGB < sizeLimitGB; i++) {
      const randomRow = generateRandomRow(headers);
      canContinue = writeStream.write(randomRow);

      if (!canContinue) {
        // If the internal buffer is full, wait for it to drain
        writeStream.once("drain", writeBatch);
        return;
      }
    }

    // Update the file size after writing each batch
    fileSizeInGB = getFileSizeInGB(outputFilePath);

    // If file size limit is not reached, continue writing
    if (fileSizeInGB < sizeLimitGB) {
      setImmediate(writeBatch); // Avoid blocking the event loop
    } else {
      console.log(`File size has reached ${fileSizeInGB.toFixed(2)} GB`);
      writeStream.end(); // Close the stream
    }
  }

  writeBatch();
}

// Define paths to mock CSV and output file
const mockFilePath = path.join(__dirname, "mock.csv"); // Path to your mock CSV file
const outputFilePath = path.join(__dirname, "large-output.csv");

// Call the function to generate the CSV file
generateLargeCSV(mockFilePath, outputFilePath, 10); // 10 GB limit
