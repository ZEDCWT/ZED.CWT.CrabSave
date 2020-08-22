'use strict'
var Lang = // eslint-disable-line
{
	// {INTERNAL FATAL} is used to mark internal errors, should not be seen by users on UI. So not necessary to be translated
	EN :
	{
		Name : 'English',
		Title : 'CrabSave',

		GenDisabled : 'Disabled',
		GenEnabled : 'Enabled',
		GenLoading : 'Loading...',
		GenNoSock : 'WebSocket is not supported',
		GenNoRel : 'No items relative to',
		GenCancel : 'Cancel',
		GenUnknown : '[Unknown:~0~]',
		GenUntitle : '[Untitled]',

		Bro : 'Browser',
		BroUnSite : 'Unknown site `~0~`',
		BroUnParse : 'Unable to parse `~0~`',
		BroUnSol : 'Unable to resolve `~0~` in site `~1~`',
		BroKeyword : 'Keyword or URL',
		BroAdd : 'Add',
		BroCold : 'Cold',
		BroHot : 'Hot',
		BroHist : 'History',
		BroDesc : 'Description',
		BroItem : 'Item',
		BroPage : 'Page',
		BroSugLoad : 'Loading suggestions for ~0~',
		BroSugDone : 'Suggestions for ~0~',

		LstRemove : 'Remove',
		LstDelConfirm : 'Are you sure to remove?',
		LstDelCount : 'Totally ~0~ items',
		LstDetail : 'Detail',
		LstLoad : 'Loading task...',
		LstFail : 'Failed to load.',
		LstBriefErr : 'Failed to read ~0~ list. Tried ~1~ time(s).',
		LstBriefRead : 'Try to read ~0~ list again',
		LstTwice : '{INTERNAL FATAL} Requested the same task twice #~0~',
		DetCancel : '{INTERNAL FATAL} Cancelled by other requests',
		DetRow : 'Row ID',
		DetBirth : 'Created date',
		DetUp : 'Uploader',
		DetDate : 'Uploaded date',
		DetPartC : 'Part count',
		DetFileC : 'File count',
		DetRoot : 'Download destination',
		DetDone : 'Completed date',
		DetPart : 'Part',
		DetRun : 'Total Run',
		DetFirst : 'First Byte',
		DetTake : 'Elapsed',
		DetAvg : 'Average speed',
		StsSelect : 'Selecting ~0~ item(s)',
		StsPlus : ', ~0~ to resolve infomation',

		Col : 'Cold',
		ColCommit : 'Commit',
		ColCommitAll : 'Commit All',

		Hot : 'Hot',
		HotPause : 'Pause',
		HotPlay : 'Restart',
		HotReady : 'Ready to resolve infomation',
		HotSolve : 'Resolving infomation...',
		HotRenew : 'Renewing infomation...',
		HotQueue : 'Queued',
		HotPaused : 'Paused',

		His : 'History',

		Cmp : 'Component',

		Aut : 'Auth',
		AutToken : 'Token',
		AutAut : 'Auth',
		AutNew : 'New Token',
		AutSave : 'Save The New Token',
		AutAuthing : 'Authenticating...',
		AutAuthed : 'Authenticated!',
		AutAlready : 'Already authenticated',
		AutSaving : 'Saving the new token...',
		AutSaved : 'New token saved! Will connect again',
		AutEnt : 'Enter The Token',
		AutSite : 'Choose a site to operate cookie',
		AutMin : 'Save with minimum required cookie entries',
		AutCoke : 'Cookie',
		AutCokeSave : 'Save The Cookie',
		AutCheck : 'Checking if signed in',
		AutSigned : 'Signed in as',
		AutNoSign : 'Not Signed in',

		Sot : 'Shortcut',
		SotDown : 'KeyDown',
		SotUp : 'KeyUp',
		SotInp : 'Focusing TextInput',
		SotSet : 'Set a short cut',
		SotAdd : 'ADD',
		SotRemove : 'REMOVE',
		SotRestore : 'RESTORE',
		SotGenTabPrev : 'General | Switch to the previous tab',
		SotGenTabNext : 'General | Switch to the next tab',
		SotGenProxy : 'General | Toggle proxy',
		SotGenFocusKeywordInput : 'General | Focus the keyword input',
		SotGenFocusAuth : 'General | Focus the auth token input',
		SotBroSelAll : 'Browser | Add all non-downloaded displayed items to the cold list',
		SotBroSelClear : 'Browser | Remove all displayed items from the cold list',
		SotBroHead : 'Browser | Jump to the first page',
		SotBroPrev : 'Browser | Jump to the previous page',
		SotBroNext : 'Browser | Jump to the next page',
		SotBroLast : 'Browser | Jump to the last page',
		SotColCommit : 'Cold | Commit selected items',
		SotColCommitAll : 'Cold | Commit all items',
		SotLstSelAll : 'List | Select all items',
		SotLstSelClear : 'List | Clear selection',
		SotOlyClose : 'Overlay | Close overlay pages',

		Set : 'Settings',
		SetLang : 'Language',
		SetLangH : 'Language change will take effect when the page is reloaded',
		SetDir : 'Download destination',
		SetDirH : 'Full path of the directory to save downloaded files',
		SetFmt : 'File name format',
		SetFmtH : 'Check the manual for format instructions',
		SetMax : 'Maximum concurrency of active downloads',
		SetProxy : 'Downloader proxy',
		SetProxyE : 'Proxy Enabled',
		SetProxyD : 'Proxy Disabled',
		SetURL : 'Proxy server address',
		SetURLH : 'Host:Port',
		SetImg : 'Image proxy',
		SetImgNo : 'No proxy',
		SetImgDown : 'Follow downloader proxy',
		SetDelay : 'Retry delay after download error (in seconds)',
		SetSize : 'Resolve file sizes before downloading',
		SetMerge : 'Merge command',

		SocConn : 'Connecting...',
		SocOn : 'Connected',
		SocOff : 'Offline. Since ~0~, Tried ~1~ time(s)',
		SocRetry : 'Retry',
		SocSite : 'Loading site scripts takes too long...',

		Err : 'Error',
		ErrOff : 'Unable to perform when offline',
		ErrNoAuth : 'Unable to perform without authentication',
		ErrBadRes : 'Bad response | ~0~',

		ErrBadReq : 'Bad request',
		ErrAuthFail : 'Authentication Failed',
		ErrAuthInc : 'Original token is incorrect',
		ErrAuthSave : 'Failed to save the new token ~0~',
		ErrUnkSite : 'Unknown site ~0~',
		ErrSetDir : 'Download destination should be an absolute path',
		ErrDBNo : 'No such task ~0~',
		ErrDBHas : 'Hot list already contains ~0~',
		ErrDBAdding : 'Already adding ~0~',
		ErrDBAddFail : '{INTERNAL FATAL} Unknown error occured while adding ~0~',
		ErrLoopURL : 'Failed to resolve some URLs\n~0~',
		ErrLoopSize : 'Failed to resolve size\n~0~',

		'' : ''
	},
	CMNHanT :
	{
		Name : '漢文',
		Title : 'CrabSave',

		GenDisabled : '禁用',
		GenEnabled : '啓用',
		GenLoading : '正在讀取...',
		GenNoSock : '當前瀏覽器不支持WebSocket',
		GenNoRel : '備選項中沒有相關條目',
		GenCancel : '取消',
		GenUnknown : '[未知:~0~]',
		GenUntitle : '[無標題]',

		Bro : '瀏覽',
		BroUnSite : '未知站點 `~0~`',
		BroUnParse : '無法識別 `~0~`',
		BroUnSol : '無法在 `~1~` 中識別 `~0~`',
		BroKeyword : '關鍵字或鏈接',
		BroAdd : '加入準備列表',
		BroCold : '準備下載',
		BroHot : '正在下載',
		BroHist : '已下載',
		BroDesc : '簡介',
		BroItem : '項目',
		BroPage : '頁碼',
		BroSugLoad : '正在讀取蒐索建議 ~0~',
		BroSugDone : '關於 ~0~ 的蒐索建議',

		LstRemove : '移除',
		LstDelConfirm : '確認移除?',
		LstDelCount : '共計~0~個項目',
		LstDetail : '詳細',
		LstLoad : '正在讀取任務信息...',
		LstFail : '未能讀取任務信息.',
		LstBriefErr : '未能讀取~0~列表, 已嘗試~1~次',
		LstBriefRead : '嘗試重新讀取~0~列表',
		DetRow : '任務ID',
		DetBirth : '創建於',
		DetUp : '上傳者',
		DetDate : '上傳於',
		DetPartC : '章節數',
		DetFileC : '文件數',
		DetRoot : '下載目錄',
		DetDone : '下載完成於',
		DetPart : '章節',
		DetRun : '運行次數',
		DetFirst : '首次連接於',
		DetTake : '總用時',
		DetAvg : '平均速度',
		StsSelect : '選中~0~個項目',
		StsPlus : ', 其中~0~個在排隊獲取信息',

		Col : '準備下載',
		ColCommit : '下載',
		ColCommitAll : '下載全部',

		Hot : '正在下載',
		HotPause : '暫停',
		HotPlay : '繼續',
		HotReady : '準備解析下載信息',
		HotSolve : '正在解析下載信息...',
		HotRenew : '重新解析下載信息...',
		HotQueue : '正在排隊',
		HotPaused : '已暫停',

		His : '已下載',

		Cmp : '組件',

		Aut : '驗證',
		AutToken : '密鑰',
		AutAut : '驗證',
		AutNew : '新密鑰',
		AutSave : '保存新密鑰',
		AutAuthing : '正在驗證...',
		AutAuthed : '驗證通過!',
		AutAlready : '已經驗證過了',
		AutSaving : '正在保存新密鑰...',
		AutSaved : '新密鑰已保存! 將重新連接',
		AutEnt : '去驗證',
		AutSite : '選擇一個站點',
		AutMin : '僅保存最簡Cookie項',
		AutCoke : 'Cookie',
		AutCokeSave : '保存Cookie',
		AutCheck : '正在確認登入狀態',
		AutSigned : '已登入',
		AutNoSign : '未登入',

		Sot : '快捷鍵',
		SotDown : '當按鍵按下',
		SotUp : '當按鍵釋放',
		SotInp : '當光標位於輸入框中',
		SotSet : '設定一個快捷鍵',
		SotAdd : '增加',
		SotRemove : '移除',
		SotRestore : '恢復初始快捷鍵',
		SotGenTabPrev : '通用 | 跳轉至下一標籤',
		SotGenTabNext : '通用 | 跳轉至上一標籤',
		SotGenProxy : '通用 | 切換代理狀態',
		SotGenFocusKeywordInput : '通用 | 跳轉至關鍵字輸入框',
		SotGenFocusAuth : '通用 | 跳轉至驗證密鑰輸入框',
		SotBroSelAll : '瀏覽 | 將當前頁所有未下載的項目加入到準備列表中',
		SotBroSelClear : '瀏覽 | 從準備列表中移除當前頁面所有項目',
		SotBroHead : '瀏覽 | 到首頁',
		SotBroPrev : '瀏覽 | 上一頁',
		SotBroNext : '瀏覽 | 下一頁',
		SotBroLast : '瀏覽 | 到末頁',
		SotColCommit : '準備列表 | 下載選中項目',
		SotColCommitAll : '準備列表 | 下載所有項目',
		SotLstSelAll : '列表 | 選中所有項目',
		SotLstSelClear : '列表 | 清除選中狀態',
		SotOlyClose : '遮罩頁 | 關閉',

		Set : '設定',
		SetLang : '語言',
		SetLangH : '語言變更將於頁面重載後生效',
		SetDir : '下載目錄',
		SetDirH : '存放下載文件的絕對路徑',
		SetFmt : '文件名格式',
		SetFmtH : '格式請參閱使用說明',
		SetMax : '最大同時下載的任務量',
		SetProxy : '下載代理',
		SetProxyE : '代理已啓用',
		SetProxyD : '代理已禁用',
		SetURL : '代理地址',
		SetURLH : 'Host:Port',
		SetImg : '圖片代理',
		SetImgNo : '不使用代理',
		SetImgDown : '使用下載代理',
		SetDelay : '下載失敗重試前的等待時間(秒)',
		SetSize : '下載前解析文件大小',
		SetMerge : '合併命令',

		SocConn : '正在連接...',
		SocOn : '已連接',
		SocOff : '連接斷開. 自 ~0~, 已嘗試~1~次',
		SocRetry : '重試',
		SocSite : '加載站點腳本用時過久...',

		Err : '發生錯誤',
		ErrOff : '連接斷開時無法操作',
		ErrNoAuth : '未驗證時無法操作',
		ErrBadRes : '無效的響應 | ~0~',

		ErrBadReq : '無效的請求',
		ErrAuthFail : '驗證失敗',
		ErrAuthInc : '原密鑰不正確',
		ErrAuthSave : '新密鑰保存失敗 ~0~',
		ErrUnkSite : '未知站點 ~0~',
		ErrSetDir : '下載目錄不是一個絕對路徑',
		ErrDBNo : '任務ID不存在 ~0~',
		ErrDBHas : '該任務已加入到下載列表中 ~0~',
		ErrDBAdding : '同時有其他請求將該任務加入到下載列表中 ~0~',
		ErrLoopURL : '部分URL解析失敗\n~0~',
		ErrLoopSize : '解析文件大小失敗\n~0~',

		'' : ''
	},
	CMNHanS :
	{
		Name : '汉文',
		Title : 'CrabSave',

		GenDisabled : '禁用',
		GenEnabled : '启用',
		GenLoading : '正在读取...',
		GenNoSock : '当前浏览器不支持WebSocket',
		GenNoRel : '备选项中没有相关条目',
		GenCancel : '取消',
		GenUnknown : '[未知:~0~]',
		GenUntitle : '[无标题]',

		Bro : '浏览',
		BroUnSite : '未知站点 `~0~`',
		BroUnParse : '无法识别 `~0~`',
		BroUnSol : '无法在 `~1~` 中识别 `~0~`',
		BroKeyword : '关键字或链接',
		BroAdd : '加入准备列表',
		BroCold : '准备下载',
		BroHot : '正在下载',
		BroHist : '已下载',
		BroDesc : '简介',
		BroItem : '项目',
		BroPage : '页码',
		BroSugLoad : '正在读取搜索建议 ~0~',
		BroSugDone : '关于 ~0~ 的搜索建议',

		LstRemove : '移除',
		LstDelConfirm : '确认移除?',
		LstDelCount : '共计~0~个项目',
		LstDetail : '详细',
		LstLoad : '正在读取任务信息...',
		LstFail : '未能读取任务信息.',
		LstBriefErr : '未能读取~0~列表, 已尝试~1~次',
		LstBriefRead : '尝试重新读取~0~列表',
		DetRow : '任务ID',
		DetBirth : '创建于',
		DetUp : '上传者',
		DetDate : '上传于',
		DetPartC : '章节数',
		DetFileC : '文件数',
		DetRoot : '下载目录',
		DetDone : '下载完成于',
		DetPart : '章节',
		DetRun : '运行次数',
		DetFirst : '首次连接于',
		DetTake : '总用时',
		DetAvg : '平均速度',
		StsSelect : '选中~0~个项目',
		StsPlus : ', 其中~0~个在排队获取信息',

		Col : '准备下载',
		ColCommit : '下载',
		ColCommitAll : '下载全部',

		Hot : '正在下载',
		HotPause : '暂停',
		HotPlay : '继续',
		HotReady : '准备解析下载信息',
		HotSolve : '正在解析下载信息...',
		HotRenew : '重新解析下载信息...',
		HotQueue : '正在排队',
		HotPaused : '已暂停',

		His : '已下载',

		Cmp : '组件',

		Aut : '验证',
		AutToken : '密钥',
		AutAut : '验证',
		AutNew : '新密钥',
		AutSave : '保存新密钥',
		AutAuthing : '正在验证...',
		AutAuthed : '验证通过!',
		AutAlready : '已經验证过了',
		AutSaving : '正在保存新密钥...',
		AutSaved : '新密钥已保存! 将重新连接',
		AutEnt : '去验证',
		AutSite : '选择一个站点',
		AutMin : '仅保存最简Cookie项',
		AutCoke : 'Cookie',
		AutCokeSave : '保存Cookie',
		AutCheck : '正在确认登入状态',
		AutSigned : '已登入',
		AutNoSign : '未登入',

		Sot : '快捷键',
		SotDown : '当按鍵按下',
		SotUp : '当按鍵释放',
		SotInp : '当光标位于输入框中',
		SotSet : '设定一個快捷鍵',
		SotAdd : '增加',
		SotRemove : '移除',
		SotRestore : '恢复初始快捷键',
		SotGenTabPrev : '通用 | 跳转至下一标签',
		SotGenTabNext : '通用 | 跳转至上一标签',
		SotGenProxy : '通用 | 切换代理状态',
		SotGenFocusKeywordInput : '通用 | 跳转至关键字輸入框',
		SotGenFocusAuth : '通用 | 跳转至验证密钥输入框',
		SotBroSelAll : '浏览 | 将当前页所有未下载的项目加入到准备列表中',
		SotBroSelClear : '浏览 | 从准备列表中移除当前页面所有项目',
		SotBroHead : '浏览 | 到首页',
		SotBroPrev : '浏览 | 上一页',
		SotBroNext : '浏览 | 下一页',
		SotBroLast : '浏览 | 到末页',
		SotColCommit : '准备列表 | 下载选中项目',
		SotColCommitAll : '准备列表 | 下载所有项目',
		SotLstSelAll : '列表 | 选中所有项目',
		SotLstSelClear : '列表 | 清除选中状态',
		SotOlyClose : '遮罩页 | 关闭',

		Set : '设定',
		SetLang : '语言',
		SetLangH : '语言变更将于页面刷新后生效',
		SetDir : '下载目录',
		SetDirH : '存放下载文件的绝对路径',
		SetFmt : '文件名格式',
		SetFmtH : '格式请参阅使用说明',
		SetMax : '最大同时下载的任务量',
		SetProxy : '下载代理',
		SetProxyE : '代理已启用',
		SetProxyD : '代理已禁用',
		SetURL : '代理地址',
		SetURLH : 'Host:Port',
		SetImg : '图片代理',
		SetImgNo : '不使用代理',
		SetImgDown : '使用下载代理',
		SetDelay : '下载失败重试前的等待时间(秒)',
		SetSize : '下载前解析文件大小',
		SetMerge : '合并命令',

		SocConn : '正在连接...',
		SocOn : '已连接',
		SocOff : '连接断开. 自 ~0~, 已尝试~1~次',
		SocRetry : '重试',
		SocSite : '加載站点脚本用时过久...',

		Err : '发生异常',
		ErrOff : '连接断开时无法操作',
		ErrNoAuth : '未验证时无法操作',
		ErrBadRes : '无效的响应 | ~0~',

		ErrBadReq : '无效的请求',
		ErrAuthFail : '验证失败',
		ErrAuthInc : '原密钥不正确',
		ErrAuthSave : '新密钥保存失败 ~0~',
		ErrUnkSite : '未知站点 ~0~',
		ErrSetDir : '下载目录不是一个绝对路径',
		ErrDBNo : '任务ID不存在 ~0~',
		ErrDBHas : '该任务已加入到下载列表中 ~0~',
		ErrDBAdding : '同时有其他请求将该任务加入到下载列表中 ~0~',
		ErrLoopURL : '部分URL解析失败\n~0~',
		ErrLoopSize : '解析文件大小失败\n~0~',

		'' : ''
	},
	JA :
	{
		Name : '日本語',
		Title : 'CrabSave',

		GenDisabled : '無効',
		GenEnabled : '有効',
		GenLoading : '読み込み中...',
		GenNoSock : 'WebSocketはサポートされていません',
		GenNoRel : '関連アイテムはありません',
		GenCancel : 'キャンセル',
		GenUnknown : '[未知:~0~]',
		GenUntitle : '[無題]',

		Bro : 'ブラウザ',
		BroUnSite : '未知なサイト `~0~`',
		BroUnParse : '`~0~` を解析できません',
		BroUnSol : 'サイト `~1~` 內 `~0~` を解決できません',
		BroKeyword : 'キーワードまたはURL',
		BroAdd : '追加',
		BroCold : 'コールド',
		BroHot : 'ホット',
		BroHist : 'ダウンロード済み',
		BroDesc : '説明',
		BroItem : '項目',
		BroPage : 'ページ',
		BroSugLoad : '~0~ の提案を読み込み中...',
		BroSugDone : '~0~ の提案',

		LstRemove : '削除',
		LstDelConfirm : '削除してもよろしいですか？',
		LstDelCount : '合計~0~アイテム',
		LstDetail : '詳細',
		LstLoad : 'タスクを読み込み中...',
		LstFail : '読み込みに失敗しました。',
		LstBriefErr : '~0~リストの読み取りに失敗しました、~1~回試行しました。',
		LstBriefRead : '~0~リストをもう一度読み込み中...',
		DetRow : 'タスクID',
		DetBirth : '作成日',
		DetUp : 'アップロード主',
		DetDate : 'アップロード日',
		DetPartC : 'チャプター数',
		DetFileC : 'ファイル数',
		DetRoot : 'ダウンロード先',
		DetDone : '完了日',
		DetPart : 'チャプター',
		DetRun : 'アクセス回数',
		DetFirst : '最初のバイト',
		DetTake : '時間経過',
		DetAvg : '平均速度',
		StsSelect : '~0~アイテムを選択中',
		StsPlus : '、その中~0~アイテムは情報を読み込み中...',

		Col : 'コールド',
		ColCommit : 'コミット',
		ColCommitAll : 'すべてをコミット',

		Hot : 'ホット',
		HotPause : '一時停止',
		HotPlay : '再起動',
		HotReady : '情報を読み込むの待機中',
		HotSolve : '情報の読み込み中...',
		HotRenew : '情報の更新中...',
		HotQueue : '待機中',
		HotPaused : '一時停止',

		His : 'ダウンロード済み',

		Cmp : '部品',

		Aut : '認証',
		AutToken : 'Token',
		AutAut : '認証',
		AutNew : '新しいToken',
		AutSave : '新しいTokenを保存',
		AutAuthing : '認証中...',
		AutAuthed : '認証済み！',
		AutAlready : 'すでに認証済み',
		AutSaving : '新しいTokenを保存中...',
		AutSaved : '新しいTokenが保存されました！再び接続します',
		AutEnt : 'Tokenを入力',
		AutSite : 'Cookieを操作するサイトを選択してください',
		AutMin : '最低限必要なCookieエントリで保存',
		AutCoke : 'Cookie',
		AutCokeSave : 'Cookieを保存する',
		AutCheck : 'ログインしているかどうかを確認中',
		AutSigned : 'ログインしています',
		AutNoSign : 'ログインしていません',

		Sot : 'ショートカット',
		SotDown : 'キーダウン',
		SotUp : 'キーアップ',
		SotInp : 'テキスト入力のフォーカスの時',
		SotSet : 'ショートカットを設定してください',
		SotAdd : '追加',
		SotRemove : '削除',
		SotRestore : '既定値に戻す',
		SotGenTabPrev : '全般 | 前のタブに切り替える',
		SotGenTabNext : '全般 | 次のタブに切り替える',
		SotGenProxy : '全般 | プロキシの切り替える',
		SotGenFocusKeywordInput : '全般 | キーワード入力にフォーカス',
		SotGenFocusAuth : '全般 | 認証Token入力にフォーカス',
		SotBroSelAll : 'ブラウザ | ダウンロードされていないすべての表示されだアイテムをコールドリストに追加する',
		SotBroSelClear : 'ブラウザ | コールドリストからすべての表示されだアイテムを削除する',
		SotBroHead : 'ブラウザ | 最初のページヘ',
		SotBroPrev : 'ブラウザ | 前のページへ',
		SotBroNext : 'ブラウザ | 次のページへ',
		SotBroLast : 'ブラウザ | 最後のページへ',
		SotColCommit : 'コールド | 選択したアイテムをコミット',
		SotColCommitAll : 'コールド | すべてのアイテムをコミット',
		SotLstSelAll : 'リスト | すべてのアイテムを選択',
		SotLstSelClear : 'リスト | 選択のクリア',
		SotOlyClose : 'オーバーレイ | オーバーレイページを閉じる',

		Set : '設定',
		SetLang : '言語',
		SetLangH : '言語の変更は、ページがリロードされると有効になります',
		SetDir : 'ダウンロード先',
		SetDirH : 'ダウンロード先のフルパス',
		SetFmt : 'ファイル名のフォーマット',
		SetFmtH : 'フォーマットについては、マニュアルを確認してください',
		SetMax : 'ダウンロードの最大同時実行数',
		SetProxy : 'ダウンローダープロキシ',
		SetProxyE : 'プロキシ有効',
		SetProxyD : 'プロキシ無効',
		SetURL : 'プロキシサーバーのアドレス',
		SetURLH : 'Host:Port',
		SetImg : '画像プロキシ',
		SetImgNo : 'プロキシなし',
		SetImgDown : 'ダウンローダープロキシを使用する',
		SetDelay : 'エラー後の再試行遅延 (秒)',
		SetSize : 'ダウンロードする前にファイルサイズを解決する',
		SetMerge : 'マージコマンド',

		SocConn : '接続中...',
		SocOn : '接続済み',
		SocOff : 'オフライン、~0~から~1~回試行済み',
		SocRetry : '再試行',
		SocSite : 'サイトスクリプトの読み込みに時間がかかりすぎる...',

		Err : 'エラー',
		ErrOff : 'オフライン時には実行できません',
		ErrNoAuth : '認証しないと実行することはできません',
		ErrBadRes : '応答を理解できません | ~0~',

		ErrBadReq : 'リクエストを理解できません',
		ErrAuthFail : '認証に失敗しました',
		ErrAuthInc : '元のTokenが正しくありません',
		ErrAuthSave : '新しいTokenを保存できませんでした ~0~',
		ErrUnkSite : '未知なサイト ~0~',
		ErrSetDir : 'ダウンロード先はフルパスではありません',
		ErrDBNo : 'タスクはありません ~0~',
		ErrDBHas : 'ホットリストには既に~0~が含まれています',
		ErrDBAdding : '~0~は既に追加中',
		ErrLoopURL : '一部のURLを解決できませんでした\n~0~',
		ErrLoopSize : 'サイズを解決できませんでした\n~0~',

		'' : ''
	}
}