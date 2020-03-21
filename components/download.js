const debug = require('gulp-debug');
const gulpFile = require('gulp-file');
const plumber = require('gulp-plumber');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);

	return {
		preCompile: (done) => {
			done();
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Download', done);

			gulpFile( 'Download.json', JSON.stringify( options.DownloadData ), { src: true } )
				.pipe( plumber() )
				.pipe( debug( { title: 'Copy - Download: Generate Download.json file:', showFiles: false } ) )
				.pipe( gulp.dest( options.Target ) )
				.on( 'end', done );
		}
	}
}
