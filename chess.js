var whitePieces = [];
var blackPieces = [];

var initBoard = function() {
	for (var ii = 7; ii >=0; ii--) {
		var row = '<tr>';
		for (var jj = 0; jj < 8; jj++) {
			row += '<td data-x="' + jj + '" data-y="' + ii + '" ondrop="dropped(event)" ondragend="dragEnd(event)"></td>';
		}
		row += '</td>'
		$('#chessboard').append(row);
	}
	
	for (var ii = 0; ii < 8; ii++) {
		whitePieces.push(new WhitePawn(ii));
		blackPieces.push(new BlackPawn(ii));
	}
	
	whitePieces.push(new Knight(true, true));
	whitePieces.push(new Knight(true, false));
	blackPieces.push(new Knight(false, true));
	blackPieces.push(new Knight(false, false));
	
	whitePieces.push(new Bishop(true, true));
	whitePieces.push(new Bishop(true, false));
	blackPieces.push(new Bishop(false, true));
	blackPieces.push(new Bishop(false, false));
	
	whitePieces.push(new Rook(true, true));
	whitePieces.push(new Rook(true, false));
	blackPieces.push(new Rook(false, true));
	blackPieces.push(new Rook(false, false));
	
	whitePieces.push(new Queen(true));
	blackPieces.push(new Queen(false));
	
	whitePieces.push(new King(true));
	blackPieces.push(new King(false));
	
	for (var ii = 0; ii < 16; ii++) {
		whitePieces[ii].arrayIndex = ii;
		blackPieces[ii].arrayIndex = ii;
	}
	
	renderBoard();
}

var renderBoard = function() {
	for (var ii = 0; ii < whitePieces.length; ii++) {
		whitePieces[ii].render();
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		blackPieces[ii].render();
	}
}

// Checks if the cell is occupied
// Returns the piece occupying if it is
// Returns an empty structure if it is not
var isOccupied = function(x, y, whitePieces, blackPieces) {
	for (var ii = 0; ii < whitePieces.length; ii++) {
		var piece = whitePieces[ii];
		if (piece.currentX === x && piece.currentY === y) {
			return true;
		}
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		var piece = blackPieces[ii];
		if (piece.currentX === x && piece.currentY === y) {
			return true;
		}
	}
	return false;
}

// Checks if the cell is occupied
// Returns the piece occupying if it is
// Returns an empty structure if it is not
var getPieceAt = function(x, y, whitePieces, blackPieces) {
	for (var ii = 0; ii < whitePieces.length; ii++) {
		if (whitePieces[ii].currentX === x && whitePieces[ii].currentY === y) {
			return whitePieces[ii];
		}
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		if (blackPieces[ii].currentX === x && blackPieces[ii].currentY === y) {
			return blackPieces[ii];
		}
	}
	return {};
}

// Adds the move if the cell is empty or occupied by the enemy
// Returns true if the cell is occupied
var addMove = function(x, y, isWhite, moves, whitePieces, blackPieces) {
	for (var ii = 0; ii < whitePieces.length; ii++) {
		if (whitePieces[ii].currentX === x && whitePieces[ii].currentY === y) {
			if (!isWhite) moves.push([x, y, ii]);
			return true;
		}
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		if (blackPieces[ii].currentX === x && blackPieces[ii].currentY === y) {
			if (isWhite) moves.push([x, y, ii]);
			return true;
		}
	}
	moves.push([x, y]);
	return false;
}

var evaluateBoard = function(w, b) {
	var advantageWhite = 0;
	for (var ii = 0; ii < w.length; ii++) {
		advantageWhite += w[ii].value;
	}
	for (var ii = 0; ii < b.length; ii++) {
		advantageWhite -= b[ii].value;
	}
	return advantageWhite;
}

var getDepth = function() {
	return $('#depthinput').val() * 1;
}

var setDepth = function(value) {
	return $('#depthinput').val(value);
}

var play = function() {
	$('#button').hide();
	console.log('start');
	var result = think(true);
	executeMove(result.piece, result.move[0], result.move[1]);
	console.log('stop');
}

