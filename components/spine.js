const fs = require('fs');
const path = require('path');
const debug = require('gulp-debug');
const logger = require('fancy-log');
const plumber = require('gulp-plumber');
const changed = require('gulp-changed');
const exec = require('gulp-exec');
const del = require('del');
const rename = require('gulp-rename');
const collectMetaData = require('../lib/collect-metadata');
const addMetaData = require('../lib/add-metadata');
const addDownloadMetaData = require('../lib/add-download-metadata');
const combineMultiFile = require('../lib/combine-multi-file');

const spineSettings = {
	class: 'export-json',
	cleanUp: true,
	extension: '.json',
	format: 'JSON',
	nonessential: true,
	open: false,
	packAtlas: null,
	prettyPrint: true,
	warnings: true
};

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const glob = util.expandGlob( options.Locations, ['Resources/Spine/**/*.json'] );
	const tempFolder = options.Temp + 'Spine/';

	const settingsFilePath = path.join( tempFolder, 'spine.settings' );
	const settingsString = JSON.stringify( spineSettings );
	const spineExec = process.env.SPINE_EXECUTABLE;
	const settingsFunc = util.createFileTask( settingsFilePath, settingsString );

	options.Config['SpineManager'] = [];

	const managerMetaData = (file) => {
		var id = file.relative.substring(0, file.relative.length - file.extname.length ).replace(/\\/g, '/'),
			path = ('Spine/' + file.relative).replace(/\\/g, '/');
		return { Id: id, Path: path };
	};

	return {
		// export all .spine to json files
		preCompile: (done) => {
			done = util.log('PreCompile - Spine', done);

			const generateManagerData = (callback) =>
				gulp.src( glob, { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerMetaData ) )
					.pipe( collectMetaData( options.Config['SpineManager'] ) )
					.on( 'end', callback );

			if( !spineExec ) {
				logger('[Spine]: Spine Executable not defined. Skipping export.');
				gulp.series( generateManagerData, (cb) => { cb(); done(); } )();
				return;
			}

			del.sync( tempFolder + '/**/*.json');

			var renameFunc = (file) => {
				file.basename = path.basename(file.dirname, '.spine');
				file.dirname = path.dirname(file.dirname);
			};

			var exportFunc = () => gulp.src( util.expandGlob( options.Locations, ['Resources/Spine/**/*.spine'] ), { read: false, base: '.' } )
				.pipe( plumber() )
				.pipe( changed( '.', { extension: '.json'} ) )
				.pipe( debug( { title: 'PreCompile - Spine: Export .spine files:', showFiles: false } ) )
				.pipe( exec( '"' + spineExec + '" -i "<%= file.path %>" -o "' + tempFolder + '<%= file.relative %>" -e "' + settingsFilePath + '"' ) )
				.pipe( exec.reporter( { stdout: false } ) );

			var copyFunc = () => gulp.src( tempFolder + '/**/skeleton.json')
				.pipe( plumber() )
				.pipe( rename( renameFunc ) )
				.pipe( debug( { title: 'PreCompile - Spine: Copy .json back to resources:', showFiles: false } ) )
				.pipe( gulp.dest( '.' ));

			gulp.series( settingsFunc, exportFunc, copyFunc, generateManagerData, (cb) => { cb(); done(); } )();
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Spine', done);
			gulp.src( glob )
				.pipe( debug( { title: 'Copy - Spine: .json to build:', showFiles: false } ) )
				.pipe( combineMultiFile( 'Spine.multi', { IdPrefix: 'Spine/' } ) )
				.pipe( addDownloadMetaData( { UrlPrefix: 'Spine/' } ) )
				.pipe( collectMetaData( options.DownloadData ) )
				.pipe( gulp.dest( './Build/Spine' ) )
				.on( 'end', done );
		}
	}
}
