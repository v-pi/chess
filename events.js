function dragStart(ev, piece) {
	var data = (piece.isWhite ? 'white' : 'black') + ';' + piece.arrayIndex;
    ev.dataTransfer.setData("text", data);
	var moves = piece.getMoves(board, whitePieces, blackPieces);
	coloredCells = [];
	for (var ii = 0; ii < moves.length; ii++) {
		var move = moves[ii];
		// Remove moves that would let the king exposed
		if (piece.isWhite && thinkAsBlack(board, whitePieces, blackPieces, piece, move, 1, 0) === -200) continue;
		if (!piece.isWhite && thinkAsWhite(board, whitePieces, blackPieces, piece, move, 1, 0) === 200) continue;
		var colIndex = move[0] + 1;
		var rowIndex = 8 - move[1];
		$('#chessboard tr:nth-child(' + rowIndex + ') td:nth-child(' + colIndex +')').css('background-color', 'green');
		$('#chessboard tr:nth-child(' + rowIndex + ') td:nth-child(' + colIndex +')').on('dragover', allowDrop);
		coloredCells.push([rowIndex, colIndex]);
	}
}

function dragEnd(ev) {
    ev.preventDefault();
	for (var ii = 0; ii < coloredCells.length; ii++) {
		$('#chessboard tr:nth-child(' + coloredCells[ii][0] + ') td:nth-child(' + coloredCells[ii][1] +')').css('background-color', '');
		$('#chessboard tr:nth-child(' + coloredCells[ii][0] + ') td:nth-child(' + coloredCells[ii][1] +')').off('dragover');
	}
}

function dropped(ev, newX, newY) {
    ev.preventDefault();
	var data =  ev.dataTransfer.getData("text").split(';');
	var isWhite = data[0] === 'white';
	var arrayIndex = data[1] * 1;
	var piece = isWhite ? whitePieces[arrayIndex] : blackPieces[arrayIndex];
	executeMove(piece, newX, newY);
	$('#button').show();
}

function allowDrop(ev) {
    ev.preventDefault();
}