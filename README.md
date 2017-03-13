# CrabSave - Just another video downloader with GUI

## Index
- [Introduction](#introduction)
- [Browser](#browser)
- [Search command](#search-command)
- [Cold](#cold)
- [Hot](#hot)
- [History](#history)
- [Component](#component)
- [Sign in](#sign-in)
- [Shortcut](#shortcut)
- [Setting](#setting)

## Interface

CrabSave is designed to be a downloader to download videos from some sites, it supports multitasking, resume from break point and some other features.

Currently supports the following sites

|BiliBili(嗶哩嗶哩)|[http://www.bilibili.com/]()|
|YouTube|[https://www.youtube.com/]()|
|NicoNico(ニコニコ)|[http://www.nicovideo.jp/]()|
|ToonsTV|[https://www.toons.tv/]()|

![GUI Interface]()

## Browser

To tell witch videos to be downloaded, you are required to browse it in the Browser tab, witch is the initial tab when the app is loaded.

You need to enter a video URL or a command like thing to view the related videos. The command format will be introduced in the next section.


The following shows to view all videos witch are related to `y user munimunibekkan`.

![Search `y user munimunibekkan`]()

Every video items are displayed with some key information

![Video item]()

|Infomation|Value in the image above|
|-|-|
|Item index|0|
|ID|TKL9x8jCpto|
|State indicator|-The span above the image-|
|Cover|-The image-|
|Duration(Optional)|-Not showed-|
|Title|改訂版 ガリかデブかを判定する機械|
|Author(Optional)|munimunibekkan|
|Uploaded date|2017.03.11.16.56.45|
The state indicator would be one of four state.
|Blank|The Initial state|
|![Cold]()|This item is selected but not comitted|
|![Hot]()|This item is comitted|
|![History]()|This item has been downloaded|

The date would be showed in your time zone.


You can dicide which videos to be downloaded by clicking their images. Or enter `ctrl+a` to select all videos of the current page ignoring those who have been downloaded.

To unselect a video, you just need to click its image again. And you can enter `shift+ctrl+a` to unselect all selection of the current page.

## Search command

All commands has two parts except complete URLs copied from your internet browsers and some special forms. The first part is the name of the site, the second part is detailed information to locate some videos (eg. ` SiteName  Detail `). The spaces around and redundant spaces in between would be ignored, and the commands are case insensitive.

All site names may have aliases, and the shortest one would be used in the following introduction.

### Bilibili

Alias : Bili, B.

**Video ID**

RegExp `/^(\d+)$/` `/(?:^|[^a-z])av(?:[^a-z]\D*)??(\d+)/i`

Examples

`av314`

`b 314`

`b av314`

`http://www.bilibili.com/video/av314`

**Uploader**

RegExp `/(?:^|[^a-z])space(?:[^a-z]\D*)??(\d+)/i`

Examples

`b space 70093`

`https://space.bilibili.com/70093`

**Mylist**

RegExp `/(?:^|[^a-z])mylist(?:[^a-z]\D*)??(\d+)/i`

Examples

`b mylist 9`

`http://www.bilibili.com/mylist9`

**Dynamic**

Require signing in.

RegExp `/^(?:dynamic)?$/i`

Examples

`b`

`b dynamic`

**Search**

RegExp `/^(?:find|search)\s+(.*)$/i`

Examples

`b find test something`

### YouTube

Alias : YTB, Y.

**Video ID**

RegExp `/v=([^&]+)/` `/^([_0-9A-Za-z-]+)$/`

Examples

`y 9bZkp7q19f0`

`y v=9bZkp7q19f0`

`https://www.youtube.com/watch?v=9bZkp7q19f0`

**Uploader**

RegExp `/(?:^|[^a-z])user(?:[\s\/]+)??([_0-9A-Za-z-]+)/i`

Examples

`y user munimunibekkan`

`https://www.youtube.com/user/munimunibekkan`

**Channel**

RegExp `/(?:^|[^a-z])channel(?:[\s\/]+)??([_0-9A-Za-z-]+)/i`

Examples

`y channel UCyKNzTQpYtKliiBmz4Ep5Hw`

`https://www.youtube.com/channel/UCyKNzTQpYtKliiBmz4Ep5Hw`

**Playlist**

RegExp `/(?:^|[^a-z])playlist(?:[^a-z]\D*)??(\d+)/i` `/list=([^&]+)/i`

Examples

`y playlist UUyKNzTQpYtKliiBmz4Ep5Hw`

`https://www.youtube.com/playlist?list=UUyKNzTQpYtKliiBmz4Ep5Hw`

**Subscription**

Require signing in.

RegExp `/^(?:sub(?:scri(?:be|ptions?))?)?$/i`

Examples

`y`

`y subscription`

**Search**

RegExp `/^(?:find|search)\s+(.*)$/i`

Examples

`y find 4k test`

### NicoNico

Alias : ニコニコ, ニコ, Nico, N.

**Video ID**

RegExp `/^(\d+)$/` `/(?:^|[^a-z])av(?:[^a-z]\D*)??(\d+)/i`

Examples

`sm9`

`n 9`

`n sm9`

`http://www.nicovideo.jp/watch/sm9`

**Uploader**

RegExp `/(?:^|[^a-z])user(?:[^a-z]\D*)??(\d+)/i`

Examples

`n user 25371352`

`http://www.nicovideo.jp/user/25371352`

**Mylist**

RegExp `/(?:^|[^a-z])mylist(?:[^a-z]\D*)??(\d+)/i`

Examples

`n mylist 52151642`

`http://www.nicovideo.jp/mylist/52151642`

**ニコレポ**

Require signing in.

RegExp `/^(?:repo|my|top)?$/i`

Examples

`n`

`n my`

`n top`

**Search**

RegExp `/^(?:find|search)\s+(.*)$/i`

Examples

`n find けものフレンズ`

### ToonsTV

Alias : Toons, T.

**Video ID**

RegExp `/channels\/([0-9A-Z_]+\/[0-9A-Z_]+)/i` `/^([0-9A-Z_]+\/[0-9A-Z_]+)$/i`

Examples

`t Piggy_Tales_3/6411f1c08a224700`

`https://www.toons.tv/channels/Piggy_Tales_3/6411f1c08a224700`

**Channel**

RegExp `/channels\/([0-9A-Z_]+)/i` `/^([0-9A-Z_]+)$/i`

Examples

`t Piggy_Tales_3`

`https://www.toons.tv/channels/Piggy_Tales_3`

**All**

Require loading component.

RegExp `/^$/`

Examples

`t`
