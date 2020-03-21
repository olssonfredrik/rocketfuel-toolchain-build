const through = require('through2');
const debug = require('gulp-debug');
const path = require('path');
const plumber = require('gulp-plumber');
const addMetaData = require('../lib/add-metadata');
const collectMetaData = require('../lib/collect-metadata');
const texturePacker = require('gulp-free-tex-packer');
const addDownloadMetaData = require('../lib/add-download-metadata');
const updateTextureData = require('../lib/update-texture-data');
const filter = require('gulp-filter');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const glob = util.expandGlob(options.Locations, ['Resources/Graphics/**/*.png', 'Resources/Graphics/**/*.jpg', '!Resources/Graphics/Placeholders/**/*']);
	const tempFolder = options.Temp + 'Graphics/';

	const packingTemplateFile = path.join( tempFolder, 'texture-template.mst' );
	const packingTemplateData = [
		'{',
			'"Graphics/{{config.imageName}}": {',
			'"Size": {',
			'	"w": {{config.imageWidth}},',
			'	"h": {{config.imageHeight}}',
			'},',
			'"Sprites": {',
			'{{#rects}}',
			'	"{{{name}}}": [ {{frame.x | divide : config.imageWidth}}, {{frame.y | divide : config.imageHeight}}, ' +
					'{{frame.w | divide : config.imageWidth}}, {{frame.h | divide : config.imageHeight}} ]' +
					'{{^last}},{{/last}}',
			'{{/rects}}',
			'}',
			'}',
		'}'
	];
	const templateFileTask = util.createFileTask( packingTemplateFile, packingTemplateData.join( '\n' ) );

	const packingOptions = {
		textureName: "Texture",
		width: 2048,
		height: 2048,
		fixedSize: false,
		padding: 0,
		extrude: 1,
		allowRotation: false,
		detectIdentical: true,
		allowTrim: false,
		packer: 'OptimalPacker',
		exporter: {
			fileExt: "json",
			template: packingTemplateFile
		},
		removeFileExtension: true,
		prependFolderName: true,
		//filter: 'quality'
	};

	const folderList = [];
	options.Config['TextureManager'] = [];

	const managerMetaData = (file) => {
		var id = file.relative.substring(0, file.relative.length - file.extname.length ).replace(/\\/g, '/'),
			path = 'Graphics/' + file.relative.replace(/\\/g, '/');
		return { Id: id, Path: path, Pos: [0, 0, 1, 1] };
	};

	return {
		preCompile: (done) => {
			done = util.log('PreCompile - Graphics', done);
			const folderRegex = RegExp( '.*\\\\Graphics\\\\([^\\\\]+)\\\\', 'i' );

			const generateManagerData = (callback) =>
				gulp.src( glob, { read: false } )
					.pipe( plumber() )
					.pipe( through.obj( function( file, enc, cb ) {
						const folderNames = folderRegex.exec( file.path );
						folderList.push( folderNames ? folderNames[1] : 'Graphics' );
						cb( null, file );
					}))
					.pipe( addMetaData( managerMetaData ) )
					.pipe( collectMetaData( options.Config['TextureManager'] ) )
					.on( 'end', callback );

			gulp.parallel( templateFileTask, generateManagerData )( done );
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Graphics', done);

			const folders = [ ...new Set( folderList ) ]; // create distinct array

			var packTasks = folders.map( (folder) => {
				const isRoot = (folder === 'Graphics');
				const folderFilter = filter( isRoot ? '**/Graphics/*' : '**/Graphics/' + folder + '/**/*' );
				const pngFilter = filter( isRoot ? '*.png' : '**/*.png', { restore: true } );
				const jpgFilter = filter( isRoot ? '*.jpg' : '**/*.jpg', { restore: true } );
				const pngPackingOptions = Object.assign( {}, packingOptions, { textureFormat: 'png', textureName: folder } );
				const jpgPackingOptions = Object.assign( {}, packingOptions, { textureFormat: 'jpg', textureName: folder } );

				return (callback) => gulp.src( glob )
					.pipe( plumber() )
					.pipe( debug( { title: 'Copy - Graphics: Finding "' + folder + '" files from a total of:', showFiles: false } ) )
					.pipe( folderFilter )
					.pipe( debug( { title: 'Copy - Graphics: Process "' + folder + '" files:', showFiles: false } ) )
					.pipe( pngFilter )
					.pipe( texturePacker( pngPackingOptions ) )
					.pipe( pngFilter.restore )
					.pipe( jpgFilter )
					.pipe( texturePacker( jpgPackingOptions ) )
					.pipe( jpgFilter.restore )
					.pipe( updateTextureData( options.Config['TextureManager'] ) )
					.pipe( addDownloadMetaData( { UrlPrefix: 'Graphics/' } ) )
					.pipe( collectMetaData( options.DownloadData ) )
					.pipe( gulp.dest( './Build/Graphics' ) )
					.on( 'end', callback );
			} );

			if( packTasks.length > 0 )
				return gulp.series( packTasks )( done );

			done();
		}
	}
}
