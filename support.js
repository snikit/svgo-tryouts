const replaceInFiles = require('replace-in-files');

const options = {
  files: './input',

  from: /width="100%" height="100%"/g,
  to: 'width="2500" height="2500" viewbox="0 0 100 100"'
};

replaceInFiles(options)
  .then(({ changedFiles, countOfMatchesByPaths }) => {
    console.log('Modified files:', changedFiles);
    console.log('Count of matches by paths:', countOfMatchesByPaths);
    console.log('was called with:', options);
  })
  .catch((error) => {
    console.error('Error occurred:', error);
  });
