const debug = require('gulp-debug');
const gulpFile = require('gulp-file');
const plumber = require('gulp-plumber');
const jsonData = require('../lib/get-json-data');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const glob = util.expandGlob( options.Locations, ['Resources/Config/*.json'] );
	const downloadConfig = {
		Id: 'Config.json',
		Url: 'Config.json',
		Type: 'json'
	};

	return {
		preCompile: (done) => {
			done = util.log('PreCompile - Config', done);
			options.DownloadData.push( downloadConfig );

			const getConfigData = (callback) =>
				gulp.src( glob )
					.pipe( plumber() )
					.pipe( debug( { title: 'PreCompile - Config: Parse json files:', showFiles: false } ) )
					.pipe( jsonData( options.Config ) )
					.on( 'end', callback );

			gulp.series( getConfigData, (cb) => { cb(); done(); } )();
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Config', done);

			gulpFile( 'Config.json', JSON.stringify( options.Config ), { src: true } )
				.pipe( plumber() )
				.pipe( debug( { title: 'Copy - Config: Generate config files to build:', showFiles: false } ) )
				.pipe( gulp.dest( options.Target ) )
				.on( 'end', done );
		}
	}
}
