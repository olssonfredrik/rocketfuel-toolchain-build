const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const wait = require('gulp-wait');
const fntToJson = require('../lib/fnt-to-json');
const addMetaData = require('../lib/add-metadata');
const collectMetaData = require('../lib/collect-metadata');
const addDownloadMetaData = require('../lib/add-download-metadata');
const combineMultiFile = require('../lib/combine-multi-file');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const tempFolder = options.Temp + 'Font/';
	const fntPath = 'Resources/Fonts/**/*.fnt';
	const jsonPath = tempFolder + '**/*.json';
	const imagePath = 'Resources/Fonts/**/*.png';

	options.Config['FontManager'] = {
		Typefaces: {}
	};

	const managerJsonMetaData = (file) => {
		var id = file.stem,
			path = ('Fonts/' + file.relative).replace(/\\/g, '/');
		return { Id: id, Path: path };
	};

	const managerTextureMetaData = (file) => {
		var path = ('Fonts/' + file.relative).replace(/\\/g, '/'),
			id = path.replace( new RegExp( /\/[^\/]+\// ), '/' ); // turn "Fonts/Foo/Bar.png" to "Fonts/Bar.png"
		return { Id: id, Path: path, Pos: [0, 0, 1, 1] };
	};

	return {

		preCompile: (done) => {
			done = util.log('PreCompile - Fonts', done);

			const convertTask = () =>
				gulp.src( util.expandGlob( options.Locations, [fntPath] ) )
					.pipe( plumber() )
					.pipe( debug( { title: 'Convert .fnt to .json: ', showFiles: false } ) )
					.pipe( fntToJson() )
					.pipe( gulp.dest( tempFolder ) );

			// here we assume that fonts are in 'Prefix/Fontname/Fontname.*'
			const generateManagerData = (callback) =>
				gulp.src( [jsonPath], { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerJsonMetaData ) )
					.pipe( debug( { title: 'Fonts: json metadata:', showFiles: false } ) )
					.pipe( collectMetaData( options.Config['FontManager'].Typefaces ) )
					.on('end', callback);

			const generateTextureManagerData = (callback) =>
				gulp.src( util.expandGlob( options.Locations, [imagePath] ), { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerTextureMetaData ) )
					.pipe( collectMetaData( options.Config['TextureManager'] ) )
					.on('end', callback);

			gulp.series( convertTask, gulp.series(generateManagerData, generateTextureManagerData), (cb) => { cb(); done(); } )();
		},

		compile: (done) => {
			done();
		},

		copy: (done) => {
			done = util.log('Copy - Fonts', done);
			const sourceFiles = util.expandGlob( options.Locations, [imagePath], [jsonPath] );
			gulp.src( sourceFiles )
				.pipe( plumber() )
				.pipe( debug( { title: 'Copy - Fonts: copy files to build:', showFiles: false } ) )
				.pipe( combineMultiFile( 'Fonts.multi', { IdPrefix: 'Fonts/', Filter: ['.json'] } ) )
				.pipe( addDownloadMetaData( { UrlPrefix: 'Fonts/' } ) )
				.pipe( collectMetaData( options.DownloadData ) )
				.pipe( gulp.dest( 'Build/Fonts' ) )
				.on( 'end', done );
		}
	}
}
