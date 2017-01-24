var
ZED = require('@zed.cwt/zedquery'),

QueueKey = ZED.StableKeyGen(20170122);

module.exports =
{
	Queue :
	{
		ID : QueueKey(),
		Active : QueueKey(),
		Running : QueueKey(),
	}
}