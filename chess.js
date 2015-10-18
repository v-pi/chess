var whitePieces = [];
var blackPieces = [];

var initBoard = function() {
	for (var ii = 7; ii >=0; ii--) {
		var row = '<tr>';
		for (var jj = 0; jj < 8; jj++) {
			row += '<td ondrop="dropped(event, ' + jj + ', ' + ii + ')" ondragend="dragEnd(event)"></td>';
		}
		row += '</td>'
		$('#chessboard').append(row);
	}
	
	whitePieces.push(new King(true));
	blackPieces.push(new King(false));
	
	whitePieces.push(new Rook(true, true));
	whitePieces.push(new Rook(true, false));
	blackPieces.push(new Rook(false, true));
	blackPieces.push(new Rook(false, false));
	
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
	
	whitePieces.push(new Queen(true));
	blackPieces.push(new Queen(false));
	
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

var simpleEvaluateBoard = function(w, b) {
	var advantageWhite = 0;
	for (var ii = 0; ii < w.length; ii++) {
		advantageWhite += w[ii].value;
	}
	for (var ii = 0; ii < b.length; ii++) {
		advantageWhite -= b[ii].value;
	}
	return advantageWhite;
}

var complexEvaluateBoard = function(isWhitePlaying, w, b) {
	var advantage = 0;
	if (isWhitePlaying) {
		var pieces = w;
		var enemyPieces = b;
	} else {
		var pieces = b;
		var enemyPieces = w;
	}
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].getMoves(w, b);
		for (var jj = 0; jj < moves.length; jj++) {
			// movement freedom
			advantage += 0.1;
			// enemy pieces threatened
			if (moves[jj].length === 3)
				advantage += enemyPieces[moves[jj][2]].value;
			// control of the center
			if (moves[jj][0] === 3 && moves[jj][1] === 3) advantage += 0.5;
			if (moves[jj][0] === 3 && moves[jj][1] === 3) advantage += 0.5;
			if (moves[jj][0] === 3 && moves[jj][1] === 3) advantage += 0.5;
			if (moves[jj][0] === 3 && moves[jj][1] === 3) advantage += 0.5;
		}
	}
	return advantage;
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
	if (piece.value === 1) { // pawn promotion
		if ((piece.isWhite && newY === 7) || (!piece.isWhite && newY === 0)) {
			piece._symbol = piece.isWhite ? '♕' : '♛';
			piece.value = 8;
			piece.getMoves = Queen.prototype.getMoves
		}
	}
	piece.currentX = newX;
	piece.currentY = newY;
	
	if (piece.canCastle && (newX === 2 || newX === 6)) { // castling
		piece.canCastle = false;
		piece.addCastlingMoves = function() { };
		if (newX === 2) { // Queen side
			var rook = getPieceAt(0, piece.currentY, whitePieces, blackPieces);
			executeMove(rook, 3, piece.currentY);
			return;
		} else if (newX === 6) { // King side
			var rook = getPieceAt(7, piece.currentY, whitePieces, blackPieces);
			executeMove(rook, 5, piece.currentY);
			return;
		}
	}
	
	if (piece.hasMoved === false) piece.hasMoved = true;
	if (piece.canCastle) {
		piece.canCastle = false;
		piece.addCastlingMoves = function() { };
	}
	
	for (var ii = 0; ii < whitePieces.length; ii++)
		whitePieces[ii].arrayIndex = ii;
	for (var ii = 0; ii < blackPieces.length; ii++)
		blackPieces[ii].arrayIndex = ii;
	
	renderBoard();
}

