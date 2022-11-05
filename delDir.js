const fs = require("fs");
fs.rm(process.argv[2], { recursive: true, force: true }, (err) => {
  if (err) throw err;
  return console.log(`Folder "${process.argv[2]}" has been deleted`);
});