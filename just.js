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
  const dimensions = 3500;
  const log = console.log;
  const fname = process.argv[2];
  const fillreplacecolor = process.argv[3] ? `#${process.argv[3]}` : null;

  const TEMP_FILE_APPEND = '_.svg';

  // init----------------------------->

  log(`reading ${fname}`);
  const data = FS.readFileSync(fname).toString();

  const oFnameSample1 = fname.replace('input', 'mine_output');
  log(`processing ${fname}`);

  log(`creating temp file 1 ${oFnameSample1}`);

  FS.writeFileSync(oFnameSample1, data.replace(/#ada9a9/gi, '#8510d8'));

  // canvas resizing ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  await loadImage(oFnameSample1).then(async (image) => {
    log(`canvas resizing ${fname}   ->`);

    log('image read');
    image.width = dimensions;
    image.height = dimensions;
    const canvas = createCanvas(dimensions, dimensions);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, dimensions, dimensions);
    log('image drawn on canvas');
    const png = canvas.toDataURL();

    // png to svg ----------------------->
    await png2svg({
      tracer: 'potrace',
      noCurveOptimization: true,
      input: png,
      optimize: true,
      turdSize: 0,
      optTolerance: 0.9,
      rangeDistribution: 'equal',
      color: 'black'
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
      let fillAllow = true;

      optimizedPaths.forEach((path, index) => {
        let temPath = '';

        if (index == paths.length - 1) {
          temPath = `<path class="line" d="${path.d}" fill-rule="${path['fill-rule']}" stroke ="${path.stroke}" fill="${path.fill}" />`;
        } else if (fillAllow == true) {
          fillAllow = false;
          temPath = `<path class="fill" d="${path.d}" fill-rule="${path['fill-rule']}" stroke ="${path.stroke}" fill="#ada9a9" />`;
        }
        if (temPath !== '') allPathsConcat += temPath;
      });

      console.log(`writing ${oFnameSample1}`);

      //if (fillreplacecolor != null) {
      //  allPathsConcat = allPathsConcat.replace(/#fff/gi, fillreplacecolor);
      //}
      //svg otpt
      FS.writeFileSync(
        oFnameSample1,
        prettier.xml(`<?xml version = "1.0" encoding = "UTF-8" standalone = "no" ?><svg xmlns:xlink="http://www.w3.org/1999/xlink"  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"  viewbox="0 0 100 100"   width="${dimensions}" height="${dimensions}" >
        ${allPathsConcat}
        </svg>`)
      );
    });
  });

  log(`done for ${fname}`);
})();
