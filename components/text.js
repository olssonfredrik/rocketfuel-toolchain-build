const debug = require('gulp-debug');
const gulpFile = require('gulp-file');
const plumber = require('gulp-plumber');
const jsonData = require('../lib/get-json-data');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const glob = util.expandGlob( options.Locations, ['Resources/Text/*.json'] );
	const downloadText = {
		Id: 'Text.json',
		Url: 'Text.json',
		Type: 'json'
	};
	options.Text = options.Text || {};

	return {
		preCompile: (done) => {
			done = util.log('PreCompile - Text', done);
			options.DownloadData.push( downloadText );

			const getTextData = (callback) =>
				gulp.src( glob )
					.pipe( plumber() )
					.pipe( debug( { title: 'PreCompile - Text: Parse json files:', showFiles: false } ) )
					.pipe( jsonData( options.Text ) )
					.on( 'end', callback );

			gulp.series( getTextData, (cb) => { cb(); done(); } )();
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Text', done);

			gulpFile( 'Text.json', JSON.stringify( options.Text ), { src: true } )
				.pipe( plumber() )
				.pipe( debug( { title: 'Copy - Text: Generate text files to build:', showFiles: false } ) )
				.pipe( gulp.dest( options.Target ) )
				.on( 'end', done );
		}
	}
}