var executeMove = function(piece, newX, newY) {
	var pieceWhereMoving = getPieceAt(newX, newY, whitePieces, blackPieces);
	{
		if (pieceWhereMoving.isWhite === true) {
			var index = whitePieces.indexOf(pieceWhereMoving);
			whitePieces.splice(index, 1);
		}
		if (pieceWhereMoving.isWhite === false) {
			var index = blackPieces.indexOf(pieceWhereMoving);
			blackPieces.splice(index, 1);
		}
	}
	var oldColIndex = piece.currentX + 1;
	var oldRowIndex = 8 - piece.currentY;
	var newColIndex = newX + 1;
	var newRowIndex = 8 - newY;
	$('#chessboard tr:nth-child(' + oldRowIndex + ') td:nth-child(' + oldColIndex +')').html('').off('dragstart').removeAttr('draggable');
	$('#chessboard tr:nth-child(' + newRowIndex + ') td:nth-child(' + newColIndex +')').off('dragstart').removeAttr('draggable');
	piece.currentX = newX;
	piece.currentY = newY;
	for (var ii = 0; ii < whitePieces.length; ii++)
		whitePieces[ii].arrayIndex = ii;
	for (var ii = 0; ii < blackPieces.length; ii++)
		blackPieces[ii].arrayIndex = ii;
	
	renderBoard();
}

var think = function(isWhitePlaying) {
	var chosenPieceIndex;
	var chosenMove;
	var evaluation = isWhitePlaying ? -1000 : 1000;
	var depth = getDepth();
	var pieces = isWhitePlaying ? whitePieces : blackPieces;
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].getMoves(whitePieces, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {
			var move = moves[jj];
			var tempEval = 0;
			if (isWhitePlaying) tempEval = thinkAsBlack(whitePieces, blackPieces, pieces[ii], move, depth);
			else tempEval = thinkAsWhite(whitePieces, blackPieces, pieces[ii], move, depth);
			console.log(pieces[ii]._symbol + ' at ' + pieces[ii].currentX + ', ' + pieces[ii].currentY + ' moving to ' + move[0] + ', ' + move[1] + ' has an evaluation of ' + tempEval);
			if (tempEval > evaluation) {
				evaluation = tempEval;
				chosenMove = move;
				chosenPieceIndex = ii;
			}
		}
	}
	return { piece : pieces[chosenPieceIndex], move : chosenMove };
}

var thinkAsBlack = function(whitePieces, blackPieces, piece, move, depth) {
	var blackPiecesCopy = blackPieces;
	if (move.length > 2) { // a piece is taken
		blackPiecesCopy = blackPieces.slice();
		blackPiecesCopy.splice(move[2], 1);
	}
	if (depth === 0) return evaluateBoard(whitePieces, blackPiecesCopy);
	var evaluation = 1000;
	var oldX = piece.currentX;
	var oldY = piece.currentY;
	piece.currentX = move[0];
	piece.currentY = move[1];	
	for (var ii = 0; ii < blackPiecesCopy.length; ii++) {
		var moves = blackPiecesCopy[ii].getMoves(whitePieces, blackPiecesCopy);
		for (var jj = 0; jj < moves.length; jj++) {
			evaluation = Math.min(thinkAsWhite(whitePieces, blackPiecesCopy, blackPiecesCopy[ii], moves[jj], depth - 1), evaluation);
		}
	}
	piece.currentX = oldX;
	piece.currentY = oldY;
	return evaluation;
}

