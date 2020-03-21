module.exports = function( file, prefix ) {
	return ((prefix ? prefix: '') + file.relative).replace(/\\/g, '/');
};
