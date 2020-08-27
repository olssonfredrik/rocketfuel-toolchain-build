const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const glslMinifier = require('../lib/glsl-minifier');
const addMetaData = require('../lib/add-metadata');
const addDownloadMetaData = require('../lib/add-download-metadata');
const collectMetaData = require('../lib/collect-metadata');
const combineMultiFile = require('../lib/combine-multi-file');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const glob = util.expandGlob( options.Locations, ['Resources/Shaders/**/*.vert', 'Resources/Shaders/**/*.frag'] );

	options.Config['ShaderManager'] = [];

	const managerMetaData = (file) => {
		var id = file.relative.substring(0, file.relative.length - file.extname.length ).replace(/\\/g, '/'),
			vert = 'Shaders/' + id + '.vert',
			frag = 'Shaders/' + id + '.frag';
		return { Id: id, Vert: vert, Frag: frag };
	};

	return {
		preCompile: (done) => {
			done = util.log('PreCompile - Shaders', done);

			const generateManagerData = (callback) =>
				gulp.src( util.expandGlob( options.Locations, ['Resources/Shaders/**/*.vert' ] ), { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerMetaData ) )
					.pipe( collectMetaData( options.Config['ShaderManager'] ) )
					.on( 'end', callback );
			gulp.series( generateManagerData, (cb) => { cb(); done(); } )(); 
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Shaders', done);
			gulp.src( glob )
				.pipe( debug( { title: 'Copy - Shaders: copy files to build:', showFiles: false } ) )
				.pipe( util.ifRelease( glslMinifier )() )
				.pipe( combineMultiFile( 'Shaders.multi', { IdPrefix: 'Shaders/' } ) )
				.pipe( addDownloadMetaData( { UrlPrefix: 'Shaders/' } ) )
				.pipe( collectMetaData( options.DownloadData ) )
				.pipe( gulp.dest( './Build/Shaders' ) )
				.on( 'end', done );
		}
	}
}
