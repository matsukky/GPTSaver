const JSZip = require("jszip"), fs = require('fs'), path = require('path');

const chromeFiles = [{origin: 'background.chrome.js', name: 'background.js'}, 'gptsaver.js', {origin: 'manifest.chrome.json', name: 'manifest.json'}, 'filesInfo.json'];
const firefoxFiles = [{origin: 'background.firefox.html', name: 'background.html'}, 'gptsaver.js', {origin: 'manifest.firefox.json', name: 'manifest.json'}, 'filesInfo.json'];

function create(rootFiles, name) {
  const zip = new JSZip();
  for (const file of rootFiles) {
    let name = typeof file == "object" ? file.name : file
    let source  = typeof file == "object" ? file.origin : file
    zip.file(name, fs.readFileSync(path.join(__dirname, source)));
  }
  const dirsToZip = ['modules', 'assets'];

  for (const dir of dirsToZip) {
    const dirPath = path.join(__dirname, dir);
    if (fs.existsSync(dirPath)) {
      const files = getAllFilesFromDir(dirPath);
      for (const file of files) {
        const relativePath = path.relative(dirPath, file);
        zip.file(`${dir}/${relativePath}`, fs.readFileSync(file));
      }
    }
  }

  zip
  .generateNodeStream({type:'nodebuffer',streamFiles:true})
  .pipe(fs.createWriteStream(`${name}.zip`))
  .on('finish', function () {
      console.log(`${name}.zip written.`);
      fs.readFile(`${name}.zip`, function (err, data) {
        if (err) throw err;
  
        JSZip.loadAsync(data).then(function (zip) {
          zip.forEach(function (relativePath, zipEntry) {
            if (!zipEntry.dir) {
              zipEntry.async('nodebuffer').then(function (content) {
                const extractedFilePath = `ext/${name}/${relativePath}`;
                fs.mkdirSync(extractedFilePath.substring(0, extractedFilePath.lastIndexOf('/')), { recursive: true });
                fs.writeFileSync(extractedFilePath, content);
              });
            }
          });
          console.log('Contenu du zip extrait.');
        })
      })
        
  });


  function getAllFilesFromDir(dirPath, fileTypes = []) {
    return fs.readdirSync(dirPath).reduce((files, file) => {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        return files.concat(getAllFilesFromDir(filePath, fileTypes));
      } else if (fileTypes.length === 0 || fileTypes.includes(path.extname(filePath))) {
        return files.concat(filePath);
      } else {
        return files;
      }
    }, []);
  }
}

create(chromeFiles, 'chrome')
create(firefoxFiles, 'firefox')
