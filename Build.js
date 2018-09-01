var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Path = require('path'),

Env = process.env,

CLI = require('cli'),
FS = require('graceful-fs'),
Uglify = require('uglify-es'),
Packager = Observable.wrapPromise(require('electron-packager')),
Prompt = Observable.wrapPromise(require('inquirer').prompt),

exists = Observable.wrapCallback(FS.exists),
stat = Observable.wrapNode(FS.stat),
readdir = Observable.wrapNode(FS.readdir),
readFile = Observable.wrapNode(FS.readFile),
writeFile = Observable.wrapNode(FS.writeFile),
unlink = Observable.wrapNode(FS.unlink),

Output = Path.join(__dirname,'Out'),
Compress = Q => CLI.options.nocompress ? Q : Uglify.minify(Q.toString(),
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

Full = () => (CLI.options.skip ? Observable.just(process) : Prompt([
{
	name : 'platform',
	default : process.platform
},{
	name : 'arch',
	default : process.arch
}])).flatMap(Q => Packager(
{
	dir : __dirname,
	platform : Q.platform,
	arch : Q.arch,
	out : Output,
	ignore :
	[
		'/\\.vscode',
		'/\\.git',
		'/KKK/Site/Template\\.js',
		'/Old',
		'/Build',
		'/jsconfig'
	],
	prune : true,
	overwrite : true
})).flatMap((Q,R) =>
(
	Q = Path.join(Q[0],'resources','app'),
	R = unlink(Path.join(Q,'package-lock.json')),
	Env.Just ? R :
	(
		console.log('Uglifing'),
		R.flatMap(() => Observable.from(['','KKK','KKK/Site']).flatMap
		(
			P => readdir(P = Path.join(Q,P))
				.flatMap(ZED.identity)
				.filter(ZED.test(/\.js$/))
				.map(S => Path.join(P,S))
		).flatMapOnline(1,Q => readFile(Q)
			.flatMap(S =>
			(
				console.log(Path.relative(Output,Q)),
				writeFile(Q,Compress(S))
			))))
	)
)),
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
							console.log(Path.relative(Output,CQ)),
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
			console.log(Q),
			FastFolder(Path.join(Output,Q,'resources/app'),__dirname)
		)));

CLI.setApp('Build','0.0.0')
CLI.parse(
{
	skip : ['k','Skip choosing platform and arch'],
	fast : ['f','Fast build (only copy project files if files of last built exist)'],
	nocompress : ['n','Prevent minify the codes']
})
;(CLI.options.fast ? Fast : Full()).start(null,E => console.error('Error occured',E),() => console.log('Done'))