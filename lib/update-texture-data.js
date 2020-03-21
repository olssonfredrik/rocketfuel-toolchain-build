const through = require('through2');
const PluginError = require('plugin-error');

module.exports = function( data ) {

	function processFile(file, encoding, callback) {

		if( file.isNull() || file.extname !== '.json' ) {
			callback( null, file );
			return;
		}

		const packerData = JSON.parse( file.contents );
		for( const texturePath in packerData ) {
			const spriteMap = packerData[texturePath].Sprites;
			for( const spritePath in spriteMap ) {
				const transform = spriteMap[spritePath];
				const textureData = data.find( t => t.Id === spritePath );
				if( textureData === undefined ) {
					new PluginError( 'graphics', 'Unable to find texture map for sprite "' + spritePath + '"' );
				}
				textureData.Path = texturePath;
				textureData.Pos = transform;
			}
		}

		callback();
	}

	return through.obj(processFile);
};
