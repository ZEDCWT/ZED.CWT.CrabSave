
/// <reference path="../jquery/jquery.d.ts"/>

declare module 'zedquery'
{
	type SN = string | number
	type DOM = Element | JQuery | ZEDQueryDOM

	type CallAny = () => any

	type CallT<T> = (F : number,V : T) => any
	type Call = (F : SN,V : any) => any
	type CallKeyT<T> = (F : number) => any
	type CallKey = (F : SN) => any
	type CallValueT<T> = (V : T) => any
	type CallValue = (V : any) => any

	type CallReduceFullT<T> = (D : any,F : number,V : T) => any
	type CallReduceFull = (D : any,F : SN,V : any) => any
	type CallReduceKeyT<T> = (D : any,F : number) => any
	type CallReduceKey = (D : any,F : SN) => any
	type CallReduceValueT<T> = (D : any,V : T) => any
	type CallReduceValue = (D : any,V : any) => any
	type CallReduceThis = (D : any) => any

	interface ZEDQuery
	{
		Version : string



		(Selector : string,Context? : DOM) : ZEDQueryDOM
		(Element : DOM) : ZEDQueryDOM
		(Elements : DOM[]) : ZEDQueryDOM
		(Call : (jQueryAlias? : JQueryStatic) => any) : ZEDQueryDOM
		(Object : {} | JQuery | ZEDQueryDOM) : ZEDQueryDOM
		() : ZEDQueryDOM



		//Tool
		Mark() : Mark



		curry(Func : Function,ArgLen? : number) : Function
		__ : Mark
		always
		T
		F
		each
		map
		reduce
		args
		identity
		type
		invokeProp
		invoke
		defaultTo
		chr
		asc
		trim
		test
		match
		toLower
		toUpper
		replace
		replaceList
		split
		join
		empty
		keys
		has
		prop
		props
		propSatisfies
		propEq
		propOr
		path
		pathSatisfies
		pathEq
		pathOr
		flip
		nth
		first
		head
		last
		slice
		len
		init
		tail
		concat
		compose
		pipe
		sequence
		identical
		equals
		eqBy
		eqProps
		not
		negate
		add
		subtract
		inc
		dec
		multiply
		divide
		modulo
		lt
		lt_
		isLt
		lte
		lte_
		isLte
		gt
		gt_
		isGt
		gte
		gte_
		isGte
		max
		min
		when
		unless
		iif
		ifElse
		cond
		of
		objOf
		sum
		mean
		product
		find
		filter
		range
		tap

		isFunction
		isObject
		isArray
		isString
		isNumber
		isBoolean
		isNull
		isArguments
		isDate
		isRegExp
		isNode
		isArrayLike
		isEmpty



		Curry(Func : Function,ArgLen? : number) : Function

		Each<T>(Q : T[],C : CallT<T>,Edit? : boolean) : T[]
		Each(Q : any,C : Call,Edit? : boolean) : any
		EachKey<T>(Q : T[],C : CallKeyT<T>,Edit? : boolean) : T[]
		EachKey(Q : any,C : CallKey,Edit? : boolean) : any
		EachValue<T>(Q : T[],C : CallValueT<T>,Edit? : boolean) : T[]
		EachValue(Q : any,C : CallValue,Edit? : boolean) : any
		EachThis<T>(Q : T[],C : CallAny,Edit? : boolean) : T[]
		EachThis(Q : any,C : CallAny,Edit? : boolean) : any

		Map<T>(Q : T[],C : CallT<T>) : T[]
		Map(Q : any,C : Call) : any
		MapKey<T>(Q : T[],C : CallKeyT<T>) : T[]
		MapKey(Q : any,C : CallKey) : any
		MapValue<T>(Q : T[],C : CallValueT<T>) : T[]
		MapValue(Q : any,C : CallValue) : any
		MapThis<T>(Q : T[],C : CallAny) : T[]
		MapThis(Q : any,C : CallAny) : any

