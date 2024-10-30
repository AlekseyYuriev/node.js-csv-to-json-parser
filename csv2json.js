const fs = require("fs");
const readline = require("readline");
const { Transform, pipeline } = require("stream");

// console.log(process.argv[2]);
// const arr = ["--sourceFile", "D:source.csv",  "--resultFile", "D:\result.json"];
// const row = e.replace(/[\s]+[,]+|[,]+[\s]+/g, ',').trim();

const readStream = fs.createReadStream("./CSV_Files/source.csv");

const rl = readline.createInterface({
  input: readStream,
  crlfDelay: Infinity,
});

let headers = "";

const jsonStringTransform = new Transform({
  transform(chunk, encoding, callback) {
    const jsonObj = {};
    if (headers === "") {
      headers = chunk.toString();
      return callback();
    }

    headers.split(",").forEach((item) => (jsonObj[item] = ""));

    try {
      chunk
        .toString()
        .split(",")
        .filter((item) => item !== "")
        .forEach(
          (item, index) => (jsonObj[Object.keys(jsonObj)[index]] = item)
        );
    } catch (err) {
      return callback(err);
    }
    this.push(JSON.stringify(jsonObj) + "\n");
    callback();
  },
});

const writeStream = fs.createWriteStream("./CSV_Files/result.json");

pipeline(rl, jsonStringTransform, writeStream, (err) => {
  if (err) {
    console.error("Pipeline failed.", err);
  } else {
    console.log("Pipeline succeeded.");
  }
});
