<h1>Node.js: Csv to json parser</h1>

<h2>1. Link to the task</h2>

https://docs.google.com/document/d/15tyXbq8f1IeTWHHqPXXr8RJenX7a7RFaldXhomSlfgw/edit?pli=1&tab=t.0

<h2>2. How to run the app</h2>

- `git clone https://github.com/AlekseyYuriev/node.js-csv-to-json-parser.git` - clone the repository (HTTPS)
- `node -v` - check that you use node v.18
- `npm run generate` - to generate source.csv file based on mock.csv (generates a 10 GB csv file very fast)
- `npm run start` - for parsing source.csv file to result.json file (file recording takes about 10 minutes)

<h2>3. Additional features</h2>

It is also possible to provide a separator to the 'start' script adding '--separator ,', '--separator ;' or '--separator  '. But please check, that your mock.csv and generateCSV.js files use the same one.
