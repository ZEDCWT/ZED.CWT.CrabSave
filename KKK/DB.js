'use strict'
var
Config = require('../Config'),
Util = require('./Util'),
Lang = require('./Lang'),
L = Lang.L,

Path = require('path'),

NeDB = require('nedb'),

TreeWalkLeft = function(Q,S)
{
	var D,F;
	Q.left && TreeWalkLeft(Q.left,S)
	D = Q.data
	for (F = 0;F < D.length;++F) S(D[F])
	Q.right && TreeWalkLeft(Q.right,S)
},
TreeWalkRight = function(Q,S)
{
	var D,F;
	Q.right && TreeWalkRight(Q.right,S)
	D = Q.data
	for (F = D.length;F;) S(D[--F])
	Q.left && TreeWalkRight(Q.left,S)
};

module.exports = function(Q,C,K)
{
	var
	File = Path.join(Config.Root,Q),
	Data = new NeDB(File),

	Y = function(E)
	{
		if (E) Util.Fatal(L(Lang.FData) + '\n' + E)
		else if (K.length)
		{
			E = K.pop()
			Data.ensureIndex({fieldName : E[0],unique : E[1]},Y)
		}
		else C()
	};

	Data.loadDatabase(Y)

	return {
		Data : Data,
		Each : function(C,Q)
		{
			TreeWalkLeft(Data.indexes[Q || '_id'].tree.tree,C)
		},
		EachRight : function(C,Q)
		{
			TreeWalkRight(Data.indexes[Q || '_id'].tree.tree,C)
		}
	}
}