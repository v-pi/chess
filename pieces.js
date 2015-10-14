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
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
		if (this.currentX > 0) {
			for (var ii = 0; ii < blackPieces.length; ii++) {
				var newX = this.currentX - 1;
				var newY = this.currentY + 1;
				if (blackPieces[ii].currentX === newX && blackPieces[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
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
					moves.push([newX, newY, ii]);
					break;
				}
			}
		}
		if (this.currentX > 0) {
			for (var ii = 0; ii < whitePieces.length; ii++) {
				var newX = this.currentX - 1;
				var newY = this.currentY - 1;
				if (whitePieces[ii].currentX === newX && whitePieces[ii].currentY === newY) {
					moves.push([newX, newY, ii]);
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