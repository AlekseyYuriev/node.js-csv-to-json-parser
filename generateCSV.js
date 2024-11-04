const fs = require("fs");
const readline = require("readline");

function generateRandomNumberOfRows(separator, numberOfColumns, numberOfRows) {
  let row = "";
  for (let i = 0; i < numberOfColumns; i++) {
    row += `veryLongRandomWord${i}${separator}`;
  }
  return (row + "\n").repeat(numberOfRows);
}

async function readFirstLine(fileName) {
  const readStream = fs.createReadStream(fileName);

  const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    rl.close();
    readStream.close();
    return line;
  }
}

readFirstLine("CSV_Files/mock.csv").then((data) => {
  const largeCSVFile = "CSV_Files/source.csv";
  const separator = ",";
  const numberOfColumns = data.split(separator).length;
  const randomNumberOfRows = generateRandomNumberOfRows(
    separator,
    numberOfColumns,
    1000
  );

  fs.writeFileSync(largeCSVFile, data + "\n");

  let fileSize = fs.statSync(largeCSVFile).size;

  while (fileSize < 10 * 1024 * 1024 * 1024) {
    fs.appendFileSync(largeCSVFile, randomNumberOfRows);
    fileSize = fs.statSync(largeCSVFile).size;
  }
  console.log(
    "Source file has been generated with size: ",
    (fileSize / 1024 / 1024 / 1024).toFixed(2),
    " GB"
  );
});
