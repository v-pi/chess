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
}

/* Pieces behaviours */
var WhitePawn = function(startX) {
	this.base = Piece;
	this.base(true);
	this._symbol =  '♙';
	this.currentX = startX;
	this.currentY = 1;
	this.value = 1;
}

WhitePawn.prototype.getMoves = function(board, w, b) {
	var moves = [];
	if (board[this.currentX][this.currentY + 1].isEmpty) {
		moves.push([this.currentX, this.currentY + 1]);
		if (this.currentY === 1 && board[this.currentX][this.currentY + 2].isEmpty)
			moves.push([this.currentX, this.currentY + 2]);
	}
	if (this.currentX < 7) {
		if (board[this.currentX + 1][this.currentY + 1].isWhite === false) {
			var newX = this.currentX + 1;
			var newY = this.currentY + 1;
			for (var ii = 0; ii < b.length; ii++) {
				if (b[ii].currentX === newX && b[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
	}
	if (this.currentX > 0) {
		if (board[this.currentX - 1][this.currentY + 1].isWhite === false) {
			var newX = this.currentX - 1;
			var newY = this.currentY + 1;
			for (var ii = 0; ii < b.length; ii++) {
				if (b[ii].currentX === newX && b[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
	}
	return moves;
}

var BlackPawn = function(startX) {
	this.base = Piece;
	this.base(false);
	this._symbol =  '♟';
	this.currentX = startX;
	this.currentY = 6;
	this.value = 1;
}
	
BlackPawn.prototype.getMoves = function(board, w, b) {
	var moves = [];
	if (board[this.currentX][this.currentY - 1].isEmpty) {
		moves.push([this.currentX, this.currentY - 1]);
		if (this.currentY === 6 && board[this.currentX][this.currentY - 2].isEmpty)
			moves.push([this.currentX, this.currentY - 2]);
	}
	if (this.currentX < 7) {
		if (board[this.currentX + 1][this.currentY - 1].isWhite === true) {
			var newX = this.currentX + 1;
			var newY = this.currentY - 1;
			for (var ii = 0; ii < w.length; ii++) {
				if (w[ii].currentX === newX && w[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
	}
	if (this.currentX > 0) {
		if (board[this.currentX - 1][this.currentY - 1].isWhite === true) {
			var newX = this.currentX - 1;
			var newY = this.currentY - 1;
			for (var ii = 0; ii < w.length; ii++) {
				if (w[ii].currentX === newX && w[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
	}
	return moves;
}

var Knight = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♘' : '♞';
	this.currentX = isLeft ? 1 : 6;
	this.value = 3;
}
	
Knight.prototype.getMoves = function(board, w, b) {
	var moves = [];
	if (this.currentX > 0) {
		if (this.currentY > 1)
			addMove(this.currentX - 1, this.currentY - 2, this.isWhite, moves, board, w, b);
		if (this.currentY < 6)
			addMove(this.currentX - 1, this.currentY + 2, this.isWhite, moves, board, w, b);
		if (this.currentX > 1) {
			if (this.currentY > 0)
				addMove(this.currentX - 2, this.currentY - 1, this.isWhite, moves, board, w, b);
			if (this.currentY < 7)
				addMove(this.currentX - 2, this.currentY + 1, this.isWhite, moves, board, w, b);
		}
	}
	if (this.currentX < 7) {
		if (this.currentY > 1)
			addMove(this.currentX + 1, this.currentY - 2, this.isWhite, moves, board, w, b);
		if (this.currentY < 6)
			addMove(this.currentX + 1, this.currentY + 2, this.isWhite, moves, board, w, b);
		if (this.currentX < 6) {
			if (this.currentY > 0)
				addMove(this.currentX + 2, this.currentY - 1, this.isWhite, moves, board, w, b);
			if (this.currentY < 7)
				addMove(this.currentX + 2, this.currentY + 1, this.isWhite, moves, board, w, b);
		}
	}
	return moves;
}

var Bishop = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♗' : '♝';
	this.currentX = isLeft ? 2 : 5;
	this.value = 3;
}
	
Bishop.prototype.getMoves = function(board, w, b) {
	var moves = [];
	var tl = Math.min(this.currentX, 7 - this.currentY);
	var tr = Math.min(7 - this.currentX, 7 - this.currentY);
	var br = Math.min(7 - this.currentX, this.currentY);
	var bl = Math.min(this.currentX, this.currentY);
	for (var ii = 1; ii <= tl; ii++) {
		if (addMove(this.currentX - ii, this.currentY + ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= tr; ii++) {
		if (addMove(this.currentX + ii, this.currentY + ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= br; ii++) {
		if (addMove(this.currentX + ii, this.currentY - ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= bl; ii++) {
		if (addMove(this.currentX - ii, this.currentY - ii, this.isWhite, moves, board, w, b)) break;
	}
	return moves;
}

var Rook = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♖' : '♜';
	this.currentX = isLeft ? 0 : 7;
	this.value = 6;
	this.hasMoved = false; // keeping track of rook movement for castling
}
	
Rook.prototype.getMoves = function(board, w, b) {
	var moves = [];
	for (var ii = this.currentX + 1; ii < 8; ii++) {
		if (addMove(ii, this.currentY, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentX - 1; ii >= 0; ii--) {
		if (addMove(ii, this.currentY, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentY + 1; ii < 8; ii++) {
		if (addMove(this.currentX, ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentY - 1; ii >= 0; ii--) {
		if (addMove(this.currentX, ii, this.isWhite, moves, board, w, b)) break;
	}
	return moves;
}

var Queen = function(isWhite) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♕' : '♛';
	this.currentX = 3;
	this.value = 12;
}

Queen.prototype.getMoves = function(board, w, b) {
	var moves = [];
	// Line
	for (var ii = this.currentX + 1; ii < 8; ii++) {
		if (addMove(ii, this.currentY, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentX - 1; ii >= 0; ii--) {
		if (addMove(ii, this.currentY, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentY + 1; ii < 8; ii++) {
		if (addMove(this.currentX, ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = this.currentY - 1; ii >= 0; ii--) {
		if (addMove(this.currentX, ii, this.isWhite, moves, board, w, b)) break;
	}
	// Diag
	var tl = Math.min(this.currentX, 7 - this.currentY);
	var tr = Math.min(7 - this.currentX, 7 - this.currentY);
	var br = Math.min(7 - this.currentX, this.currentY);
	var bl = Math.min(this.currentX, this.currentY);
	for (var ii = 1; ii <= tl; ii++) {
		if (addMove(this.currentX - ii, this.currentY + ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= tr; ii++) {
		if (addMove(this.currentX + ii, this.currentY + ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= br; ii++) {
		if (addMove(this.currentX + ii, this.currentY - ii, this.isWhite, moves, board, w, b)) break;
	}
	for (var ii = 1; ii <= bl; ii++) {
		if (addMove(this.currentX - ii, this.currentY - ii, this.isWhite, moves, board, w, b)) break;
	}
	return moves;
}

var King = function(isWhite) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♔' : '♚';
	this.currentX = 4;
	this.value = 100;
	this.canCastle = true;
}

King.prototype.getMoves = function(board, w, b) {
	var moves = [];
	if (this.currentY > 0) {
		addMove(this.currentX, this.currentY - 1, this.isWhite, moves, board, w, b);
		if (this.currentX > 0)
			addMove(this.currentX - 1, this.currentY - 1, this.isWhite, moves, board, w, b);
		if (this.currentX < 7)
			addMove(this.currentX + 1, this.currentY - 1, this.isWhite, moves, board, w, b);
	}
	if (this.currentY < 7) {
		addMove(this.currentX, this.currentY + 1, this.isWhite, moves, board, w, b);
		if (this.currentX > 0)
			addMove(this.currentX - 1, this.currentY + 1, this.isWhite, moves, board, w, b);
		if (this.currentX < 7)
			addMove(this.currentX + 1, this.currentY + 1, this.isWhite, moves, board, w, b);
	}
	if (this.currentX > 0)
		addMove(this.currentX - 1, this.currentY, this.isWhite, moves, board, w, b);
	if (this.currentX < 7)
		addMove(this.currentX + 1, this.currentY, this.isWhite, moves, board, w, b);
	
	this.addCastlingMoves(board, w, b, moves);	
	return moves;
}

King.prototype.addCastlingMoves = function(board, w, b, moves) {
	var currentY = this.isWhite ? 0 : 7;
	var alliedPieces = this.isWhite ? w : b;
	var enemyPieces = this.isWhite ? b : w;
	var canCastleKingSide = false;
	var canCastleQueenSide = false;
	// check if same color pieces are blocking
	for (var ii = 0; ii < alliedPieces.length; ii++) {
		var piece = alliedPieces[ii];
		if (piece.currentY === currentY) {
			if (piece.currentX === 5 || piece.currentX === 6)
				canCastleKingSide = false;
			if (piece.currentX === 1 || piece.currentX === 2 || piece.currentX === 3)
				canCastleQueenSide = false;
			if (piece.currentX === 7 && !piece.hasMoved)
				canCastleKingSide = true; // only works because the rooks are directly after the king in the array !!!!
			if (piece.currentX === 0 && !piece.hasMoved)
				canCastleQueenSide = true; // only works because the rooks are directly after the king in the array !!!!
		}
	}
	if (!canCastleQueenSide && !canCastleKingSide) return;
	// check if other color pieces are blocking or threatening
	// starting at 1 is the easiest way to avoid infinite recursion when both kings are able to castle. 
	// I really can't imagine a game where a king would stop the opponent king from castling. Like seriously.
	for (var ii = 1; ii < enemyPieces.length; ii++) { 
		var piece = enemyPieces[ii];
		if (piece.currentY === currentY) {
			if (piece.currentX === 5 || piece.currentX === 6)
				canCastleKingSide = false;
			if (piece.currentX === 1 || piece.currentX === 2 || piece.currentX === 3)
				canCastleQueenSide = false;
		}
		var enemyMoves = piece.getMoves(board, w, b);
		for (var jj = 0; jj < enemyMoves.length; jj++) {
			var move = enemyMoves[jj];
			if (move[1] === currentY) {
				if (move[0] === 4)
					return; // means check on starting position
				if (move[0] === 5 || move[0] === 6)
					canCastleKingSide = false;
				if (move[0] === 2 || move[0] === 3)
					canCastleQueenSide = false;
			}
		}
	}
	// double null at the end is the ugliset hack ever to get the length up to 4 (which is used later to distinguish this special move
	if (canCastleKingSide)
		moves.push([6, currentY, null, null]);
	if (canCastleQueenSide)
		moves.push([2, currentY, null, null]);
}