var thinkAsWhite = function(whitePieces, blackPieces, piece, move, depth) {
	var whitePiecesCopy = whitePieces;
	if (move.length > 2) { // a piece is taken
		whitePiecesCopy = whitePieces.slice();
		whitePiecesCopy.splice(move[2], 1);
	}
	if (depth === 0) return evaluateBoard(whitePiecesCopy, blackPieces);
	var evaluation = -1000;
	var oldX = piece.currentX;
	var oldY = piece.currentY;
	piece.currentX = move[0];
	piece.currentY = move[1];	
	for (var ii = 0; ii < whitePiecesCopy.length; ii++) {
		var moves = whitePiecesCopy[ii].getMoves(whitePiecesCopy, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {			
			evaluation = Math.max(thinkAsBlack(whitePiecesCopy, blackPieces, whitePiecesCopy[ii], moves[jj], depth - 1), evaluation);
		}
	}
	piece.currentX = oldX;
	piece.currentY = oldY;
	return evaluation;
}

/* Abstract class */
var Piece = function(isWhite) {
	this.isWhite = isWhite;
	this.currentX = null;
	this.currentY = this.isWhite ? 0 : 7;
	
	this.render = function() {
		var that = this;
		$('#chessboard tr:nth-child(' + (8 - this.currentY) + ') td:nth-child(' + (this.currentX + 1) +')')
			.attr('draggable', true)
			.on('dragstart', function(ev) { dragStart(ev, that) })
			.html(this._symbol);
	}
			
	this.SimpleRender = function() {
		$('#chessboard tr:nth-child(' + (8 - this.currentY) + ') td:nth-child(' + (this.currentX + 1) +')').html(this._symbol);
	}
	
	this.getMoves = function(w, b) {
		throw 'NotImplementedException';
		return moves;
	}
}

/* Pieces behaviours */
var WhitePawn = function(startX) {
	this.base = Piece;
	this.base(true);
	this._symbol =  '♙';
	this.currentX = startX;
	this.currentY = 1;
	this.value = 1;
	
	this.getMoves = function(w, b) {
		var moves = [];
		if (!isOccupied(this.currentX, this.currentY + 1, w, b)) {
			moves.push([this.currentX, this.currentY + 1]);
			if (this.currentY === 1 && !isOccupied(this.currentX, this.currentY + 2, w, b))
				moves.push([this.currentX, this.currentY + 2]);
		}
		if (this.currentX < 7) {
			for (var ii = 0; ii < blackPieces.length; ii++) {
				var newX = this.currentX + 1;
				var newY = this.currentY + 1;
				if (blackPieces[ii].currentX === newX && blackPieces[ii].currentY === newY) {
					moves.push([newX, newY, blackPieces[ii]]);
					break;
				}
			}
		}
		if (this.currentX > 0) {
			for (var ii = 0; ii < blackPieces.length; ii++) {
				var newX = this.currentX - 1;
				var newY = this.currentY + 1;
				if (blackPieces[ii].currentX === newX && blackPieces[ii].currentY === newY) {
					moves.push([newX, newY, blackPieces[ii]]);
					break;
				}
			}
		}
		return moves;
	}
}

var BlackPawn = function(startX) {
	this.base = Piece;
	this.base(false);
	this._symbol =  '♟';
	this.currentX = startX;
	this.currentY = 6;
	this.value = 1;
	
	this.getMoves = function(w, b) {
		var moves = [];
		if (!isOccupied(this.currentX, this.currentY - 1, w, b)) {
			moves.push([this.currentX, this.currentY - 1]);
			if (this.currentY === 6 && !isOccupied(this.currentX, this.currentY - 2, w, b))
				moves.push([this.currentX, this.currentY - 2]);
		}
		if (this.currentX < 7) {
			for (var ii = 0; ii < whitePieces.length; ii++) {
				var newX = this.currentX + 1;
				var newY = this.currentY - 1;
				if (whitePieces[ii].currentX === newX && whitePieces[ii].currentY === newY) {
					moves.push([newX, newY, whitePieces[ii]]);
					break;
				}
			}
		}
		if (this.currentX > 0) {
			for (var ii = 0; ii < whitePieces.length; ii++) {
				var newX = this.currentX - 1;
				var newY = this.currentY - 1;
				if (whitePieces[ii].currentX === newX && whitePieces[ii].currentY === newY) {
					moves.push([newX, newY, whitePieces[ii]]);
					break;
				}
			}
		}
		return moves;
	}
}

var Knight = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♘' : '♞';
	this.currentX = isLeft ? 1 : 6;
	this.value = 2;
	
	this.getMoves = function(w, b) {
		var moves = [];
		if (this.currentX > 0) {
			if (this.currentY > 1)
				addMove(this.currentX - 1, this.currentY - 2, this.isWhite, moves, w, b);
			if (this.currentY < 6)
				addMove(this.currentX - 1, this.currentY + 2, this.isWhite, moves, w, b);
			if (this.currentX > 1) {
				if (this.currentY > 0)
					addMove(this.currentX - 2, this.currentY - 1, this.isWhite, moves, w, b);
				if (this.currentY < 7)
					addMove(this.currentX - 2, this.currentY + 1, this.isWhite, moves, w, b);
			}
		}
		if (this.currentX < 7) {
			if (this.currentY > 1)
				addMove(this.currentX + 1, this.currentY - 2, this.isWhite, moves, w, b);
			if (this.currentY < 6)
				addMove(this.currentX + 1, this.currentY + 2, this.isWhite, moves, w, b);
			if (this.currentX < 6) {
				if (this.currentY > 0)
					addMove(this.currentX + 2, this.currentY - 1, this.isWhite, moves, w, b);
				if (this.currentY < 7)
					addMove(this.currentX + 2, this.currentY + 1, this.isWhite, moves, w, b);
			}
		}
		return moves;
	}
}

