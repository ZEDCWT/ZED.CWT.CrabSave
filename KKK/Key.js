var
ZED = require('@zed.cwt/zedquery'),

QueueKey = ZED.StableKeyGen(20170122),
SiteKey = ZED.StableKeyGen(20170125);

module.exports =
{
	Queue :
	{
		ID : QueueKey(),
		Active : QueueKey(),
		Running : QueueKey(),
		URL : QueueKey(),
		Word : QueueKey(),
		//[URL] reuse, a request object
		Suffix : QueueKey(),
		Index : QueueKey()
	},
	Site :
	{
		Name : SiteKey(),
		Judge : SiteKey(),
		//Login
		Login : SiteKey(),
		Check : SiteKey(),
		Require : SiteKey(),
		//Map
		Map : SiteKey(),
		//[Name] reuse
		//[Judge] reuse
		Page : SiteKey(),
		//Page returns an object
		Pages : SiteKey(),//number | false for
		Total : SiteKey(),
		Item : SiteKey(),//array
		//Item
		Unique : SiteKey(),
		Index : SiteKey(),
		ID : SiteKey(),
		Img : SiteKey(),
		Title : SiteKey(),
		Author : SiteKey(),
		Date : SiteKey(),
		//URL
		URL : SiteKey(),
		//URL returns an array
		Word : SiteKey(),
		//[URL] reuse, a request object
		Suffix : SiteKey()
		//[Index] reuse
	}
}