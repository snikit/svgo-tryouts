(async () => {
  const FS = require('fs');
  const { createCanvas, loadImage } = require('canvas');
  const png2svg = require('svg-png-converter').png2svg;
  const DOMParser = require('dom-parser');
  const SVGO = require('svgo');
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
        removeViewBox: false
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
        removeUselessStrokeAndFill: true
      },
      {
        removeUnusedNS: true
      },
      {
        cleanupIDs: true
      },
      {
        cleanupNumericValues: true
      },
      {
        moveElemsAttrsToGroup: true
      },
      {
        moveGroupAttrsToElems: true
      },
      {
        collapseGroups: true
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
        sortAttrs: true
      },
      {
        removeDimensions: true
      }
    ]
  });
  const parser = new DOMParser();
  const comVariable = 2500;
  const log = console.log;
  const fname = process.argv[2];
  const TEMP_FILE_APPEND = '_.svg';

  // init----------------------------->

  log(`reading ${fname}`);
  const data = FS.readFileSync(fname).toString();

  const oFnameSample1 = fname.replace('input', 'output');
  const oFnameSample2 = fname.replace('input', 'output').replace('.svg', TEMP_FILE_APPEND);
  log(`processing ${fname}`);

  log(`creating temp file 1 ${oFnameSample1}`);
  FS.writeFileSync(oFnameSample1, data.replace(/#ffffff/gi, '#8510d8'));

  log(`creating temp file 2 ${oFnameSample2}`);
  FS.writeFileSync(oFnameSample2, data);

  // canvas resizing ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  await loadImage(oFnameSample1).then(async (image) => {
    log(`canvas resizing ${fname}   ->`);

    log('image read');
    image.width = comVariable;
    image.height = comVariable;
    const canvas = createCanvas(comVariable, comVariable);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, comVariable, comVariable);
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
      rangeDistribution: 'equal'
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

      console.log(`writing ${oFnameSample1}`);
      //svg otpt
      FS.writeFileSync(
        oFnameSample1,
        `<?xml version = "1.0" encoding = "UTF-8" standalone = "no" ?>
        <svg xmlns:xlink="http://www.w3.org/1999/xlink"  xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"   width="100%" height="100%" >
        ${allPathsConcat}
        </svg>
            `
      );

      log(`reading temp file 2 ${oFnameSample2}`);
      const svgData = FS.readFileSync(oFnameSample2).toString();

      log(`plain svgo optimisation ${oFnameSample2}   ->`);
      svgo.optimize(svgData).then((optimizedSvg) => {
        FS.writeFileSync(oFnameSample2, optimizedSvg.data);
      });
    });
  });

  log(`comparing conversions`);
  const stat1 = FS.statSync(oFnameSample1);
  const stat2 = FS.statSync(oFnameSample2);

  log(`removing bigger output`);

  if (stat1.size < stat2.size) {
    FS.unlinkSync(oFnameSample2);
  } else {
    FS.unlinkSync(oFnameSample1);
    FS.renameSync(oFnameSample2, oFnameSample2.replace(TEMP_FILE_APPEND, '.svg'));
  }

  log(`done for ${fname}`);
})();
