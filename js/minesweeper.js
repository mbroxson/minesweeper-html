var game = {
    rows: 8,
    cols: 8,
    num_mines: 10
};
var time_interval = false;

/**
 * On document load, initial setup.
 */
$(document).ready(function() {
    $(document).foundation();
    $(document).on('click', '.mine_cell', cellClick);
    $(document).on('contextmenu', '.mine_cell', cellRightClick);
    $('#ng_button').click(newGame);
    $('#ng_cancel_button').click(hideModal);
    $('#ng_rows').val(game.rows);
    $('#ng_cols').val(game.cols);
    $('#ng_mines').val(game.num_mines);
    buildNewGame();
});

/**
 * jQuery function to bind an event handler before other handlers for the selected objects
 * 
 * @param name{string}
 *            name of the event to bind
 * @param fn{function}
 *            function to bind
 * @return {null}
 */
$.fn.bindFirst = function(name, fn) {
    var elem, handlers, i, _len;
    this.bind(name, fn);
    for (i = 0, _len = this.length; i < _len; i++) {
        elem = this[i];
        handlers = jQuery._data(elem).events[name.split('.')[0]];
        handlers.unshift(handlers.pop());
    }
};

/**
 * Alert popup to alert any test/html
 * 
 * @param data{string}
 *            text/html to be alerted
 * @return {null}
 */
function alertModal(data) {
    data = data.toString();
    showModal('', data.replace('\n', '<br>') + '<br><br><span class="button small" onclick="hideModal();"><u>O</u>K</span>', false);
    $(document).bindFirst('keydown', alertKeydown);
}

/**
 * Event handler for keydown when alert modal is open to close with keyboard
 * 
 * @param e{string}
 *            keydown event
 * @return {boolean}
 */
function alertKeydown(e) {
    if (e.which == 13 || e.which == 27 || e.which == 32 || e.which == 79) {
        hideModal();
    }
    return false;
}

/**
 * Displays modal windows with title and content passed in
 * 
 * @param title{string}
 *            Modal window header title
 * @param content{string}
 *            Text/HTML content to display
 * @param allow_close{boolean}(true)
 *            If the close X should be displayed or not
 * @return {null}
 */
function showModal(title, content, allow_close) {
    allow_close = (typeof(allow_close) == 'undefined') ? true : allow_close;
    $('#modal_title').html(title);
    $('#modal_content').html(content);
    if (allow_close)
        $('#modal_close').show();
    else
        $('#modal_close').hide();
    $('#modal_div').foundation('open');
}

/**
 * Hides any open modal windows
 * 
 * @param N/A
 * @return {null}
 */
function hideModal() {
    $('.reveal').foundation('close');
    $('#modal_title').html('');
    $('#modal_content').html('');
    $(document).unbind('keydown', alertKeydown);
}

/**
 * Updates the game configuration and builds the new game
 * 
 * @param N/A
 * @return {null}
 */
function newGame() {
    game.rows = $('#ng_rows').val();
    game.cols = $('#ng_cols').val();
    game.num_mines = $('#ng_mines').val();
    game.rows = (game.rows == '') ? 8 : parseInt(game.rows);
    game.cols = (game.cols == '') ? 8 : parseInt(game.cols);
    game.num_mines = (game.num_mines == '') ? 10 : parseInt(game.num_mines);
    buildNewGame();
    hideModal();
}

/**
 * Builds a new game grid, randomly places mines, sets jQuery data attributes of the cell objects for usage in the click/right click
 * 
 * @param N/A
 * @return {null}
 */
