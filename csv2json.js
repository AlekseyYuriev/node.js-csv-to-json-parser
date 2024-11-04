const fs = require("fs");
const readline = require("readline");
const { Transform, pipeline } = require("stream");

const args = process.argv.slice(2);

const sourceFileIndex = args.indexOf("--sourceFile");
const resultFileIndex = args.indexOf("--resultFile");
const separatorIndex = args.indexOf("--separator");

const sourceFile = sourceFileIndex >= 0 ? args[sourceFileIndex + 1] : null;
const resultFile = resultFileIndex >= 0 ? args[resultFileIndex + 1] : null;
let separator = separatorIndex >= 0 ? args[separatorIndex + 1] : null;

if (!sourceFile || !resultFile) {
  console.error(
    "Error: Both --sourceFile and --resultFile arguments are required."
  );
  process.exit(1);
}

const readStream = fs.createReadStream(sourceFile);
const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

let headers = "";
let isFirstObject = true;

const detectSeparator = (line) => {
  const separators = [",", ";", " "];
  const counts = separators.map((sep) => ({
    sep,
    count: line.split(sep).length - 1,
  }));
  counts.sort((a, b) => b.count - a.count);
  return counts[0].count > 0 ? counts[0].sep : ",";
};

const jsonStringTransform = new Transform({
  transform(chunk, encoding, callback) {
    const jsonObj = {};

    if (headers === "") {
      headers = chunk.toString();
      return callback();
    }

    if (!separator) {
      separator = detectSeparator(headers);
    }

    headers.split(separator).forEach((item) => (jsonObj[item] = ""));

    try {
      chunk
        .toString()
        .split(separator)
        .filter((item) => item !== "")
        .forEach((item, index) => {
          jsonObj[Object.keys(jsonObj)[index]] = item;
        });
    } catch (err) {
      return callback(err);
    }

    const jsonString = JSON.stringify(jsonObj);
    if (isFirstObject) {
      this.push("[\n" + jsonString);
      isFirstObject = false;
    } else {
      this.push(",\n" + jsonString);
    }

    callback();
  },
});

const writeStream = fs.createWriteStream(resultFile);

pipeline(rl, jsonStringTransform, writeStream, (err) => {
  if (err) {
    console.error("Pipeline failed.", err);
  } else {
    fs.appendFile(resultFile, "\n]", (err) => {
      if (err) {
        console.error("Failed to write closing bracket.", err);
      } else {
        console.log("Pipeline succeeded.");
      }
    });
  }
});
