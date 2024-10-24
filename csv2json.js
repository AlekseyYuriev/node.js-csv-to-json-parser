const fs = require("fs");
const { Transform } = require("stream");
const path = require("path");

const args = process.argv.slice(2);

let sourceFile = "";
let resultFile = "";
let separator = "auto-detect";

args.forEach((arg, index) => {
  if (arg === "--sourceFile") {
    sourceFile = args[index + 1];
  } else if (arg === "--resultFile") {
    resultFile = args[index + 1];
  } else if (arg === "--separator") {
    separator = args[index + 1];
  }
});

if (!resultFile) {
  resultFile = sourceFile.replace(".csv", ".json");
}

if (!sourceFile) {
  console.error("Error: --sourceFile argument is required");
  process.exit(1);
}

function detectSeparator(data) {
  const possibleSeparators = [",", ";", "\t", "|", " "];
  const counts = possibleSeparators.map((sep) => data.split(sep).length - 1);
  const maxCount = Math.max(...counts);
  return possibleSeparators[counts.indexOf(maxCount)];
}

class CSVToJSONTransform extends Transform {
  constructor(separator) {
    super({ readableObjectMode: true, writableObjectMode: true });
    this.separator = separator;
    this.headers = null;
  }

  _transform(chunk, encoding, callback) {
    const line = chunk.toString().trim();
    if (!this.headers) {
      if (!this.separator) {
        this.separator = detectSeparator(line);
      }
      this.headers = line.split(this.separator);
    } else {
      const values = line.split(this.separator);
      const obj = this.headers.reduce((acc, header, index) => {
        acc[header.trim()] = values[index].trim();
        return acc;
      }, {});
      this.push(JSON.stringify(obj) + "\n");
    }
    callback();
  }
}

const readStream = fs.createReadStream(sourceFile, "utf8");
const writeStream = fs.createWriteStream(resultFile, "utf8");
const transformStream = new CSVToJSONTransform(
  separator === "auto-detect" ? null : separator
);

readStream
  .on("error", (err) => console.error("Error reading source file:", err))
  .pipe(transformStream)
  .on("error", (err) => console.error("Error during transformation:", err))
  .pipe(writeStream)
  .on("finish", () => console.log("CSV file successfully converted to JSON."))
  .on("error", (err) => console.error("Error writing result file:", err));

if (!fs.existsSync(sourceFile)) {
  console.error("Error: Source file does not exist:", sourceFile);
  process.exit(1);
}

writeStream.on("error", (err) => {
  console.error("Error writing to the result file:", err);
  process.exit(1);
});
