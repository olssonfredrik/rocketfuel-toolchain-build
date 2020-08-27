const through = require('through2');
const PluginError = require('plugin-error');
const glslx = require('glslx');

module.exports = function() {

	/**
	 * @this {Transform}
	 */
	var transform = function( file, encoding, callback ) {

		if( !file.isNull() ) {

			const options = {
				disableRewriting: false,
				prettyPrint: false,
				keepSymbols: false,
				renaming: "internal-only"
			};
			const shaderData = glslx.compile( file.contents.toString(), options );

			if( shaderData.log && shaderData.log.length > 0 ) {
				this.emit( 'error', new PluginError('GLSL-Minifier', 'Shader Failed: "' + file.path + '"\nError:' + shaderData.log ) );
			} else {
				const shaderString = JSON.parse( shaderData.output ).shaders[0].contents;
				file.contents = Buffer.from( shaderString );
			}
		}

		callback( null, file );
	};

	return through.obj( transform );
};
