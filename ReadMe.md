# CrabSave | Yet Another UGC Downloader With GUI

CrabSave is a B/S application to download UGC (User-generated content) from several sites, mainly focus on media contents. With features like multitasking, breakpoint resume, and download history management.



## Index
+ [Installation](#installation)
+ [Usage](#usage)
+ [API](#api)
+ [Manual](#manual)
+ [Misc](#misc)
+ [Examples](#examples)
+ [Changelog](#changelog)



## Installation
You could use CrabSave as a CLI tool
```sh
npm i -g crabsave
```
You could also use it programmatically
```sh
npm i crabsave
```



## Usage
To use from CLI command
```sh
crabsave [-p ${Port to deploy the web server}] [-d ${Path to store settings}]

crabsave -h # for help

# Example
crabsave -p 8000
```
Or use it programmatically
```js
const CrabSave = require('crabsave')

CrabSave(
{
	PortWeb? : 8000,
	Data? : 'Path to an existing directory'
})
```

And then a local web server `localhost:8000` will be deployed and can be visited from browsers (that support WebSocket). We involve a simple `Token` facility here to ensure that only the owner can operate, and you can find the initial token in the [Data Folder](#data-folder-structure)



## API

### CrabSave(Option)
+ `Option` : `Object`
	+ `PortWeb` : `number` Optional. Port to deploy the Web Server.
	+ `Data` : `string` Optional. Path to store settings and databases. See [Data Folder Structure](#data-folder-structure)
	+ `GoogleAPIKey` : `string` Optional. Your own Google API Key in case the bundled key exceeds the call limits.
	+ `UnsafeExport` : `boolean` Optional. To export unsafe functions that could be used for scripting through browser console, use with care.
+ Returns : `Object`
	+ `Exp` : `(Express? : require('express')) => require('express').Router`. Given an optional `Express` object, returns a Router. See [Example : Custom Web Server][ExWeb]
	+ `Soc` : `Function`. Used to handle event `require('ws')::on('connection')`. See [Example : Custom Web Server][ExWeb]



## Manual

### Basic usage
The basic usage would be like
+ Paste the link or type in the keywords
+ Select posts by clicking their cover images to download or `Ctrl+a` to select all shown posts, where selected posts could be viewed from the Cold list
+ Commit tasks from the Cold list to the Hot list to start downloading

Check folder `Site` for supported sites

### Keyword input
We support multiple ways to locate the posts to download here
+ Enter the link of the post (eg. `https://www.youtube.com/watch?v=kobvF5cs6xY`)
+ Enter the link of the uploader (eg. `https://www.youtube.com/user/ChromeDevelopers`, `https://www.youtube.com/channel/UCnUYZLuoy1rq1aVMwx4aTzw`)
+ Enter keyword command (eg. `YouTube kobvF5cs6xY`, `YouTube User ChromeDevelopers`, `YouTube Channel UCnUYZLuoy1rq1aVMwx4aTzw`)
+ There are also several aliases for some supported sites, which means you can type it shorter (eg. `Y kobvF5cs6xY`, `y uSer ChromeDevelopers`, `y channel UCnUYZLuoy1rq1aVMwx4aTzw`)
+ As you may notice from examples above, site names and command names are case insensitive.
+ Providing Cookies will unlock more to do for each site (eg. `y subscription` or simply `y` to view the list just the same as browsing `https://www.youtube.com/feed/subscriptions`, `y fo` to view subscribed channels)
+ We also embedded the searching feature since the input looks like those search bars (eg. `y find love` will ask YouTube to search for contents related to `love`)

### File name format
The default format is `|Up|.|Date|.|Title|?.|PartIndex|??.|PartTitle|??.|FileIndex|?`  
Where `|FieldName|` will be replaced by its value. `?OptionalPart?` only effects if all FieldName it contains exist.  
All available fields are shown below
|Field|Description|
|---|---|
|\|ID\||ID of a post|
|\|Site\||Site of a post|
|\|Title\||The title|
|\|Up\||Name of the uploader or channel|
|\|Y\||The year of the created date (in local timezone)|
|\|M\||The month of the created date (in local timezone)|
|\|D\||The day of the created date (in local timezone)|
|\|H\||The hour of the created date (in local timezone)|
|\|N\||The minute of the created date (in local timezone)|
|\|S\||The seconds of the created date (in local timezone)|
|\|Date\||Shortcut of `|Y|.|M|.|D|.|H|.|N|.|S|`|
|\|PartIndex\||(Optional) The index of a subpart counted from 0|
|\|PartTitle\||(Optional) The title of a subpart|
|\|FileIndex\||(Optional) The index of a file in a part, counted from 0. It will be null when all files in a part having different extension (specially for DASH videos)|
|\|Type\||(Optional) `Meta` for metadata, `Cover` for cover image, otherwise null|



## Misc

### Data Folder Structure
Default location  
Windows `%AppData%/ZED/CrabSave`  
Unix `$HOME/.local/share/ZED/CrabSave`  
Mac `$HOME/Library/Preferences/ZED/CrabSave`  
```sh
ZED/CrabSave
+-- Key # The authorization token, randomly generated on the first run
+-- DB.db # The database of tasks
+-- Setting.json
+-- ShortCut.json
+-- Cookie.json # Cookie settings
+-- Web.js # Bundled script for Web clients
```



## Changelog

### v1.5.0 Beaking Changes
From this version, the protocol between C/S has been revamped, thus browsers running old version pages will not be able to communicate with newer versions.

### v1.4.0
From this version, we do NOT ONLY focusing on video or audio data, we also supported to save infomation related to posts including Metadata and Cover Images. Also, posts without video or audio (eg. text only) are able to be saved now.

### Updates from V0
The current version is a rewrite of the previous version (on branch `V0`) with few major differences
+ Drop the usage of Electron and publish it as an NPM package. We find out that it is not necessary to involve a desktop application. Separating to B/S makes it easy to initiate downloads remotely
+ Use SQLite3 instead of NeDB. NeDB is a nice DB choice, but since it won't compress its journal, we switch to SQLite3 instead. The disk usage is pretty the same, for 32000+ tasks, their file sizes are both around 52MB



## Examples

### Example : Custom Web Server
Required dependencies
```sh
npm i express
```
Then
```js
const CrabSave = require('crabsave')
const Express = require('express')
const HTTP = require('http')
const WS = require('ws')

const Save = CrabSave({...})
const Exp = Express().use('/Play',Save.Exp())
const Server = HTTP.createServer(Exp).listen(8000)
new WS.Server({server : Server,path : '/Play/'})
	.on('connection',Save.Soc)
```
And now you can visit from `localhost:8000/Play`



[ExWeb]: #example--custom-web-server