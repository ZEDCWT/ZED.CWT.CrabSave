var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Path = require('path'),

Env = process.env,

CLI = require('cli'),
Prompt = require('prompt'),
FS = require('graceful-fs'),
Uglify = require('uglify-js'),

exists = Observable.wrapCallback(FS.exists),
stat = Observable.wrapNode(FS.stat),
readdir = Observable.wrapNode(FS.readdir),
readFile = Observable.wrapNode(FS.readFile),
writeFile = Observable.wrapNode(FS.writeFile),

Output = Path.join(__dirname,'Out'),
UglifyConfig =
{
	fromString : true,
	compress : {screw_ie8 : false},
	mangle : {toplevel : true,screw_ie8 : false},
	output : {screw_ie8 : false}
},
Compress = function(Q)
{
	return Uglify.minify(Q.toString(),UglifyConfig).code
},

Full = function()
{
	return (CLI.options.skip ? Observable.just(process) :
	(
		Prompt.start(),
		Observable.wrapNode(Prompt.get,Prompt)([
		{
			name : 'platform',
			default : process.platform
		},{
			name : 'arch',
			default : process.arch
		}])
	)).flatMap(function(Q)
	{
		return Observable.wrapNode(require('electron-packager'))(
		{
			dir : __dirname,
			platform : Q.platform,
			arch : Q.arch,
			out : Output,
			ignore :
			[
				'/\\.vscode',
				'/Declare',
				'/Old',
				'/Build',
				'/\\.git',
				'/jsconfig'
			],
			prune : true,
			overwrite : true
		})
	}).flatMap(function(Q)
	{
		if (Env.Just) return Observable.empty()
		CLI.info('Uglifing')
		Q = Path.join(Q[0],'resources','app')
		return Observable.from([Q,Path.join(Q,'KKK')]).flatMap(function(Q)
		{
			return readdir(Q)
				.flatMap(ZED.identity)
				.filter(ZED.test(/\.js$/))
				.map(function(S){return Path.join(Q,S)})
		}).flatMapOnline(1,function(Q)
		{
			return readFile(Q).flatMap(function(S)
			{
				CLI.info(Path.relative(Output,Q))
				return writeFile(Q,Compress(S))
			})
		})
	})
},
Ignore = ZED.test(/^node_modules$/i),
FastFolder = function(Q,S)
{
	return readdir(Q).flatMap(ZED.identity).flatMapOnline(1,function(C,CQ,CS)
	{
		CQ = Path.join(Q,C)
		CS = Path.join(S,C)
		return Ignore(C) ?
			Observable.empty() :
			exists(CS).flatMap(function(Has)
			{
				return Has ?
					stat(CQ).flatMap(function(Stat)
					{
						return Stat.isDirectory() ?
							FastFolder(CQ,CS) :
							readFile(CS).flatMap(function(Content)
							{
								CLI.info(Path.relative(Output,CQ))
								return writeFile(CQ,/\.js$/.test(C) ? Compress(Content) : Content)
							})
					}) :
					Observable.empty()
			})
	})
},
Fast = function()
{
	return readdir(Output)
		.flatMap(ZED.identity)
		.flatMap(function(Q)
		{
			return exists(Path.join(Output,Q,'resources/app'))
				.filter(ZED.identity)
				.map(ZED.always(Q))
		})
		.flatMapOnline(1,function(Q)
		{
			return Observable.just().flatMap(function()
			{
				CLI.info(Q)
				return FastFolder(Path.join(Output,Q,'resources/app'),__dirname)
			})
		})
};

CLI.setApp('Build','0.0.0')
CLI.parse(
{
	skip : ['k','Skip choosing platform and arch'],
	fast : ['f','Fast build (only copy project files if files of last built exist)']
})
;(CLI.options.fast ? Fast() : Full()).start(null,function(E)
{
	console.log('Error occured')
	console.log(E)
},function()
{
	console.log('Done')
})