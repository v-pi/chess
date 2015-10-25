var board = [];
var whitePieces = [];
var blackPieces = [];
var emptyCell = { isEmpty : true };

var initBoard = function() {
	for (var ii = 7; ii >=0; ii--) {
		var row = '<tr>';
		for (var jj = 0; jj < 8; jj++) {
			row += '<td ondrop="dropped(event, ' + jj + ', ' + ii + ')" ></td>';
		}
		row += '</td>'
		$('#chessboard').append(row);
	}
	$('#chessboard').on('dragend', dragEnd);
	
	for (var ii = 0; ii < 8; ii++)
	{
		board.push([]); 
		for (var jj = 0; jj  < 8; jj++)
		{
			board[ii].push(emptyCell);
		}
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
		var piece = whitePieces[ii];
		piece.arrayIndex = ii;
		board[piece.currentX][piece.currentY] = piece;
		var piece = blackPieces[ii];
		piece.arrayIndex = ii;
		board[piece.currentX][piece.currentY] = piece;
	}
	
	for (var ii = 0; ii < 16; ii++) {
		whitePieces[ii].arrayIndex = ii;
		blackPieces[ii].arrayIndex = ii;
	}
	
	renderBoard();
}

var renderBoard = function() {
	for (var ii = 0; ii < 8; ii++) {
		for (var jj = 0; jj < 8; jj++) {
			if (board[ii][jj].render) board[ii][jj].render();
		}
	}
}

