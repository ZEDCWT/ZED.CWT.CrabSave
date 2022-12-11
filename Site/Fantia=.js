'use strict'
var
WW = require('@zed.cwt/wish'),
{R : WR,C : WC,N : WN} = WW,

Fantia = 'https://fantia.jp/',
FantiaAPI = Fantia + 'api/v1/',
FantiaAPIPost = WW.Tmpl(FantiaAPI,'posts/',undefined);

/**@type {CrabSaveNS.SiteO}*/
module.exports = O =>
{
	var
	Common = B =>
	{
		var T;
		B = WC.JTO(B)
		T = WR.Val(B)
		return 1 === T.length ?
			T[0] :
			T.length ? B : WW.Throw('Empty Response')
	};

	return {
		URL : (Q,Ext) =>
		{
			var
			PostID,
			ContentID;

			Q = Q.split('_')
			PostID = Q[0]
			ContentID = Q[1]

			return Ext.ReqB(O.Coke(FantiaAPIPost(PostID))).Map(B =>
			{
				var
				Content,
				Meta = [],MetaContent = [],
				Part = [],
				T;
				B = Common(B)
				B.comment && Meta.push(B.comment)
				if (null != ContentID)
				{
					Content = B.post_contents.find(V => V.id === +ContentID)
					Content || WW.Throw('No Such Content')
					'visible' === Content.visible_status || WW.Throw('Content Invisible')
					Content.plan && MetaContent.push('Plan ' + WW.Quo(Content.plan.id) + 'JPY ' + Content.plan.price + ' ' + Content.plan.name)
					Content.comment && MetaContent.push(Content.comment)
					switch (Content.category)
					{
						// case 'text' :
						case 'photo_gallery' :
							Part.push(
							{
								Title : Content.title,
								URL : WR.MapU((V,F) =>
									MetaContent.push('\t{Photo} ' +
										WW.ShowLI(Content.post_content_photos.length,F) +
										WW.Quo(WN.JoinU(Fantia,V.show_original_uri),!V.comment) +
										(V.comment || '')) &&
										V.url.original,
									Content.post_content_photos)
							})
							break
						case 'file' :
							MetaContent.push('\t{File} ' + Content.filename)
							T = WN.ExtN(Content.filename)
							Part.push(
							{
								Title : Content.title + '.' + Content.filename.slice(0,Content.filename.length - T.length),
								URL : [WN.JoinU(Fantia,Content.download_uri)],
								Ext : T
							})
							break
						// case 'product' :
						// case 'embed' :
						// case 'blog' :
						default :
							WW.Throw('Unknown Category ' + Content.category)
					}
				}
				return {
					Title : B.title,
					// Things getting pretty complicated due to the three name design
					UP : B.fanclub.creator_name + '.' + B.fanclub.fanclub_name,
					Date : +new Date(B.posted_at),
					Meta : Meta.length && MetaContent.length ?
					[
						...Meta,
						'','',WR.RepS('\u2015',64),
						...MetaContent
					] : MetaContent.length ? MetaContent : Meta,
					Cover : B.thumb?.original || B.thumb_micro,
					Part,
				}
			})
		},
		Pack : Q => O.Coke(Q),
	}
}