var think = function(isWhitePlaying) {
	var chosenPiece;
	var chosenMove;
	var evaluation = isWhitePlaying ? -1000 : 1000;
	var depth = getDepth();
	var pieces = isWhitePlaying ? whitePieces : blackPieces;
	var acceptableMoves = [];
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].getMoves(whitePieces, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {
			var move = moves[jj];
			var tempEval = 0;
			if (isWhitePlaying) tempEval = thinkAsBlack(whitePieces, blackPieces, pieces[ii], move, depth - 1);
			else tempEval = -1 * thinkAsWhite(whitePieces, blackPieces, pieces[ii], move, depth - 1);
			console.log(pieces[ii]._symbol + ' at ' + pieces[ii].currentX + ', ' + pieces[ii].currentY + ' moving to ' + move[0] + ', ' + move[1] + ' has a simple evaluation of ' + tempEval);
			if (tempEval > evaluation) {
				acceptableMoves = [{piece : pieces[ii], move : move }];
				evaluation = tempEval;
			} else if (tempEval == evaluation) {
				acceptableMoves.push({piece : pieces[ii], move : move });
			}
		}
	}
	console.log('Acceptable moves : ' + acceptableMoves.length);
	evaluation = isWhitePlaying ? -1000 : 1000;
	for (var ii = 0; ii < acceptableMoves.length; ii++) {
		var move = acceptableMoves[ii].move;
		var piece = acceptableMoves[ii].piece;
		if (move.length === 4) // castle whenever possible
			return { piece : piece, move : move };
		
		var whitePiecesCopy = whitePieces;
		var blackPiecesCopy = blackPieces;
		if (move.length === 3) { // a piece is taken
			if (isWhitePlaying) {
				blackPiecesCopy = blackPieces.slice();
				blackPiecesCopy.splice(move[2], 1);
			} else {
				whitePiecesCopy = whitePieces.slice();
				whitePiecesCopy.splice(move[2], 1);
			}
		}
		var oldX = piece.currentX;
		var oldY = piece.currentY;
		piece.currentX = move[0];
		piece.currentY = move[1];
		
		var tempEval = complexEvaluateBoard(isWhitePlaying, whitePieces, blackPieces);
		console.log(piece._symbol + ' at ' + oldX + ', ' + oldY + ' moving to ' + move[0] + ', ' + move[1] + ' has a complex evaluation of ' + tempEval);
		if (tempEval >= evaluation) {
			chosenMove = move;
			chosenPiece = piece;
			evaluation = tempEval;
		}		
		piece.currentX = oldX;
		piece.currentY = oldY;
	}
	
	return { piece : chosenPiece, move : chosenMove };
}

var thinkAsBlack = function(whitePieces, blackPieces, piece, move, depth) {
	var blackPiecesCopy = blackPieces;
	var oldValue = piece.value;
	if (oldValue === 1 && move[1] === 7) piece.value = 8; // enemy pawn being promoted
	if (move.length === 3) { // a piece is taken
		if (move[2] === 0) {// and it is the king !
			return 200;
		}
		blackPiecesCopy = blackPieces.slice();
		blackPiecesCopy.splice(move[2], 1);
	}
	if (depth === 0) return simpleEvaluateBoard(whitePieces, blackPiecesCopy);
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
	piece.value = oldValue;
	return evaluation;
}

var thinkAsWhite = function(whitePieces, blackPieces, piece, move, depth) {
	var whitePiecesCopy = whitePieces;
	var oldValue = piece.value;
	if (oldValue === 1 && move[1] === 0) piece.value = 8; // enemy pawn being promoted
	if (move.length === 3) { // a piece is taken
		if (move[2] === 0) {// and it is the king !
			return -200;
		}
		whitePiecesCopy = whitePieces.slice();
		whitePiecesCopy.splice(move[2], 1);
	}
	if (depth === 0) return simpleEvaluateBoard(whitePiecesCopy, blackPieces);
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
	piece.value = oldValue;
	return evaluation;
}

var logPieceMovement = function(piece, oldX, oldY, move) {
	console.debug((piece.isWhite ? 'White ' : 'Black ') + piece._symbol + ' at ' + oldX + ', ' + oldY + ' moving to ' + move[0] + ', ' + move[1]);	
}

/* Init */
$(document).ready(function() {
	$.event.props.push('dataTransfer');
	initBoard();
	$('#button').click(function() { play(); });
	$('#depth').html(getDepth());
	$('#depthinput').change(
		function(newVal) { $('#depth').html(getDepth()); }
		);
});


/*  

FIXME

Detect stalemate
Force to save king when checked

TODO

Let AI play as white or black
Forbid multiple turns
Progressively increase depth as the number of pieces decreases
Display estimated time
Use setTimeout to avoid freeze
Replace "pieces" and "getPieceAt" with a dictionary search ?
Use specific/dynamic functions for getMoves
Add debug : 
	- move history
	- evaluation history
	- expected moves from opponent ?
	- piece list with properties
Show last move
Display pieces taken


CANCELED
	
Do not decrement depth when a piece is taken (too complex)

*/