		Reduce<T>(Q : T[],C : CallReduceFullT<T>,D? : any) : any
		Reduce(Q : any,C : CallReduceFull,D? : any) : any
		ReduceKey<T>(Q : T[],C : CallReduceKeyT<T>,D? : any) : any
		ReduceKey(Q : any,C : CallReduceKey,D? : any) : any
		ReduceValue<T>(Q : T[],C : CallReduceValueT<T>,D? : any) : any
		ReduceValue(Q : any,C : CallReduceValue,D? : any) : any
		ReduceThis<T>(Q : T[],C : CallReduceThis,D? : any) : any
		ReduceThis(Q : any,C : CallReduceThis,D? : any) : any

		Sum(Q : any) : SN
		Product(Q : any) : SN
		One<T>(Q : T[],C : CallT<T>) : T
		One(Q : any,C : Call) : any
		Find<T>(Q : T[],C : CallT<T>) : T
		Find(Q : any,C : Call) : any
		Filter<T>(Q : T[],C : CallT<T>) : T[]
		Filter(Q : any,C : Call) : any

		CHR(Q : string,Index? : number) : number
		ASC(CharCode : number) : string



		Code : Code

		Range() : any
		Range(Count : number) : number[]
		Range(From : number,To : number) : number[]
		Range(From : number,Step : number,To : number) : number[]
		Range(Q : any) : any



		Merge(Target : any,...A : any[]) : any
		Merge(Cover : boolean,Target : any,...A : any[]) : any
		Merge(Cover : boolean,Deep : boolean,Target : any,...A : any[]) : any
		MergeOuter(Target : any,...A : any[]) : any
		MergeOuter(Cover : boolean,Target : any,...A : any[]) : any
		MergeOuter(Cover : boolean,Deep : boolean,Target : any,...A : any[]) : any



		Arrayify(Q : any) : any[]
		ReduceToObject(Key0? : any,Value0? : any,...KV : any[]) : any
		RuledArray(Rule : (number | (number | number[])[])[]) : any
		Args(Format : IArguments | any[],Rule : string | any,OperatingObject? : any) : any
		Timer(Option : TimerBase) : () => void

		Rnd(Q : number) : number
		Rnd(Min : number,Max : number) : number
		Rnd<T>(Q : T[]) : T
		RndName(Name : any) : string
		RndRGB(Alpha? : boolean) : string
		KeyGen() : string
		KeyGen(Q : boolean) : number

		DateToString(Date? : number | Date,Format? : string) : string
		DateToString(Format? : string,Date? : number | Date) : string

		Cookie() : any
		Cookie(Key : string) : string
		Cookie(Key : string,Remove : boolean,Option? : CookieOption) : string
		Cookie(Key : string,Value : any,Option? : CookieOption) : string
		Cookie(KeyValue : any,Option? : CookieOption) : void

		Storage() : any
		Storage(Key : any) : string
		Storage(Key : any,Remove : boolean) : void
		Storage(Key : any,Value : any) : void



		OTJ(Object : any,Indent? : string,Before? : string,Option? : OTJOption) : string
		OTJ(Object : any,Indent? : string,Option? : OTJOption) : string
		OTJ(Object : any,Option? : OTJOption) : string
		JTO(JSON : string) : any

		URLBuild(...Q : (string | void)[]) : (...Q : any[]) => string
		URLParam(Param : any,Push? : (Result : string[],Key : string,Value : any) => void) : string
		QueryString(Q : string) : any
		Lang(Option :
		{
			Name : string[]
			Default? : string
			Reuse? : string | RegExp
			Storage? : string
		}) : Lang
		Lang(Name : string[]) : Lang
		Lang() : Lang



		//Extendex tool
		eval(Q : string) : any
		now(Q? : Date) : number
		getTime(Q? : Date) : number



