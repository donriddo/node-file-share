const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const EJS = require('ejs');

let rootFolder;

fs.realpath(process.argv[2], (err, resolvedPath) => {
  if (err) {
    console.log('There was an error reading the directory specified');
    console.log('Path ' + process.argv[2] + ' does not exist');
    console.log(err);
    process.exit();
  } else {
    rootFolder = resolvedPath;
    console.log('File Server Root Folder: ', rootFolder);
  }
});
const port = process.argv[3] || 1994;

function serveDir(dirName, req, res) {
  let pathName = path.normalize(dirName);
  let baseName = pathName.substr(rootFolder.length + 1);
  console.log('Path Name Requested: ', pathName, 'Base Name: ', baseName);
  fs.exists(pathName, exists => {
    if (!exists) {
      res.writeHead(404);
      return res.end(
        'The path you requested does not exist or has been moved'
      );
    } else {
      fs.readdir(pathName, (err, data) => {
        if (err) {
          res.writeHead(500);
          return res.end('An error occured while trying to read DIR');
        } else {
          let files = [];
          data.forEach(datum => {
            if (fs.lstatSync(pathName + '/' + datum).isDirectory()) {
              files.push(
                {
                  type: 'dir',
                  path: baseName + '/' + datum,
                  name: datum
                }
              );
            } else {
              files.push(
                {
                  type: 'file',
                  path: baseName + '/' + datum,
                  name: datum
                }
              );
            }
          });
          fs.readFile('public/index.ejs', 'utf-8', (err, template) => {
            let html = EJS.render(template, { files: files });
            res.writeHead(200, { 'Content-type': 'text/html' });
            return res.end(html);
          });
        }
      });
    }
  });
}

http.createServer((req, res) => {
  let query = url.parse(decodeURI(req.url), true).query;
  if (query.dir) {
    console.log('Query: ', query);
    serveDir(rootFolder + '/' + query.dir.replace(/\./g, ''), req, res);
  } else if (query.file) {
    return res.end('Thanks for choosing a file');
  } else {
    serveDir(rootFolder, req, res);
  }
}).listen({ port: port }, () => {
  console.log('####################################################');
  console.log('File Server Launched at your localhost:' + port);
  console.log(
    `\nYou can start sharing on your network with IP Address: ${require('ip').address()}:${port}\n`
  );
  console.log('####################################################');
});