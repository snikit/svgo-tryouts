(async () => {
  const FS = require('fs');
  const { createCanvas, loadImage } = require('canvas');
  const png2svg = require('svg-png-converter').png2svg;
  const DOMParser = require('dom-parser');
  const SVGO = require('svgo');
  const prettier = require('pretty-data').pd;

  const svgo = new SVGO({
    plugins: [
      {
        cleanupAttrs: true
      },
      {
        removeDoctype: true
      },
      {
        removeXMLProcInst: true
      },
      {
        removeComments: true
      },
      {
        removeMetadata: true
      },
      {
        removeTitle: true
      },
      {
        removeDesc: true
      },
      {
        removeUselessDefs: true
      },
      {
        removeEditorsNSData: true
      },
      {
        removeEmptyAttrs: true
      },
      {
        removeHiddenElems: true
      },
      {
        removeEmptyText: true
      },
      {
        removeEmptyContainers: true
      },
      {
        removeViewBox: true //changed
      },
      {
        cleanupEnableBackground: true
      },
      {
        convertStyleToAttrs: true
      },
      {
        convertColors: true
      },
      {
        convertPathData: true
      },
      {
        convertTransform: true
      },
      {
        removeUnknownsAndDefaults: true
      },
      {
        removeNonInheritableGroupAttrs: true
      },
      {
        removeUselessStrokeAndFill: false //changed
      },
      {
        removeUnusedNS: true
      },
      {
        cleanupIDs: false //changed
      },
      {
        cleanupNumericValues: true
      },
      {
        moveElemsAttrsToGroup: false //changed
      },
      {
        moveGroupAttrsToElems: true
      },
      {
        collapseGroups: false //changed
      },
      {
        removeRasterImages: false
      },
      {
        mergePaths: true
      },
      {
        convertShapeToPath: true
      },
      {
        sortAttrs: false //changed
      },
      {
        removeDimensions: false //Changed
      }
    ]
  });
  const parser = new DOMParser();
  const dimensions = 4000;
  const log = console.log;
  const fname = process.argv[2];
  const fillreplacecolor = process.argv[3] ? `#${process.argv[3]}` : null;

  const TEMP_FILE_APPEND = '_.svg';

  // init----------------------------->

  log(`reading ${fname}`);
  const data = FS.readFileSync(fname).toString();

  const oFnameSample2 = fname.replace('input', 'just_output').replace('.svg', TEMP_FILE_APPEND);
  log(`processing ${fname}`);

  log(`creating temp file 2 ${oFnameSample2}`);
  FS.writeFileSync(oFnameSample2, data);

  // canvas resizing ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  log(`reading temp file 2 ${oFnameSample2}`);
  const svgData = FS.readFileSync(oFnameSample2).toString();

  log(`plain svgo optimisation ${oFnameSample2}   ->`);
  svgo.optimize(svgData).then((optimizedSvg) => {
    FS.writeFileSync(oFnameSample2, prettier.xml(optimizedSvg.data));
  });

  FS.renameSync(oFnameSample2, oFnameSample2.replace(TEMP_FILE_APPEND, '.svg'));

  log(`done for ${fname}`);
})();