		//DOM creator
		Element(...Q : any[]) : ZEDQueryDOM
		CSS(Style : string) : void
		CSS(Style : (Width : number,Height : number) => string) : void
		CSS(Name : string,Style : string) : void
		CSS(Name : string,Style : (Width : number,Height : number) => string) : void
		CSSMulti(Key : string,Value : string) : string
		CSSAnima(Selector : string,KeyFrames : string | any,Setting? : string | any) : string
		CSSAnimation(Selector : string,KeyFrames : string | any,Setting? : string | any) : string



		//Auxiliary
		SameTag(L : any[],Element? : any,Tag? : string) : any
		SameTag(L : any[],Tag? : string,Element? : any) : any
		SameTag(...L : any[]) : any

		Clipboard(Q : any,Element? : any,Call? : (E : string) => void,URL? :string) : any

		SaveAsFile(Content : string) : void
		SaveAsFile(Name : string,Content : string) : void

		Draggable(Q : Draggable) : any
		DraggableList(Q : DraggableList) : any

		SVG(Q? : any,Hint? : string,Empty? : boolean) : SVG

		Touch(DOM? : any,Release? : boolean) : void

		ClearSelection() : void



		//Panel creator
		Select(Option : SelectOption) : SelectReturn
		Preference(Option : PreferenceOption) : JQuery
		Tips(Tip : string,Keep? : boolean) : ZEDQueryDOM
		EasyLog(Format : string | Object,Parent : DOM,DefaultValue : any,Easier? : boolean) : any
		EasyLog(Format : string | Object,Parent : DOM,Easier? : boolean) : any
		EazyLog(Format : string | Object,Parent : DOM,DefaultValue : any,Easier? : boolean) : any
		EazyLog(Format : string | Object,Parent : DOM,Easier? : boolean) : any
		Addable(/*TODO*/) : (Content? : any[],Data? : Object) => AddableReturn
		Log(Parent : DOM) : (Log : string) => void | (() => void)
		Tab(/*TODO*/) : any
		Shape(/*TODO*/) : JQuery



		//Judge
		IsFunction(Q : any) : boolean
		IsObject(Q : any) : boolean
		IsArray(Q : any) : boolean
		IsString(Q : any) : boolean
		IsNumber(Q : any) : boolean
		IsBoolean(Q : any) : boolean
		IsNull(Q : any) : boolean
		IsArguments(Q : any) : boolean
		IsDate(Q : any) : boolean
		IsRegExp(Q : any) : boolean
		IsNode(Q : any) : boolean
		IsArrayLike(Q : any) : boolean
		IsEmpty(Q : any) : boolean



		//Prototype Expand
		Times(Q : string,Time : number) : string
		ReplaceList(Q : string,...R : any[]) : string
		Wrap(Q : string,Wrapper? : string,IEle9? : boolean) : string
		HTML(Q : string,NormalTab? : boolean) : string
		UTF(Q : string) : string
		SafeRegExp(Q : string) : string
		Replace(Pattern : string,...Value : any[]) : string
		Replace(Pattern : string,Value : any) : string
		Replace(Pattern : string,Split : string,Value : any) : string
		Trick(Q : string) : string
		FillLeft(Q : SN,Use : string,Length : number) : string
		FillLeft(Q : number,Length : number) : string
		FillRight(Q : SN,Use : string,Length : number) : string
		FillRight(Q : number,Length : number) : string
		Format(Q : number,Suffix? : number) : string
		FormatSize(Q : number,Radix? : number,Mark? : string[]) : string
		onError : (Error : Error) => any
		Error : Error[]
		Record :
		{
			Running : Date
			Interactive? : Date
			Complete : Date
		}



		//Misc
		GlobalDetect() : any
		Extend(Q : any) : ZEDQuery
	}



	interface ZEDQueryDOM extends Array<Element>
	{
		Version : string



