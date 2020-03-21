const debug = require('gulp-debug');
const plumber = require('gulp-plumber');
const addMetaData = require('../lib/add-metadata');
const collectMetaData = require('../lib/collect-metadata');

module.exports = function(gulp, options) {
	const util = require('../lib/util')(gulp, options);
	const globMusic = util.expandGlob( options.Locations, ['Resources/Sound/Music/*.webm', 'Resources/Sound/Music/*.mp3'] );
	const globSfx = util.expandGlob( options.Locations, ['Resources/Sound/**/*.webm', 'Resources/Sound/**/*.mp3', '!Resources/Sound/Music/**'] );
	const globAll = util.expandGlob( options.Locations, ['Resources/Sound/**/*.webm', 'Resources/Sound/**/*.mp3'] );

	options.Config['SoundManager'] = {
		'Groups': {
			'Music': {
				'Sounds': []
			},
			'Sfx': {
				'Sounds': []
			}
		}
	};

	const managerMetaData = (file, prefix) => {
		var id = file.relative.substring(0, file.relative.length - file.extname.length ).replace(/\\/g, '/');
		return { Id: id, Sources: [ prefix + file.relative ] };
	};

	return {
		preCompile: (done) => {
			done = util.log('PreCompile - Sound', done);

			const generateMusicManagerData = (callback) =>
				gulp.src( globMusic, { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerMetaData, 'Sound/Music/' ) )
					.pipe( collectMetaData( options.Config['SoundManager'].Groups.Music.Sounds ) )
					.on( 'end', callback );

			const generateSfxManagerData = (callback) =>
				gulp.src( globSfx, { read: false } )
					.pipe( plumber() )
					.pipe( addMetaData( managerMetaData, 'Sound/' ) )
					.pipe( collectMetaData( options.Config['SoundManager'].Groups.Sfx.Sounds ) )
					.on( 'end', callback );

			gulp.series( gulp.parallel(generateMusicManagerData, generateSfxManagerData), (cb) => { cb(); done(); } )();
		},
		
		compile: (done) => {
			done();
		},
		
		copy: (done) => {
			done = util.log('Copy - Sound', done);
			gulp.src( globAll )
				.pipe( debug( { title: 'Copy - Sound: copy files to build:', showFiles: false } ) )
				.pipe( gulp.dest( './Build/Sound' ) )
				.on( 'end', done );
		}
	}
}
