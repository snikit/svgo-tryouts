// base on shape sprite and use element structure of svgs

const { createCanvas, loadImage } = require('canvas');
const canvas = createCanvas(1000, 1000);
const ctx = canvas.getContext('2d');
const png2svg = require('svg-png-converter').png2svg;

const FS = require('fs');
const DOMParser = require('dom-parser');
const parser = new DOMParser();
const svgname = 'F219.svg';
const filepath = './' + svgname;
const useElementKey = 'use';
const svgMap = {};
const svg1keys = {
  sprite: 'sprite0',
  shape: 'shape0'
};

const svg2keys = {
  sprite: 'sprite1',
  shape: 'shape1'
};

const sprite0TransformGroupIndex = 2;
const sprite1TransformGroupIndex = 3;

function getSpriteGTransform(useGroup) {
  const xmlDoc = parser.parseFromString(useGroup, 'text/xml');
  const g = xmlDoc.getElementsByTagName('g')[0];
  return g.getAttribute('transform');
}

function getSvg(keys, spriteTransform, useElement) {
  return `<?xml version = "1.0" encoding = "UTF-8" standalone = "no" ?>
        <svg xmlns:xlink="http://www.w3.org/1999/xlink"  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 100 100"  width="1000px" height="1000px" >
            <defs>
            ${svgMap[keys.sprite].replace('xlink', `xlink:href="#${keys.shape}"`)}
            ${svgMap[keys.shape]}
            </defs>
            <g transform="${spriteTransform}">
            ${useElement.replace('xlink', `xlink:href="#${keys.shape}"`)}
            </g>
        </svg>
            `;
}

function getKey(g) {
  const id = g.getAttribute('id');
  return id ? id : useElementKey;
}

function getVal(g) {
  return g.outerHTML;
}

function svgCanvasPngToSvg(filename) {
  const promise = new Promise((res, rej) => {
    loadImage(filename).then(
      async (image) => {
        image.width = 1000;
        image.height = 1000;
        ctx.drawImage(image, 0, 0, 1000, 1000);

        const png = canvas.toDataURL();

        // png output
        FS.writeFileSync(`${filename}output.dataurl.txt`, png);

        let outputBuffer = await png2svg({
          tracer: 'potrace',
          noCurveOptimization: true,
          input: png
        });

        //svg otpt
        FS.writeFileSync(`${filename}_output.svg`, outputBuffer.content);
        // FS.writeFile(svgs.second, canvas.toDataURL(), function(err) {
        //   console.log(err);
        // });
        res('done');
      },
      (err) => {
        console.log(err);
        rej(err);
      }
    );
  });
  return promise;
}

FS.readFile(filepath, 'utf8', function(err, data) {
  if (err) {
    console.error(err);
    return;
  }

  const xmlDoc = parser.parseFromString(data, 'text/xml');
  const gs = xmlDoc.getElementsByTagName('g');
  gs.forEach((g) => {
    svgMap[getKey(g)] = getVal(g);
  });

  const useGroup = svgMap[useElementKey];
  const useElements = xmlDoc.getElementsByTagName('use');
  const spriteGTransform = getSpriteGTransform(useGroup);
  const firstSVGRaw = getSvg(svg1keys, spriteGTransform, useElements[sprite0TransformGroupIndex].outerHTML);
  const secondSVGRaw = getSvg(svg2keys, spriteGTransform, useElements[sprite1TransformGroupIndex].outerHTML);

  const svgs = { first: `1_${svgname}`, second: `2_${svgname}` };

  FS.writeFileSync(svgs.first, firstSVGRaw);
  FS.writeFileSync(svgs.second, secondSVGRaw);

  Promise.all([svgCanvasPngToSvg(svgs.second), svgCanvasPngToSvg(svgs.first)]).then(() => {
    console.log('done !!');
  });
});
