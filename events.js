function dragStart(ev, piece) {
    ev.dataTransfer.setData("isWhite", piece.isWhite ? 'true' : '');
    ev.dataTransfer.setData("arrayIndex", piece.arrayIndex);
	var moves = piece.getMoves(whitePieces, blackPieces);
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
	executeMove(piece, newX, newY);
	$('#button').show();
}

function allowDrop(ev) {
    ev.preventDefault();
}