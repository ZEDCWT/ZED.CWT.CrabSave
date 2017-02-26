var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Path = require('path'),

Env = process.env,

Pack = require('electron-packager'),
FS = require('graceful-fs'),
Uglify = require('uglify-js'),

PackConfig =
{
	dir : __dirname,
	platform : 'win32',
	arch : 'ia32',
	out : Path.join(__dirname,'Out'),
	ignore :
	[
		'/\\.vscode',
		'/Declare',
		'/Old',
		'/Build',
		'/jsconfig'
	],
	prune : true,
	overwrite : true
},
UglifyConfig =
{
	fromString : true,
	compress : {screw_ie8 : false},
	mangle : {toplevel : true,screw_ie8 : false},
	output : {screw_ie8 : false}
};

Observable.wrapNode(Pack)(PackConfig).flatMap(function(Q)
{
	if (Env.Just) return Observable.empty()
	console.log('Uglifing')
	Q = Path.join(Q[0],'resources','app')
	return Observable.from([Q,Path.join(Q,'KKK')]).flatMap(function(Q)
	{
		return Observable.wrapNode(FS.readdir)(Q)
			.flatMap(ZED.identity)
			.filter(ZED.test(/\.js$/))
			.map(function(S){return Path.join(Q,S)})
	}).flatMapOnline(1,function(Q)
	{
		return Observable.wrapNode(FS.readFile)(Q).flatMap(function(S)
		{
			return Observable.wrapNode(FS.writeFile)(Q,Uglify.minify(S.toString(),UglifyConfig).code)
		})
	})
}).start(null,function(E)
{
	console.log('Error occured')
	console.log(E)
},function()
{
	console.log('Done')
})