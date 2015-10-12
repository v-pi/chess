var whitePieces = [];
var blackPieces = [];

var InitBoard = function() {
	for (var ii = 7; ii >=0; ii--) {
		var row = '<tr>';
		for (var jj = 0; jj < 8; jj++) {
			row += '<td data-x="' + jj + '" data-y="' + ii + '" ondrop="dropped(event)" ondragend="dragEnd(event)"></td>';
		}
		row += '</td>'
		$('#chessboard').append(row);
	}
	
	for (var ii = 0; ii < 8; ii++) {
		whitePieces.push(new Pawn(true, ii));
		blackPieces.push(new Pawn(false, ii));
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
	
	RenderBoard();
}

function dragStart(ev, piece) {
    ev.dataTransfer.setData("isWhite", piece.isWhite ? 'true' : '');
    ev.dataTransfer.setData("arrayIndex", piece.arrayIndex);
	// $(ev.target).css('background-color', 'red');
	var moves = piece.GetMoves();
	coloredCells = [];
	for (var ii = 0; ii < moves.length; ii++) {
		var move = moves[ii];
		var colIndex = move[0] + 1;
		var rowIndex = 8 - move[1];
		$('#chessboard tr:nth-child(' + rowIndex + ') td:nth-child(' + colIndex +')').css('background-color', 'green');
		$('#chessboard tr:nth-child(' + rowIndex + ') td:nth-child(' + colIndex +')').on('dragover', function(ev) { allowDrop(ev) });
		coloredCells.push([rowIndex, colIndex]);
	}
}

function dragEnd(ev) {
    ev.preventDefault();
	$(ev.target).css('background-color', '');
	for (var ii = 0; ii < coloredCells.length; ii++) {
		$('#chessboard tr:nth-child(' + coloredCells[ii][0] + ') td:nth-child(' + coloredCells[ii][1] +')').css('background-color', '');
		$('#chessboard tr:nth-child(' + coloredCells[ii][0] + ') td:nth-child(' + coloredCells[ii][1] +')').off('dragover');
		
	}
}

function dropped(ev) {
	var isWhite = ev.dataTransfer.getData("isWhite") === 'true';
	var arrayIndex = ev.dataTransfer.getData("arrayIndex") * 1;
	var cell = $(ev.target);
	var row = $(ev.target).parent();
	var newX = row.index(cell);
	var newY = 7 - $('#chessboard').index(row);
	
	var newX = $(ev.target).attr('data-x') * 1;
	var newY = $(ev.target).attr('data-y') * 1;
	var piece = isWhite ? whitePieces[arrayIndex] : blackPieces[arrayIndex];
	ExecuteMove(piece, newX, newY);
}

function allowDrop(ev) {
    ev.preventDefault();
}

var RenderBoard = function() {
	for (var ii = 0; ii < whitePieces.length; ii++) {
		whitePieces[ii].Render();
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		blackPieces[ii].Render();
	}
}

// Checks if the cell is occupied
// Returns the piece occupying if it is
// Returns an empty structure if it is not
var isOccupied = function(x, y) {
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
var getPieceAt = function(x, y) {
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
var AddMove = function(x, y, isWhite, moves) {
	var blocker = getPieceAt(x, y);
	if (blocker.isWhite === isWhite) return true;
	if (blocker.isWhite === !isWhite) {
		moves.push([x, y, blocker]);
		return true;
	}
	moves.push([x, y]);
	return false;
}

var EvaluateBoard = function(whitePieces, blackPieces) {
	var advantageWhite = 0;
	for (var ii = 0; ii < whitePieces.length; ii++) {
		advantageWhite += whitePieces[ii].value;
	}
	for (var ii = 0; ii < blackPieces.length; ii++) {
		advantageWhite -= blackPieces[ii].value;
	}
	return advantageWhite;
}

var Play = function() {
	console.log('start');
	var result = Think(true);
	ExecuteMove(result.piece, result.move[0], result.move[1]);
	console.log('stop');
}

var ExecuteMove = function(piece, newX, newY) {
	var pieceWhereMoving = getPieceAt(newX, newY);
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
	var colIndex = piece.currentX + 1;
	var rowIndex = 8 - piece.currentY;
	$('#chessboard tr:nth-child(' + rowIndex + ') td:nth-child(' + colIndex +')').html('').off('draggstart').removeAttr('draggable');
	piece.currentX = newX;
	piece.currentY = newY;
	for (var ii = 0; ii < whitePieces.length; ii++)
		whitePieces[ii].arrayIndex = ii;
	for (var ii = 0; ii < blackPieces.length; ii++)
		blackPieces[ii].arrayIndex = ii;
	
	RenderBoard();
}

var Think = function(isWhitePlaying) {
	var chosenPieceIndex;
	var chosenMove;
	var evaluation = isWhitePlaying ? -1000 : 1000;
	var pieces = isWhitePlaying ? whitePieces : blackPieces;
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].GetMoves();
		for (var jj = 0; jj < moves.length; jj++) {
			var move = moves[jj];
			var tempEval = ThinkRecursive(!isWhitePlaying, whitePieces, blackPieces, pieces[ii], move, 4);
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

var ThinkRecursive = function(isWhitePlaying, whitePieces, blackPieces, piece, move, depth) {
	if (depth === 0) return EvaluateBoard(whitePieces, blackPieces);
	var oldX = piece.currentX;
	var oldY = piece.currentY;
	piece.currentX = move[0];
	piece.currentY = move[1];
	var whitePiecesCopy = whitePieces;
	var blackPiecesCopy = blackPieces;
	if (move.length > 2) { // a piece is taken
		if (piece.isWhite) {
			blackPiecesCopy = blackPieces.slice();
			blackPiecesCopy.splice(move[2].arrayIndex, 1);
		} else {
			whitePiecesCopy = whitePieces.slice();
			whitePiecesCopy.splice(move[2].arrayIndex, 1);
		}
	}
	
	var evaluation = isWhitePlaying ? -1000 : 1000;
	var pieces = isWhitePlaying ? whitePiecesCopy : blackPiecesCopy;
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].GetMoves();
		for (var jj = 0; jj < moves.length; jj++) {
			var move = moves[jj];
			var tempEval = ThinkRecursive(!isWhitePlaying, whitePiecesCopy, blackPiecesCopy, pieces[ii], move, depth - 1);
			
			if (isWhitePlaying) {
				evaluation = Math.max(tempEval, evaluation);
			} else {
				evaluation = Math.min(tempEval, evaluation);
			}
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
	
	this.Render = function() {
		var that = this;
		$('#chessboard tr:nth-child(' + (8 - this.currentY) + ') td:nth-child(' + (this.currentX + 1) +')')
			.attr('draggable', true)
			.on('dragstart', function(ev) { dragStart(ev, that) })
			.html(this._symbol);
	}
			
	this.SimpleRender = function() {
		$('#chessboard tr:nth-child(' + (8 - this.currentY) + ') td:nth-child(' + (this.currentX + 1) +')').html(this._symbol);
	}
	
	this.GetMoves = function() {
		throw 'NotImplementedException';
		return moves;
	}
}

/* Pieces behaviours */
var Pawn = function(isWhite, startX) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♙' : '♟';
	this.currentX = startX;
	this.currentY = this.isWhite ? 1 : 6;
	this.value = 1;
	
	this.GetMoves = function() {
		var moves = [];
		if (!isOccupied(this.currentX, isWhite ? this.currentY + 1 : this.currentY - 1)) {
			moves.push([this.currentX, isWhite ? this.currentY + 1 : this.currentY - 1]);
			if (isWhite && this.currentY === 1 && !isOccupied(this.currentX, this.currentY + 2))
				moves.push([this.currentX, this.currentY + 2]);
			if (!isWhite && this.currentY === 6 && !isOccupied(this.currentX, this.currentY - 2))
				moves.push([this.currentX, this.currentY - 2]);
		}
		
		if (this.currentX < 7) {
			var blocker = getPieceAt(this.currentX + 1, isWhite ? this.currentY + 1 : this.currentY - 1);
			if (blocker.isWhite === !isWhite) 
				moves.push([this.currentX + 1, isWhite ? this.currentY + 1 : this.currentY - 1, blocker]);
		}
		if (this.currentX > 0)
			var blocker = getPieceAt(this.currentX - 1, isWhite ? this.currentY + 1 : this.currentY - 1);
			if (blocker.isWhite === !isWhite) 
				moves.push([this.currentX - 1, isWhite ? this.currentY + 1 : this.currentY - 1, blocker]);
		
		return moves;
	}
}

var Knight = function(isWhite, isLeft) {
	this.base = Piece;
	this.base(isWhite);
	this._symbol =  this.isWhite ? '♘' : '♞';
	this.currentX = isLeft ? 1 : 6;
	this.value = 2;
	
	this.GetMoves = function() {
		var moves = [];
		if (this.currentX > 0) {
			if (this.currentY > 1 && getPieceAt(this.currentX - 1, this.currentY - 2).isWhite != this.isWhite)
				moves.push([this.currentX - 1, this.currentY - 2]);
			if (this.currentY < 6 && getPieceAt(this.currentX - 1, this.currentY + 2).isWhite != this.isWhite)
				moves.push([this.currentX - 1, this.currentY + 2]);
			if (this.currentX > 1) {
				if (this.currentY > 0 && getPieceAt(this.currentX - 2, this.currentY - 1).isWhite != this.isWhite)
					moves.push([this.currentX - 2, this.currentY - 1]);
				if (this.currentY < 7 && getPieceAt(this.currentX - 2, this.currentY + 1).isWhite != this.isWhite)
					moves.push([this.currentX - 2, this.currentY + 1]);
			}
		}
		if (this.currentX < 7) {
			if (this.currentY > 1 && getPieceAt(this.currentX + 1, this.currentY - 2).isWhite != this.isWhite)
				moves.push([this.currentX + 1, this.currentY - 2]);
			if (this.currentY < 6 && getPieceAt(this.currentX + 1, this.currentY + 2).isWhite != this.isWhite)
				moves.push([this.currentX + 1, this.currentY + 2]);
			if (this.currentX < 6) {
				if (this.currentY > 0 && getPieceAt(this.currentX + 2, this.currentY - 1).isWhite != this.isWhite)
					moves.push([this.currentX + 2, this.currentY - 1]);
				if (this.currentY < 7 && getPieceAt(this.currentX + 2, this.currentY + 1).isWhite != this.isWhite)
					moves.push([this.currentX + 2, this.currentY + 1]);
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
	
	this.GetMoves = function() {
		var moves = [];
		var tl = Math.min(this.currentX, 7 - this.currentY);
		var tr = Math.min(7 - this.currentX, 7 - this.currentY);
		var br = Math.min(7 - this.currentX, this.currentY);
		var bl = Math.min(this.currentX, this.currentY);
		for (var ii = 1; ii <= tl; ii++) {
			if (AddMove(this.currentX - ii, this.currentY + ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= tr; ii++) {
			if (AddMove(this.currentX + ii, this.currentY + ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= br; ii++) {
			if (AddMove(this.currentX + ii, this.currentY - ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= bl; ii++) {
			if (AddMove(this.currentX - ii, this.currentY - ii, isWhite, moves)) break;
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
	
	this.GetMoves = function() {
		var moves = [];
		for (var ii = this.currentX + 1; ii < 8; ii++) {
			if (AddMove(ii, this.currentY, isWhite, moves)) break;
		}
		for (var ii = this.currentX - 1; ii >= 0; ii--) {
			if (AddMove(ii, this.currentY, isWhite, moves)) break;
		}
		for (var ii = this.currentY + 1; ii < 8; ii++) {
			if (AddMove(this.currentX, ii, isWhite, moves)) break;
		}
		for (var ii = this.currentY - 1; ii >= 0; ii--) {
			if (AddMove(this.currentX, ii, isWhite, moves)) break;
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
	
	this.GetMoves = function() {
		var moves = [];
		// Line
		for (var ii = this.currentX + 1; ii < 8; ii++) {
			if (AddMove(ii, this.currentY, isWhite, moves)) break;
		}
		for (var ii = this.currentX - 1; ii >= 0; ii--) {
			if (AddMove(ii, this.currentY, isWhite, moves)) break;
		}
		for (var ii = this.currentY + 1; ii < 8; ii++) {
			if (AddMove(this.currentX, ii, isWhite, moves)) break;
		}
		for (var ii = this.currentY - 1; ii >= 0; ii--) {
			if (AddMove(this.currentX, ii, isWhite, moves)) break;
		}
		// Diag
		var tl = Math.min(this.currentX, 7 - this.currentY);
		var tr = Math.min(7 - this.currentX, 7 - this.currentY);
		var br = Math.min(7 - this.currentX, this.currentY);
		var bl = Math.min(this.currentX, this.currentY);
		for (var ii = 1; ii <= tl; ii++) {
			if (AddMove(this.currentX - ii, this.currentY + ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= tr; ii++) {
			if (AddMove(this.currentX + ii, this.currentY + ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= br; ii++) {
			if (AddMove(this.currentX + ii, this.currentY - ii, isWhite, moves)) break;
		}
		for (var ii = 1; ii <= bl; ii++) {
			if (AddMove(this.currentX - ii, this.currentY - ii, isWhite, moves)) break;
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
	
	this.GetMoves = function() {
		var moves = [];
		if (this.currentX > 0) {
			if (getPieceAt(this.currentX - 1, this.currentY).isWhite === !this.isWhite)
				moves.push([this.currentX - 1, this.currentY]);
			if (this.currentY > 0 && getPieceAt(this.currentX - 1, this.currentY - 1).isWhite === !this.isWhite)
				moves.push([this.currentX - 1, this.currentY - 1]);
			if (this.currentY < 7 && getPieceAt(this.currentX - 1, this.currentY + 1).isWhite === !this.isWhite)
				moves.push([this.currentX - 1, this.currentY + 1]);
		}
		if (this.currentX < 7) {
			if (getPieceAt(this.currentX + 1, this.currentY).isWhite === !this.isWhite)
				moves.push([this.currentX + 1, this.currentY]);
			if (this.currentY > 0 && getPieceAt(this.currentX + 1, this.currentY - 1).isWhite === !this.isWhite)
				moves.push([this.currentX + 1, this.currentY - 1]);
			if (this.currentY < 7 && getPieceAt(this.currentX + 1, this.currentY + 1).isWhite === !this.isWhite)
				moves.push([this.currentX + 1, this.currentY + 1]);
		}
		if (this.currentY > 0 && getPieceAt(this.currentX, this.currentY - 1).isWhite === !this.isWhite)
			moves.push([this.currentX, this.currentY - 1]);
		if (this.currentY < 7 && getPieceAt(this.currentX, this.currentY + 1).isWhite === !this.isWhite)
			moves.push([this.currentX, this.currentY + 1]);
		
		// TODO : Add rock
		// Only if neither King nor Rook has moved
		// Only if King is not checked while rocking -_-
		
		return moves;
	}
}


/* Init */
$(document).ready(function() {
	$.event.props.push('dataTransfer');
	InitBoard();
	$('#button').click(function() { Play(); });
	$('#test').html('-');
});


/*  

FIXME

Fix dragstart multiplying after each drag/drop
Implement pawn promotion
Implement rock
Do not decrement depth when a piece is taken

TODO

Implement board evaluation
	Add bonus for control of the center ?
	Add bonus for movement freedom ?
	Add bonus for pieces threatened/defended ?
Use setTimeout to avoid freeze
Replace "pieces" and "getPieceAt" with a dictionary search ?
For each piece, compute a score of pieces defended, threatened and accessible cells as internal property (how to update when the board changes ?)
Use specific/dynamic functions for GetMoves
Add debug : 
	- move history
	- evaluation history
	- expected moves from opponent ?
	- piece list with properties
	

*/
