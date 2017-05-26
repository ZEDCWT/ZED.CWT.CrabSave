var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Path = require('path'),

Env = process.env,

CLI = require('cli'),
Prompt = require('prompt'),
FS = require('graceful-fs'),
Uglify = require('uglify-es'),

exists = Observable.wrapCallback(FS.exists),
stat = Observable.wrapNode(FS.stat),
readdir = Observable.wrapNode(FS.readdir),
readFile = Observable.wrapNode(FS.readFile),
writeFile = Observable.wrapNode(FS.writeFile),

Output = Path.join(__dirname,'Out'),
Compress = Q => Uglify.minify(Q.toString(),
{
	parse :
	{
		bare_returns : true
	},
	compress :
	{
		reduce_vars : false
	},
	mangle :
	{
		toplevel : true
	},
	output :
	{
		ascii_only : true,
		quote_style : 3
	},
	toplevel : true,
	ie8 : true
}).code,

Full = () => (CLI.options.skip ? Observable.just(process) :
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
)).flatMap(Q => Observable.wrapNode(require('electron-packager'))(
{
	dir : __dirname,
	platform : Q.platform,
	arch : Q.arch,
	out : Output,
	ignore :
	[
		'/\\.vscode',
		'/Declare',
		'/KKK/Site/Template\\.js',
		'/Old',
		'/Build',
		'/\\.git',
		'/jsconfig'
	],
	prune : true,
	overwrite : true
})).flatMap(Q =>
{
	if (Env.Just) return Observable.empty()
	CLI.info('Uglifing')
	Q = Path.join(Q[0],'resources','app')
	return Observable.from([Q,Path.join(Q,'KKK')]).flatMap
	(
		Q => readdir(Q)
			.flatMap(ZED.identity)
			.filter(ZED.test(/\.js$/))
			.map(S => Path.join(Q,S))
	).flatMapOnline(1,Q => readFile(Q)
		.flatMap(S =>
		(
			CLI.info(Path.relative(Output,Q)),
			writeFile(Q,Compress(S))
		)))
}),
Ignore = ZED.test(/^node_modules$/i),
FastFolder = (Q,S) => readdir(Q)
	.flatMap(ZED.identity)
	.flatMapOnline(1,(C,CQ,CS) =>
	{
		CQ = Path.join(Q,C)
		CS = Path.join(S,C)
		return Ignore(C) ?
			Observable.empty() :
			exists(CS).flatMap(Has => Has ?
				stat(CQ).flatMap
				(
					Stat => Stat.isDirectory() ?
						FastFolder(CQ,CS) :
						readFile(CS).flatMap(Content =>
						(
							CLI.info(Path.relative(Output,CQ)),
							writeFile(CQ,/\.js$/.test(C) ? Compress(Content) : Content)
						))
				) :
				Observable.empty())
	}),
Fast = readdir(Output)
	.flatMap(ZED.identity)
	.flatMap(Q => exists(Path.join(Output,Q,'resources/app'))
		.filter(ZED.identity)
		.map(ZED.always(Q)))
	.flatMapOnline(1,Q => Observable.just()
		.flatMap(() =>
		(
			CLI.info(Q),
			FastFolder(Path.join(Output,Q,'resources/app'),__dirname)
		)));

CLI.setApp('Build','0.0.0')
CLI.parse(
{
	skip : ['k','Skip choosing platform and arch'],
	fast : ['f','Fast build (only copy project files if files of last built exist)']
})
;(CLI.options.fast ? Fast : Full()).start(null,E =>
{
	console.log('Error occured')
	console.log(E)
},() => console.log('Done'))