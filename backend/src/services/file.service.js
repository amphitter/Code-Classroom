const fs =
require("fs");

const readFileContent =
(filePath) => {

 return fs.readFileSync(
  filePath,
  "utf8"
 );

};

module.exports = {
 readFileContent
};