function buildNewGame() {
    $('#game_div').html('');
    var row;
    var cell;
    var mine_cell;
    game.mines = [];
    game.cells = [];
    game.lost = false;
    game.won = false;
    if (time_interval)
        clearInterval(time_interval);
    time_interval = false;
    $('#time').text(0);
    $('#mines').text(game.num_mines);
    // randomly generate mines
    while (game.mines.length < game.num_mines) {
        mine_cell = Math.floor(Math.random() * game.rows * game.cols);
        if (game.mines.indexOf(mine_cell) == -1)
            game.mines.push(mine_cell);
    }
    // calculate number to display for the cells, put -1 for cells with mine in it
    for (var r = 0;r < game.rows;r++) {
        game.cells.push([]);
        for (var c = 0;c < game.cols;c++) {
            mine_cell = game.mines.indexOf((r * game.cols) + c);
            if (mine_cell == -1) {
                mine_cell = 0;
                mine_cell += (r > 0) ? ((c > 0) ? ((game.mines.indexOf(((r - 1) * game.cols) + c - 1) > -1) ? 1 : 0) : 0) : 0; // top left cell
                mine_cell += (r > 0) ? ((game.mines.indexOf(((r - 1) * game.cols) + c) > -1) ? 1 : 0) : 0; // top cell
                mine_cell += (r > 0) ? ((c + 1 < game.cols) ? ((game.mines.indexOf(((r - 1) * game.cols) + c + 1) > -1) ? 1 : 0) : 0) : 0; // top right cell
                mine_cell += (c > 0) ? ((game.mines.indexOf((r * game.cols) + c - 1) > -1) ? 1 : 0) : 0; // left cell
                mine_cell += (c + 1 < game.cols) ? ((game.mines.indexOf((r * game.cols) + c + 1) > -1) ? 1 : 0) : 0; // right cell
                mine_cell += (r + 1 < game.rows) ? ((c > 0) ? ((game.mines.indexOf(((r + 1) * game.cols) + c - 1) > -1) ? 1 : 0) : 0) : 0; // bottom left cell
                mine_cell += (r + 1 < game.rows) ? ((game.mines.indexOf(((r + 1) * game.cols) + c) > -1) ? 1 : 0) : 0; // bottom cell
                mine_cell += (r + 1 < game.rows) ? ((c + 1 < game.cols) ? ((game.mines.indexOf(((r + 1) * game.cols) + c + 1) > -1) ? 1 : 0) : 0) : 0; // bottom right cell
            } else {
                mine_cell = -1;
            }
            game.cells[r].push(mine_cell);
        }
    }
    // add rows and cells to the game grid
    for (var r = 0;r < game.rows;r++) {
        row = $('<div></div>');
        $('#game_div').append(row);
        row.addClass('grid-x');
        for (var c = 0;c < game.cols;c++) {
            cell = $('<div></div>');
            mine_cell = $('<div></div>');
            cell.append(mine_cell);
            row.append(cell);
            cell.addClass('cell');
            cell.addClass('auto');
            mine_cell.addClass('mine_cell');
            mine_cell.addClass('button');
            mine_cell.data('cell', game.cells[r][c]);
            mine_cell.data('cell_num', (r * game.cols) + c);
            mine_cell.data('row', r);
            mine_cell.data('col', c);
            mine_cell.attr('id', 'cell_' + r + '_' + c);
        }
    }
}

/**
 * Handles left click on game cells, checks for mine, flag, blank, or number.
 *   If cell is blank, trigger click of surrounding cells.
 *   Checks if game is won after cell handled.
 * 
 * @param e{event}
 *            click event
 * @return {null}
 */
