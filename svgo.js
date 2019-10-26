const FS = require('fs');
const { createCanvas, loadImage } = require('canvas');
const png2svg = require('svg-png-converter').png2svg;
const DOMParser = require('dom-parser');
const parser = new DOMParser();

var log = console.log;

const fname = process.argv[2];

log(`reading ${fname}`);
const data = FS.readFileSync(fname).toString();

const oFname = fname.replace('input', 'output');

FS.writeFileSync(oFname, data.replace(/#ffffff/gi, 'red'));
log(`processing ${fname}`);

loadImage(oFname).then((image) => {
  log('image read');
  image.width = 1000;
  image.height = 1000;
  const canvas = createCanvas(1000, 1000);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, 1000, 1000);
  log('image drawn on canvas');
  const png = canvas.toDataURL();

  // png to svg ----------------------->
  png2svg({
    tracer: 'potrace',
    noCurveOptimization: true,
    input: png
  }).then((buffer) => {
    const xmlDoc = parser.parseFromString(buffer.content, 'text/xml');
    const paths = xmlDoc.getElementsByTagName('path');

    const optimizedPaths = [];

    paths.forEach((path) => {
      optimizedPaths.push({
        d: path.getAttribute('d'),
        stroke: path.getAttribute('stroke'),
        fill: path.getAttribute('fill'),
        'fill-rule': path.getAttribute('fill-rule')
      });
    });

    let allPathsConcat = '';

    optimizedPaths.forEach((path, index) => {
      let temPath = '';

      if (index == paths.length - 1) {
        temPath = `<path class="line" d="${path.d}" fill-rule="${path['fill-rule']}" stroke ="${path.stroke}" fill="${path.fill}" />`;
      } else {
        temPath = `<path class="fill" d="${path.d}" fill-rule="${path['fill-rule']}" stroke ="${path.stroke}" fill="#fff" />`;
      }

      allPathsConcat += temPath;
    });

    console.log(`writing ${oFname}`);
    //svg otpt
    FS.writeFileSync(
      oFname,
      `<?xml version = "1.0" encoding = "UTF-8" standalone = "no" ?>
        <svg xmlns:xlink="http://www.w3.org/1999/xlink"  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"   width="100%" height="100%" >
        ${allPathsConcat}
        </svg>
            `
    );
  });
});
