const debug = require('gulp-debug');
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
			done = util.log('Copy - Resources', done);
			gulp.src( util.expandGlob( options.Locations, ['Resources/*.html', 'Resources/Files/**/*.*'] ) )
				.pipe( plumber() )
				.pipe( debug( { title: 'Copy - Resources: copy generic resource files to build:', showFiles: false } ) )
				.pipe( gulp.dest( options.Target ) )
				.on( 'end', done );
		}
	}
}