var Bishop = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♗' : '♝';
	this.currentX = isLeft ? 2 : 5;
	this.value = 2;
	
	this.getMoves = function(w, b) {
		var moves = [];
		var tl = Math.min(this.currentX, 7 - this.currentY);
		var tr = Math.min(7 - this.currentX, 7 - this.currentY);
		var br = Math.min(7 - this.currentX, this.currentY);
		var bl = Math.min(this.currentX, this.currentY);
		for (var ii = 1; ii <= tl; ii++) {
			if (addMove(this.currentX - ii, this.currentY + ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= tr; ii++) {
			if (addMove(this.currentX + ii, this.currentY + ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= br; ii++) {
			if (addMove(this.currentX + ii, this.currentY - ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= bl; ii++) {
			if (addMove(this.currentX - ii, this.currentY - ii, isWhite, moves, w, b)) break;
		}
		return moves;
	}
}

var Rook = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♖' : '♜';
	this.currentX = isLeft ? 0 : 7;
	this.value = 4;
	
	this.getMoves = function(w, b) {
		var moves = [];
		for (var ii = this.currentX + 1; ii < 8; ii++) {
			if (addMove(ii, this.currentY, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentX - 1; ii >= 0; ii--) {
			if (addMove(ii, this.currentY, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentY + 1; ii < 8; ii++) {
			if (addMove(this.currentX, ii, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentY - 1; ii >= 0; ii--) {
			if (addMove(this.currentX, ii, isWhite, moves, w, b)) break;
		}
		return moves;
	}
}

var Queen = function(isWhite) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♕' : '♛';
	this.currentX = 3;
	this.value = 8;
	
	this.getMoves = function(w, b) {
		var moves = [];
		// Line
		for (var ii = this.currentX + 1; ii < 8; ii++) {
			if (addMove(ii, this.currentY, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentX - 1; ii >= 0; ii--) {
			if (addMove(ii, this.currentY, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentY + 1; ii < 8; ii++) {
			if (addMove(this.currentX, ii, isWhite, moves, w, b)) break;
		}
		for (var ii = this.currentY - 1; ii >= 0; ii--) {
			if (addMove(this.currentX, ii, isWhite, moves, w, b)) break;
		}
		// Diag
		var tl = Math.min(this.currentX, 7 - this.currentY);
		var tr = Math.min(7 - this.currentX, 7 - this.currentY);
		var br = Math.min(7 - this.currentX, this.currentY);
		var bl = Math.min(this.currentX, this.currentY);
		for (var ii = 1; ii <= tl; ii++) {
			if (addMove(this.currentX - ii, this.currentY + ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= tr; ii++) {
			if (addMove(this.currentX + ii, this.currentY + ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= br; ii++) {
			if (addMove(this.currentX + ii, this.currentY - ii, isWhite, moves, w, b)) break;
		}
		for (var ii = 1; ii <= bl; ii++) {
			if (addMove(this.currentX - ii, this.currentY - ii, isWhite, moves, w, b)) break;
		}
		return moves;
	}
}

var King = function(isWhite) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♔' : '♚';
	this.currentX = 4;
	this.value = 100;
	
	this.getMoves = function(w, b) {
		var moves = [];
		if (this.currentY > 0) {
			addMove(this.currentX, this.currentY - 1, this.isWhite, moves, w, b);
			if (this.currentX > 0)
				addMove(this.currentX - 1, this.currentY - 1, this.isWhite, moves, w, b);
			if (this.currentX < 7)
				addMove(this.currentX + 1, this.currentY - 1, this.isWhite, moves, w, b);
		}
		if (this.currentY < 7) {
			addMove(this.currentX, this.currentY + 1, this.isWhite, moves, w, b);
			if (this.currentX > 0)
				addMove(this.currentX - 1, this.currentY + 1, this.isWhite, moves, w, b);
			if (this.currentX < 7)
				addMove(this.currentX + 1, this.currentY + 1, this.isWhite, moves, w, b);
		}
		if (this.currentX > 0)
			addMove(this.currentX - 1, this.currentY, this.isWhite, moves, w, b);
		if (this.currentX < 7)
			addMove(this.currentX + 1, this.currentY, this.isWhite, moves, w, b);
		
		// TODO : Add rock
		// Only if neither King nor Rook has moved
		// Only if King is not checked while rocking -_-
		
		return moves;
	}
}


/* Init */
$(document).ready(function() {
	$.event.props.push('dataTransfer');
	initBoard();
	$('#button').click(function() { play(); });
	$('#test').html('-');
});


/*  

FIXME

Implement pawn promotion
Implement rock

TODO

Do not decrement depth when a piece is taken
Progressively increase depth as the number of pieces decreases
Implement complex board evaluation for first level moves
	Add bonus for control of the center
	Add bonus for movement freedom
	Add bonus for pieces threatened/defended
Use setTimeout to avoid freeze
Replace "pieces" and "getPieceAt" with a dictionary search ?
Use specific/dynamic functions for getMoves
Add debug : 
	- move history
	- evaluation history
	- expected moves from opponent ?
	- piece list with properties
	

*/
