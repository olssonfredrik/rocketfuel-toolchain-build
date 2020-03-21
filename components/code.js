const browserify = require('browserify');
const buffer = require('vinyl-buffer');
const plumber = require('gulp-plumber');
const vinylSourceStream = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const tsify = require('tsify');
const debug = require('gulp-debug');
const uglify = require('gulp-uglify-es').default;

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);

	return {
		preCompile: (done) => {
			done();
		},
		
		compile: (done) => {
			done = util.log('Compile - Code', done);
			browserify( {
					basedir: '.',
					debug: options.Debug,
					entries: [options.EntryPoint],
					cache: {},
					packageCache: {}
				} )
				.plugin( tsify, { global: true } )
				.bundle()
				.pipe( plumber() )
				.pipe( vinylSourceStream('RFApp.js') )
				.pipe( buffer() )
				.pipe( util.ifDebug( sourcemaps.init )( { loadMaps: true } ) )
				.pipe( util.ifDebug( sourcemaps.write )( './' ) )
				.pipe( util.ifRelease( uglify )() )
				.pipe( debug( { title: 'Compile - Code: write .js file(s) to scripts:', showFiles: false } ) )
				.pipe( gulp.dest( options.Target + 'Scripts/' ) )
				.on('end', done);
		},
		
		copy: (done) => {
			done();
		}
	}
}