		Tag() : string
		Attr(Name : string) : any
		Attr(Name : string,Value : string) : ZEDQueryDOM
		AppendAttr(Name : string,Value : string) : ZEDQueryDOM
		Hint(Hint : string,Direction? : number,AlwaysShow? : boolean) : ZEDQueryDOM
		RemoveClass(ClassName : string) : ZEDQueryDOM
		Style(Name : string) : any
		Style(Name : string,Value : string) : ZEDQueryDOM
		Input(Call : (e : Event) => any) : ZEDQueryDOM



		toArray() : Element[]
		toJQuery() : JQuery
	}



	//Basic tool
	interface Mark{}

	interface TimerBase
	{
			Min? : number
			Max? : number
			Time? : number
			To? : number
			Show? : (Q : TimerShow) => any
			End : (Q : TimerBase) => any
	}

	interface TimerShow
	{
		Now : number
		Past : number
		Last : number
		Min : number
		Max : number
		Time : number
		To : number
		Show : (Q : TimerShow) => any
		End : (Q : TimerBase) => any
	}

	interface CookieOption
	{
		path? : string
		domain? : string
		expires? : string
	}

	interface CodeWord
	{
		[Index : number] : number
		Length : number
	}

	type CodeWordLike = string | CodeWord
	interface Code
	{
		btoa(Q : string) : string
		atob(Q : string) : string
		MD5Encode(Q : string) : CodeWord
		MD5(Q : string) : string
		MD5Base64(Q : string) : string
		SHA1Encode(Q : string) : CodeWord
		SHA1(Q : string) : string
		SHA1Base64(Q : string) : string
		AES :
		{
			Encode(Q : CodeWordLike,Key? : CodeWordLike,IV? : CodeWordLike,Padding? : number,Mode? : number,ToString? : (Q : CodeWord) => string) : string
			Decode(Q : CodeWordLike,Key? : CodeWordLike,IV? : CodeWordLike,Padding? : number,Mode? : number) : string
			Padding :
			{
				No : number
				Zero : number
				PKCS7 : number
				ANSIX923 : number
				ISO10126 : number
				ISO97971 : number
			}
			Mode :
			{
				CBC : number
				CFB : number
				CTR : number
				OFB : number
				ECB : number
			}



			FromBinB(Q : CodeWordLike,Key? : CodeWordLike,IV? : CodeWordLike,Padding? : number,Mode? : number) : CodeWord
			ToBinB(Q : CodeWordLike,Key? : CodeWordLike,IV? : CodeWordLike,Padding? : number,Mode? : number) : CodeWord
		}



		UTF16To8(Q : string) : string
		UTF8To16(Q : string) : string
		UTF8ToBinB(Q : string) : CodeWord
		BinBToUTF8(Q : CodeWord) : string
		UTF8ToBinL(Q : string) : CodeWord
		BinLToUTF8(Q : CodeWord) : string
		UTF16ToBinB(Q : string) : CodeWord
		BinBToUTF16(Q : CodeWord) : string
		UTF16ToBinL(Q : string) : CodeWord
		BinLToUTF16(Q : CodeWord) : string
		BinBToHEX(Q : CodeWord) : string
		HEXToBinB(Q : string) : CodeWord
		BinLToHEX(Q : CodeWord) : string
		HEXToBinL(Q : string) : CodeWord
		Base64Encode(Q : string) : CodeWord
		Base64Decode(Q : CodeWord) : string
		SafeAdd(A : number,B : number) : number
		BitRotate(A : number,B : number) : number
		BinLToMD5(Q : CodeWord) : CodeWord
		BinBToSHA1(Q : CodeWord) : CodeWord



		JSPackerEncode(Q : string) : string[]
		JSPacker(Q : string,...Char : string[]) : string
		PageToken(Q? : number) : string
		M3U(Q : string,Decode? : any) : any
	}

	interface OTJOption
	{
		Wrapper? : string
		Split? : string
		UTF? : boolean
		Zip? : boolean
	}

	interface Lang
	{
		(Q : any) : any
		(Q : any[]) : any[]
		(Default : any,...Other : any[]) : number
		(Default : any,Other : any) : number

		Name() : string
		Name(Name : string) : void

