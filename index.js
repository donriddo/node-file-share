#!/usr/bin/env node

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const EJS = require('ejs');
const program = require('commander');

let rootFolder;
let port;
const mimeTypes = {
  '.js': 'text/javascript',
  '.html': 'text/html',
  '.css': 'text/css'
}
program.arguments('<folder>').option(
  '-p, --port <port>', 'The PORT to serve files on'
).action((folder) => {

  fs.realpath(folder, (err, resolvedPath) => {
    if (err) {
      console.log('There was an error reading the directory specified');
      console.log('Path ' + folder + ' does not exist');
      console.log(err);
      process.exit();
    } else {
      rootFolder = resolvedPath;
      console.log('File Server Root Folder: ', rootFolder);
    }
  });
  port = program.port || 1994;

}).parse(process.argv);



function serveStatic(file, req, res) {
  console.log('File Requested: ', file);
  fs.exists('public/' + file, exists => {
    if (!exists) {
      res.writeHead(404);
      return res.end(
        file + ' Not Found'
      );
    } else {
      fs.readFile('public/' + file, 'utf-8', (err, staticFile) => {
        if (err) {
          res.writeHead(500);
          return res.end('Error reading File')
        } else {
          res.writeHead(
            200,
            {
              'Content-type': mimeTypes[path.extname(file)] || ''
            }
          );
          return res.end(staticFile);
        }
      });
    }
  });
}

function serveFile(fileName, req, res, download) {
  console.log('File Name Requested: ', fileName);
  if (download === '1') {
    res.writeHead(200, { 'Content-disposition': 'attachment; filename=' + fileName.split('/').pop() });
    return fs.createReadStream(fileName).pipe(res);
  } else {
    fs.readFile(fileName, (err, file) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error while reading File: ' + fileName);
      } else {
        res.writeHead(200);
        return res.end(file);
      }
    });
  }
}

function serveDir(dirName, req, res, download) {
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
    serveDir(
      rootFolder + '/' + query.dir.replace(/\.\./g, ''),
      req,
      res,
      query.download
    );
  } else if (query.file) {
    serveFile(
      rootFolder + '/' + query.file.replace(/\.\./g, ''),
      req,
      res,
      query.download
    );
  } else {
    let lookup = url.parse(decodeURI(req.url)).pathname;
    lookup = path.normalize(lookup);
    lookup === '/' ? serveDir(rootFolder, req, res) : serveStatic(lookup, req, res);
  }
}).listen({ port: port }, () => {
  console.log('####################################################');
  console.log('File Server Launched at your localhost:' + port);
  console.log(
    `\nYou can start sharing on your network with IP Address: ${require('ip').address()}:${port}\n`
  );
  console.log('####################################################');
});
