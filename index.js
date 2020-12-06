const del = require('del');
const gulp = require('gulp');

module.exports = function(resourceLocations, entryPoint, isDebug) {

	const options = {
		Debug: isDebug || false,
		EntryPoint: entryPoint,
		Target: './Build/',
		Temp: './.Temp/',
		DownloadData: [],
		MultiFile: {},
		Config: {
			DataManager: {
				Money: {},
				Values: {
					'Sound:Mute': {
						Persistent: false,
						Format: "integer"
					},
					'Fullscreen:Supported': {
						Persistent: false,
						Format: "integer"
					},
					'Fullscreen:Active': {
						Persistent: false,
						Format: "integer"
					}
				}
			}
		},
		Locations: resourceLocations || ['./']
	};

	const preCompile = [];
	const compile = [];
	const copy = [];

	const componentList = ['sound', 'spine', 'shaders', 'fonts', 'graphics', 'resources', 'config', 'text', 'download', 'code'];
	componentList.forEach( function(value) {
		var component = require( './components/' + value )(gulp, options);
		preCompile.push(component.preCompile);
		compile.push(component.compile);
		copy.push(component.copy);
	} );

	const cleanTask = (done) => {
		del.sync([options.Target, options.Temp]);
		done();
	};
	const buildTask = gulp.series( gulp.series(preCompile), gulp.series(compile), gulp.series(copy) );

	const textComponent = require( './components/text' )(gulp, options);
	const buildText = gulp.series( [ textComponent.preCompile, textComponent.compile, textComponent.copy ] );

	return {
		clean: cleanTask,
		build: buildTask,
		text: buildText
	};
}
