'use strict';

const path = require('path');
const rollup = require('rollup');
const chokidar = require('chokidar');
const debounce = require('debounce');

const hasNullByte = string => string.includes('\u0000');

function createWatcher(emitter) {
  const files = new Map();
  const watch = chokidar.watch();

  const refreshFile = filePath => {
    /**
   * Had to go diving for this one...
   * not exactly Karma’s public facing API,
   * but appears to get the job done =)
   */
    const isPOSIX = path.sep === '/';
    filePath = isPOSIX ? filePath : filePath.replace(/\\/g, '/');
    emitter._fileList.changeFile(filePath, true);
  };

  const handleChange = path => {
    for (const [entry, dependencies] of files.entries()) {
      if (entry === path || dependencies.includes(path)) {
        return refreshFile(entry);
      }
    }
  };

  watch.on('change', debounce(handleChange, 150));

  return {
    add(entry, dependencies) {
      if (!hasNullByte(entry)) {
        const filteredDependencies = dependencies.filter(path => !hasNullByte(path));
        files.set(entry, filteredDependencies);
        watch.add([entry, ...filteredDependencies]);
      }
    }
  };
}

function createPreprocessor(preconfig, config, emitter, logger) {
  const cache = new Map();
  const log = logger.create('preprocessor.rollup');

  let watcher;
  if (!config.singleRun && config.autoWatch) {
    watcher = createWatcher(emitter);
  }

  return async function preprocess(original, file, done) {
    const originalPath = file.originalPath;
    const location = path.relative(config.basePath, originalPath);
    try {
      const options = Object.assign({}, config.rollupPreprocessor, preconfig.options, {
        input: originalPath,
        cache: cache.get(originalPath)
      });

      options.output = Object.assign({}, options.output);

      if (options.output.dir === undefined && options.output.file === undefined) {
        options.output.dir = path.dirname(originalPath);
      }

      const bundle = await rollup.rollup(options);
      cache.set(originalPath, bundle.cache);

      if (watcher) {
        const [entry, ...dependencies] = bundle.watchFiles;
        watcher.add(entry, dependencies);
      }

      log.info('Generating bundle for ./%s', location);
      const { output } = await bundle.generate(options.output);

      for (const result of output) {
        if (!result.isAsset) {
          const { code, map, facadeModuleId, fileName } = result;

          /**
      * processors that have alternate source file extensions
      * must make sure to use the file name output by rollup.
      */
          if (facadeModuleId && !hasNullByte(facadeModuleId)) {
            const { dir } = path.parse(originalPath);
            file.path = path.posix.join(dir, fileName);
          }

          file.sourceMap = map;

          const processed =
      options.output.sourcemap === 'inline'
        ? code + `\n//# sourceMappingURL=${map.toUrl()}\n`
        : code;

          return done(null, processed);
        }
      }
      log.warn('Nothing was processed.');
      done(null, original);
    } catch (error) {
      log.error('Failed to process ./%s\n\n%s\n', location, error.stack);
      done(error, null);
    }
  };
}

module.exports = {
  'preprocessor:rollup': [
    'factory',
    (factory => {
      factory.$inject = ['args', 'config', 'emitter', 'logger'];
      return factory;
    })(createPreprocessor)
  ]
};
