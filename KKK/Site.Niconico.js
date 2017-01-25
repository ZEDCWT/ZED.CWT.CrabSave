var
ZED = require('@zed.cwt/zedquery'),
Observable = ZED.Observable,

Key = require('./Key').Site;

module.exports = ZED.ReduceToObject
(
	Key.Name,
	Key.Judge,
	Key.Login,
	Key.Check,
	Key.Map,[ZED.ReduceToObject
	(
		Key.Name,
		Key.Judge,
		Key.Page
	)],
	Key.URL
)