// // Adds the move if the cell is empty or occupied by the enemy
// // Returns true if the cell is occupied
var addMove = function(x, y, isWhite, moves, board, w, b) {
	var cell = board[x][y];
	if (cell.isEmpty) {
		moves.push([x, y]);
		return false;
	}
	if (cell.isWhite === isWhite) {
		return true;
	}
	var enemyPieces = isWhite ? b : w;
	for (var ii = 0; ii < enemyPieces.length; ii++) {
		if (enemyPieces[ii].currentX === x && enemyPieces[ii].currentY === y) {
			moves.push([x, y, ii]);
			return true;
		}
	}
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

var complexEvaluateBoard = function(isWhitePlaying, board, w, b) {
	var advantage = 0;
	if (isWhitePlaying) {
		var pieces = w;
		var enemyPieces = b;
	} else {
		var pieces = b;
		var enemyPieces = w;
	}
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].getMoves(board, w, b);
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

var isPlayingWhite = function() {
	return $('input[name=side]:checked', '#options').val() === 'white';
}

var play = function() {
	$('#button').hide();
	$('#thinkprogress').show();
	console.log('start');
	think(!isPlayingWhite());
}

var checkKingChecked = function(board, whitePieces, blackPieces) {
	var king = isPlayingWhite() ? whitePieces[0] : blackPieces[0];
	var enemyPieces = isPlayingWhite() ? blackPieces : whitePieces;
	for (var ii = 0; ii < enemyPieces.length; ii++) {
		var moves = enemyPieces[ii].getMoves(board, whitePieces, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {
			if (moves[jj][0] === king.currentX && moves[jj][1] === king.currentY) {
				return true;
			}
		}
	}
	return false;
}

var executeMove = function(piece, newX, newY) {
	var pieceWhereMoving = board[newX][newY];
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
	board[piece.currentX][piece.currentY] = emptyCell;
	piece.currentX = newX;
	piece.currentY = newY;
	board[newX][newY] = piece;
	
	if (piece.canCastle && (newX === 2 || newX === 6)) { // castling
		piece.canCastle = false;
		piece.addCastlingMoves = function() { }; // this complex function has no use anymore
		if (newX === 2) { // Queen side
			var rook = board[0][piece.currentY];
			executeMove(rook, 3, piece.currentY);
			return;
		} else if (newX === 6) { // King side
			var rook = board[7][piece.currentY];
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
	var evaluation = -1000;
	var depth = getDepth();
	var pieces = isWhitePlaying ? whitePieces : blackPieces;
	var currentEval = simpleEvaluateBoard(whitePieces, blackPieces);
	var allMoves = [];
	
	for (var ii = 0; ii < pieces.length; ii++) {
		var moves = pieces[ii].getMoves(board, whitePieces, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {
			allMoves.push({ piece : pieces[ii], move : moves[jj] });
		}
	}
	$('#thinkprogress').attr('max', allMoves.length);
	$('#thinkprogress').val(0);
	thinkAsync(allMoves, 0, isWhitePlaying, board, whitePieces, blackPieces, depth, currentEval);
}

var thinkAsync = function(allMoves, index, isWhitePlaying, board, whitePieces, blackPieces, depth, currentEval) {
	var piece = allMoves[index].piece;
	var move = allMoves[index].move;
	var tempEval;
	if (isWhitePlaying) tempEval = thinkAsBlack(board, whitePieces, blackPieces, allMoves[index].piece, move, depth - 1, currentEval);
	else tempEval = -1 * thinkAsWhite(board, whitePieces, blackPieces, allMoves[index].piece, move, depth - 1, currentEval);
	console.log(piece._symbol + ' at ' + piece.currentX + ', ' + piece.currentY + ' moving to ' + move[0] + ', ' + move[1] + ' has a simple evaluation of ' + tempEval);
	allMoves[index].eval = tempEval;
	
	index++;
	$('#thinkprogress').val(index);
	if (index === allMoves.length) {
		setTimeout(function() { chooseBetweenAcceptableMoves(allMoves, isWhitePlaying)}, 30);
	} else {
		setTimeout(function() { thinkAsync(allMoves, index, isWhitePlaying, board, whitePieces, blackPieces, depth, currentEval); }, 30);
	}
}
	
var chooseBetweenAcceptableMoves = function(allMoves, isWhitePlaying)
{
	var chosenPiece;
	var chosenMove;
	var maxEval;
	var acceptableMoves = [];
	var evaluation = -1000;
	for (var ii = 0; ii < allMoves.length; ii++)
	{
		if (allMoves[ii].eval > evaluation) {
			acceptableMoves = [{piece : allMoves[ii].piece, move : allMoves[ii].move }];
			evaluation = allMoves[ii].eval;
		} else if (allMoves[ii].eval == evaluation) {
			acceptableMoves.push({piece : allMoves[ii].piece, move : allMoves[ii].move });
		}
	}
	console.log('Acceptable moves : ' + acceptableMoves.length);
	evaluation = -1000;
	for (var ii = 0; ii < acceptableMoves.length; ii++) {
		var move = acceptableMoves[ii].move;
		var piece = acceptableMoves[ii].piece;
		if (piece.value === 1 && move[1] === (isWhitePlaying ? 7 : 0)) // promote whenever possible
			return { piece : piece, move : move };
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
		
		var tempEval = complexEvaluateBoard(isWhitePlaying, board, whitePieces, blackPieces);
		console.log(piece._symbol + ' at ' + oldX + ', ' + oldY + ' moving to ' + move[0] + ', ' + move[1] + ' has a complex evaluation of ' + tempEval);
		if (tempEval >= evaluation) {
			chosenMove = move;
			chosenPiece = piece;
			evaluation = tempEval;
		}
		piece.currentX = oldX;
		piece.currentY = oldY;
	}
	
	executeMove(chosenPiece, chosenMove[0], chosenMove[1]);
	if (checkKingChecked(board, whitePieces, blackPieces))
		console.info('King checked');
	$('#thinkprogress').hide();
	console.info('stop');
}

var thinkAsBlack = function(board, whitePieces, blackPieces, piece, move, depth, currentEval) {
	if (move[2] === 0) return 200;// king was taken !
	var blackPiecesCopy = blackPieces;
	var pieceTaken = emptyCell;
	var pawnWasPromoted = piece.value === 1 && move[1] === 7;
	if (pawnWasPromoted) { // enemy pawn being promoted
		if (depth === 0) return currentEval + 7;
		piece.value = 12;
		piece.getMoves = Queen.prototype.getMoves;
		currentEval += 7;
	}
	if (move.length === 3) { // a piece is taken
		blackPiecesCopy = blackPieces.slice();
		pieceTaken = blackPiecesCopy.splice(move[2], 1)[0];
		currentEval += pieceTaken.value;
	}
	if (depth === 0) return simpleEvaluateBoard(whitePieces, blackPiecesCopy);
	var evaluation = 1000;
	var oldX = piece.currentX;
	var oldY = piece.currentY;
	piece.currentX = move[0];
	piece.currentY = move[1];
	board[oldX][oldY] = emptyCell;
	board[move[0]][move[1]] = piece;
	for (var ii = 0; ii < blackPiecesCopy.length; ii++) {
		var moves = blackPiecesCopy[ii].getMoves(board, whitePieces, blackPiecesCopy);
		for (var jj = 0; jj < moves.length; jj++) {
			evaluation = Math.min(thinkAsWhite(board, whitePieces, blackPiecesCopy, blackPiecesCopy[ii], moves[jj], depth - 1, currentEval), evaluation);
		}
	}
	piece.currentX = oldX;
	piece.currentY = oldY;
	if (pawnWasPromoted) {
		piece.value = 1;
		piece.getMoves = WhitePawn.prototype.getMoves;
	}
	board[oldX][oldY] = piece;
	board[move[0]][move[1]] = pieceTaken;
	return evaluation;
}

var thinkAsWhite = function(board, whitePieces, blackPieces, piece, move, depth, currentEval) {
	if (move[2] === 0) return -200; // king was taken !
	var whitePiecesCopy = whitePieces;
	var pieceTaken = emptyCell;
	var pawnWasPromoted = piece.value === 1 && move[1] === 0;
	if (pawnWasPromoted) { // enemy pawn being promoted
		if (depth === 0) return currentEval - 7;
		piece.value = 12;
		piece.getMoves = Queen.prototype.getMoves;
		currentEval -= 7;
	}
	if (move.length === 3) { // a piece is taken
		whitePiecesCopy = whitePieces.slice();
		pieceTaken = whitePiecesCopy.splice(move[2], 1)[0];
		currentEval -= pieceTaken.value;
	}
	if (depth === 0) return currentEval;
	var evaluation = -1000;
	var oldX = piece.currentX;
	var oldY = piece.currentY;
	piece.currentX = move[0];
	piece.currentY = move[1];
	board[oldX][oldY] = emptyCell;
	board[move[0]][move[1]] = piece;
	for (var ii = 0; ii < whitePiecesCopy.length; ii++) {
		var moves = whitePiecesCopy[ii].getMoves(board, whitePiecesCopy, blackPieces);
		for (var jj = 0; jj < moves.length; jj++) {			
			evaluation = Math.max(thinkAsBlack(board, whitePiecesCopy, blackPieces, whitePiecesCopy[ii], moves[jj], depth - 1, currentEval), evaluation);
		}
	}
	piece.currentX = oldX;
	piece.currentY = oldY;
	if (pawnWasPromoted) {
		piece.value = 1;
		piece.getMoves = BlackPawn.prototype.getMoves;
	}
	board[oldX][oldY] = piece;
	board[move[0]][move[1]] = pieceTaken;
	return evaluation;
}

/* For debug only */
var logPieceMovement = function(piece, oldX, oldY, move) {
	console.debug((piece.isWhite ? 'White ' : 'Black ') + piece._symbol + ' at ' + oldX + ', ' + oldY + ' moving to ' + move[0] + ', ' + move[1]);	
}

/* Init */
$(document).ready(function() {
	$.event.props.push('dataTransfer');
	initBoard();
	$('#thinkprogress').hide();
	$('#button').click(function() { play(); });
	$('#depth').html(getDepth());
	$('#depthinput').change(
		function(newVal) { $('#depth').html(getDepth()); }
		);
});


/*

FIXME

Detect stalemate
Detect checkmate

TODO

Forbid multiple turns
Progressively increase depth as the number of pieces decreases
Add debug : 
	- move history
	- evaluation history
	- expected moves from opponent ?
	- piece list with properties
Show last move
Display pieces taken
Improve rating of trades when ahead, decrease when tied or behind


CANCELED

Do not decrement depth when a piece is taken (too complex)

*/