		UseDefault : Mark
		UseLast : Mark
	}



	//Auxiliary
	interface DraggablePosition
	{
		left : number
		top : number
	}

	interface Draggable
	{
		E : any
		D? : any
		Find? : string
		Start? : (Q : Draggable,Event : any) => any
		Call? : (Q : Draggable,FromPos : DraggablePosition,ToPos : DraggablePosition,Event : any) => any
		End? : (Q : Draggable,FromPos : DraggablePosition,ToPos : DraggablePosition,Event : any) => any
		DragAs? : any
		This? : boolean
		Range? : any
	}

	interface DraggableList
	{
		E : any
		Dir? : boolean
		DragAs? : any
		End? : (Q : DraggableList) => any
	}

	interface SVG
	{
		Support : boolean
		SVG : any
		Defs : any
		DefsStorage : any
		DefsStorageLast : any
		Size : number
		HalfSize : number
		Style : any
		Stack : any
		StackState : boolean
		State : any
		Last : any
		PathPresent : any
		PathState : string

		Save() : SVG
		Restore() : SVG
		Create(Q : string) : any
		Stroke(Q : any) : SVG
		Fill(Q : any) : SVG
		Define(Q : string) : SVG
		Use(Q? : string) : SVG
		CCS() : SVG
		CartesianCoordinateSystem() : SVG
		appendTo(Q : any) : SVG
	}



	//Panel creator
	interface SelectOption
	{
		Opt? : any
		Option? : any
		KVP? : any
		Display? : DOM
		Index? : number
		Alert? : string
		onChange? : (Event : JQueryInputEventObject,Value : any) => any
		Change? : (Event : JQueryInputEventObject,Value : any) => any
	}
	interface SelectReturn
	{
		Select : JQuery
		Outer : JQuery
		Display : JQuery
		Option : JQuery

		KVP() : SelectReturn
		KVP(KVP : any,Index? : number) : SelectReturn
		Opt() : SelectReturn
		Opt(KVP : any,Index? : number) : SelectReturn
		Value() : any
		Index() : number
		Index(Index : number,DoNotTriggerEvent? : boolean) : SelectReturn
		appendTo(DOM : any) : SelectReturn
	}

	interface PreferenceColumn
	{
		Type? : string
		T? : string
		Key? : string
		Data? : Object
		Hint? : string
		Before? : DOM
		After? : DOM

		onChange? : (Event : JQueryEventObject) => any
		Change? : (Event : JQueryEventObject) => any
	}
	interface PreferenceInput extends PreferenceColumn
	{
		Format? : string
		N? : boolean
		F? : boolean
		Min? : number
		Max? : number
		Call? : (Value : any,Data : Object,Event : JQueryInputEventObject) => any
	}
	type PreferenceColumnSet = (PreferenceColumn | any)[]
	interface PreferenceRow
	{
		Title? : string
		Label? : string
		Key? : string
		Data? : Object

		Set? : PreferenceColumnSet
		Pref? : PreferenceColumnSet
		Preference? : PreferenceColumnSet

		onChange? : (Event : JQueryEventObject) => any
		Change? : (Event : JQueryEventObject) => any

		Content? : boolean
		ContentOnly? : boolean
	}
	type PreferenceRowSet = PreferenceRow[] | any[]
	interface PreferenceOption
	{
		Set? : PreferenceRowSet
		Form? : PreferenceRowSet
		Pref? : PreferenceRowSet
		Preference? : PreferenceRowSet
		Parent : DOM
		Data? : Object
		Table? : boolean
		Single? : boolean
		onChange? : (Event : JQueryEventObject) => any
		Change? : (Event : JQueryEventObject) => any
	}

	interface AddableReturn
	{
		[Index : number] : JQuery
		Remove() : void
	}



	var ZED : ZEDQuery
	export = ZED
}
declare module '@zed.cwt/zedquery'
{
	import * as ZED from 'zedquery'
	export = ZED
}