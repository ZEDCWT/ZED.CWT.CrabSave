#!/usr/bin/env node
'use strict'
var
WW = require('@zed.cwt/wish'),
FS = require('fs'),

Arg = WW.N.ArgParse(
{
	PortWeb : ['P','Port to deploy the server','PortNumber'],
	Data : ['D','Directory to store settings and databases','Path'],

	GoogleAPIKey : ['G','Google API Key','Key']
})[0],

Fail = Q => console.log(Q) || process.exit(9);

if ('PortWeb' in Arg)
	WW.IsIn(Arg.PortWeb = +Arg.PortWeb,0,65536) ||
		Fail('Port should be an integer in range [0,65535]')
if ('Data' in Arg)
	try {FS.statSync(Arg.Data)}
	catch (_) {Fail('Data path should exist')}

require('.')(Arg)