function cellClick(e) {
    if (!time_interval)
        time_interval = setInterval(updateTime, 1000);
    if (game.lost || game.won || (typeof($(this).data('flag')) != 'undefined' && $(this).data('flag') > 0))
        return;
    if (!$(this).data('triggered')) {
        $(this).data('triggered', true);
        $(this).addClass('hollow');
        if ($(this).data('cell') == -1) { // bomb cell, you lost
            game.lost = true;
            $(this).html('<i class="fas fa-bomb fa-spin"></i>');
            $(this).addClass('alert');
            alertModal('You lost');
            $('.mine_cell:not(.hollow)').each(function() {
                if ($(this).data('cell') == -1) {
                    if ($(this).data('flag') != 1)
                        $(this).html('<i class="fas fa-bomb"></i>');
                } else if ($(this).data('flag') == 1) {
                    $(this).html('<i class="fas fa-times-circle"></i>');
                }
            });
        } else if ($(this).data('cell') == 0) { // blank cell, click surrounding
            // handle row above
            if ($(this).data('row') > 0) {
                if ($(this).data('col') > 0)
                    $('#cell_' + ($(this).data('row') - 1) + '_' + ($(this).data('col') - 1)).click(); // top left
                $('#cell_' + ($(this).data('row') - 1) + '_' + $(this).data('col')).click(); // top
                if ($(this).data('col') + 1 < game.cols)
                    $('#cell_' + ($(this).data('row') - 1) + '_' + ($(this).data('col') + 1)).click(); // top right
            }
            // cell to left and right
            if ($(this).data('col') > 0)
                $('#cell_' + $(this).data('row') + '_' + ($(this).data('col') - 1)).click(); // left
            if ($(this).data('col') + 1 < game.cols)
                $('#cell_' + $(this).data('row') + '_' + ($(this).data('col') + 1)).click(); // right
            // handle row below
            if ($(this).data('row') + 1 < game.rows) {
                if ($(this).data('col') > 0)
                    $('#cell_' + ($(this).data('row') + 1) + '_' + ($(this).data('col') - 1)).click(); // bottom left
                $('#cell_' + ($(this).data('row') + 1) + '_' + $(this).data('col')).click(); // bottom
                if ($(this).data('col') + 1 < game.cols)
                    $('#cell_' + ($(this).data('row') + 1) + '_' + ($(this).data('col') + 1)).click(); // bottom right
            }
        } else { // display number for cell
            $(this).text($(this).data('cell'));
        }
        checkIfWon();
    }
}

/**
 * Handles right click events for game cells for placing flags, marking questionable
 * 
 * @param e{event}
 * @return {boolean}(false)
 */
function cellRightClick(e) {
    if (!time_interval)
        time_interval = setInterval(updateTime, 1000);
    e.preventDefault();
    e.stopImmediatePropagation();
    if (game.lost || game.won)
        return false;
    if (!$(this).data('triggered')) {
        switch ($(this).data('flag')) {
            case 1:
                $(this).html('<i class="fas fa-question"></i>');
                $('#mines').text(parseInt($('#mines').text()) + 1);
                $(this).data('flag', 2);
                break;
            case 2:
                $(this).html('');
                $(this).data('flag', 0);
                break;
            default:
                if (parseInt($('#mines').text()) == 0) {
                    alert('You do not have any more flags to place.');
                } else {
                    $(this).html('<i class="fas fa-flag"></i>');
                    $('#mines').text(parseInt($('#mines').text()) - 1);
                    $(this).data('flag', 1);
                    checkIfWon();
                }
        }
    }
    return false;
}

/**
 * Called on interval to updated the game time seconds
 * 
 * @param N/A
 * @return {null}
 */
function updateTime() {
    if (!game.lost && !game.won)
        $('#time').text(parseInt($('#time').text()) + 1);
    else
        clearInterval(time_interval);
}

/**
 * Checks if the user has won the game based on the following:
 *    The number of cells not clicked equals the number of mines for the game
 *    The number of flags remaining equals 0 and all flagged cells are mines
 * 
 * @param N/A
 * @return {null}
 */
function checkIfWon() {
    if (!game.lost && !game.won) {
        if ($('.mine_cell:not(.hollow)').length == game.num_mines) {
            game.won = true;
            alertModal('<h3>You Won!</h3>');
        } else if (parseInt($('#mines').text()) == 0) {
            game.won = true;
            $('.mine_cell:not(.hollow)').each(function() {
                if (typeof($(this).data('flag')) != 'undefined' && $(this).data('flag') > 0)
                    if ($(this).data('cell') != -1)
                        game.won = false;
            });
            if (game.won)
                alertModal('<h3>You Won!</h3>');
        }
    }
}
