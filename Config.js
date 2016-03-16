var
Path = require('path'),
env = process.env,

Store = Path.join
(
	env.HOME ||
	env.HOMEDRIVE && env.HOMEPATH && (env.HOMEDRIVE + env.HOMEPATH) ||
	env.USERPROFILE,
	'ZED',
	'VideoSiteTool'
),

Package = JSON.parse(require('fs').readFileSync(Path.join(__dirname,'package.json')));

module.exports =
{
	Version : Package.version,
	UA : 'ZED.CWT/255.255.255.0(Unix) VideoSiteTool/' + Package.version,
	Store : Store,
	PathStore : function(Q)
	{
		Q = Array.prototype.slice.call(arguments)
		Q.unshift(Store)
		return Path.join.apply(null,Q)
	},
	Resource : 'Inner'
}