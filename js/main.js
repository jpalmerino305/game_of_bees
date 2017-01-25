
var all_bees = getBees();
var total_score = totalScore();
var is_playing = false;

$(document).ready(function(){

  loadBees();
  loadPoints();

  $('#reset').on('click', function(){
    if (is_playing){
      if (confirm('Are you sure?')){
        reset();
      }
    }
  });

  $('#hit').on('click', function(){
    is_playing = true;

    var bee = hitBee();
    var hit_button = $(this);
    var reset_button = $('#reset');
    hit_button.attr('disabled', 'disabled');
    reset_button.attr('disabled', 'disabled');

    // Try to get a group bee
    var hit_again = true;
    var group_count = all_bees.length;

    if (group_count == 0){
      gameOver();
      return false;
    }

    while (group_count > 0 && hit_again) {
      bee = hitBee();

      // No more group to select, game over...
      if (group_count == 0){
        gameOver();
        break;
      } 

      //
      // TODO:
      // MAKE QUEEN BEE LAST TO HIT
      //

      // More group left, select from it before allowing to hit the queen
      if (group_count >= 1) {
        if (bee['index'] == -1){
          hit_again = true;
        } else {
          hit_again = false;
        }
      } else {
        hit_again = false;
      }

    }

    if (bee){
      if (bee['group_index'] >= 0){
  
        var deduction = bee['bee']['data']['deduction'];
        var total_points = bee['bee']['data']['total_points'];
        var current_points = parseInt(bee['bee']['data']['current_points']) - parseInt(deduction);
        var percent = (((current_points) / parseFloat(total_points))) * 100;
        var bee_type = all_bees[bee['group_index']]['type'];

        // Update bee points
        all_bees[bee['group_index']]['bees'][bee['index']]['current_points'] = current_points;

        var data_bee = all_bees[bee['group_index']]['type'] + '-' + all_bees[bee['group_index']]['bees'][bee['index']]['id'];
        var color = getProgressbarColor(parseFloat(percent));

        // Total Score
        $('#total-score').html(deduction + parseInt($('#total-score').html()));

        // Update progressbar start
        $('span.points[data-bee="' + data_bee + '"]')
          .html((current_points >= 0) ? current_points : 0);
        $('div.progress-bar[data-bee="' + data_bee + '"]')
          .attr('class', 'progress-bar ' + color)
          .css({'width': percent + '%'});
        // Update progressbar end

        // $('div.bee[data-bee="' + data_bee + '"]').addClass('disabled-bee').delay(2000).removeClass('selected-bee');
        if (current_points <= 0){
          $('div.bee[data-bee="' + data_bee + '"]').addClass('disabled-bee');
          // Delete object
          all_bees[bee['group_index']]['bees'].splice(bee['index'], 1);
        }

        $('span.hit-deduction[data-bee="' + data_bee + '"]').html('-' + deduction).show();
        $('div.bee[data-bee="' + data_bee + '"]').addClass('selected-bee');

        setTimeout(function() {
          $('span.hit-deduction[data-bee="' + data_bee + '"]').fadeOut();
          $('div.bee[data-bee="' + data_bee + '"]').removeClass('selected-bee');
          hit_button.removeAttr('disabled');
          reset_button.removeAttr('disabled');
        }, 1000);

      }
    } else {
      hit_button.removeAttr('disabled');
      reset_button.removeAttr('disabled');
    }

    hitBee(); // Hit one moretime to double check if all_bees is already empty

    if (all_bees.length == 0){
      gameOver();
      return false;
    }

    if (bee_type == 'queen' && current_points <= 0){
      emptyPoints();
      gameOver('Game over! The queen bee is dead...');
      return false;
    }

  });

});

function hitBee(){

  var result = {};

  var random_bee = random(all_bees);

  var selected_bee = random_bee['data'];
  var group_index = random_bee['index'];

  result['bee'] = {};
  result['index'] = -1;
  result['group_index'] = -1;

  if (selected_bee) {
    if (selected_bee['bees'].length > 0){
      var bee = random(selected_bee['bees']);
      var bee_index = bee['index'];
      result['bee'] = bee;
      result['index'] = bee_index;

      result['group_index'] = group_index;
    } else {
      all_bees.splice(group_index, 1);
      if (all_bees.length == 0){
        result['index'] = -2;
        result['group_index'] = -2;
      }
    }
  }

  // result['group_count'] = all_bees.length;

  return result;

}

function loadBees(){
  var array = [], type = '', i = 0, j = 0;
  for (i = 0; i < all_bees.length; i ++){
    type = all_bees[i]['type'];
    for (j = 0; j < all_bees[i]['bees'].length; j ++){
      array.push('<div class="bee bg-info" data-bee="' + type + '-' + all_bees[i]['bees'][j]['id'] + '">' + capitalize(type) + ' ' + all_bees[i]['bees'][j]['name'] + '</div>');
    }
  }
  $('#all-bees').html(array.join(" "));
}

function loadPoints(){
  var html = '', type = '', i = 0, j = 0;
  html += '<div class="row"><div class="col-md-12"><h4><strong>Total Score:</strong>&nbsp;<span id="total-score">0</span></h4></div></div>';
  for (i = 0; i < all_bees.length; i ++){
    type = all_bees[i]['type'];
    html += '<div class="text-right" style="margin: 0 0 10px 0;">' + capitalize(type) + '</div>';
    for (j = 0; j < all_bees[i]['bees'].length; j ++){
      html += '<div class="row">';
        html += '<div class="col-md-2">';
          html += all_bees[i]['bees'][j]['name'];
          html += '<span class="hit-deduction" data-bee="' + type + '-' + all_bees[i]['bees'][j]['id'] + '" style="display: none;"></span>';
        html += '</div>';
        html += '<div class="col-md-10">';
          html += '<div class="progress">';
            html += '<div class="progress-bar progress-bar-success" data-bee="' + type + '-' + all_bees[i]['bees'][j]['id'] + '" role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100" style="width: 100%;">';
              html += '<span class="points" data-bee="' + type + '-' + all_bees[i]['bees'][j]['id'] + '">' + all_bees[i]['bees'][j]['current_points'] + '</span>';
            html += '</div>';
          html += '</div>';
        html += '</div>';
      html += '</div>';
    }
  }
  $('#points').html(html);
}

function emptyPoints(){
  var type = '', i = 0, j = 0;
  for (i = 0; i < all_bees.length; i ++){
    type = all_bees[i]['type'];
    for (j = 0; j < all_bees[i]['bees'].length; j ++){
      data_bee = type + '-' + all_bees[i]['bees'][j]['id'];
      $('span.hit-deduction[data-bee="' + data_bee + '"]').html(all_bees[i]['bees'][j]['deduction']); // Display deduction
      $('div.progress-bar[data-bee="' + data_bee + '"]').css({'width': '0%'}); // PROGRESS BAR
      $('span.points[data-bee="' + data_bee + '"]').html('0'); // Points.. Set to 0
    }
  }
  $('#total-score').html(total_score);
}

function getProgressbarColor(percent){
  var color = 'progress-bar-success';
  if (percent <= 50.0){
    color = 'progress-bar-info';
  }
  if (percent <= 40.0){
    color = 'progress-bar-warning';
  }
  if (percent <= 30.0){
    color = 'progress-bar-danger';
  }
  return color;
}

function reset(){
  all_bees = getBees();
  loadBees();
  loadPoints();
  is_playing = false;
  $('#hit').removeAttr('disabled');
  $('#reset').removeAttr('disabled');
  $('#total-score').html('0');
}

function gameOver(msg='Game over! This game will reset...'){
  alert(msg);
  reset();
}

function random(array){
  var index = Math.floor((Math.random() * array.length) + 1) - 1; // Length between To and From
  return { 'data': array[index], 'index': index };
}

function capitalize(string){
    return string[0].toUpperCase() + string.slice(1);
}

function getBees(){
  return [
    { 
      'type': 'queen',
      'bees': [
        { 'id': 1, 'name': '#1', 'total_points': 100, 'current_points': 100, 'deduction': 8, 'priority': -1 }
      ] 
    },
    { 
      'type': 'worker',
      'bees' : [
        { 'id': 2, 'name': '#1', 'total_points': 75, 'current_points': 75, 'deduction': 10, 'priority': 0 },
        { 'id': 3, 'name': '#2', 'total_points': 75, 'current_points': 75, 'deduction': 10, 'priority': 0 },
        { 'id': 4, 'name': '#3', 'total_points': 75, 'current_points': 75, 'deduction': 10, 'priority': 0 },
        { 'id': 5, 'name': '#4', 'total_points': 75, 'current_points': 75, 'deduction': 10, 'priority': 0 },
        { 'id': 6, 'name': '#5', 'total_points': 75, 'current_points': 75, 'deduction': 10, 'priority': 0 }
      ]
    },
    { 
      'type': 'drone',
      'bees': [
        { 'id': 7, 'name': '#1', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 8, 'name': '#2', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 9, 'name': '#3', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 10, 'name': '#4', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 11, 'name': '#5', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 12, 'name': '#6', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 13, 'name': '#7', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 },
        { 'id': 14, 'name': '#8', 'total_points': 50, 'current_points': 50, 'deduction': 12, 'priority': 0 }
      ]
    }
  ];
}

function totalScore(){
  var type = '', i = 0, j = 0, total = 0;
  for (i = 0; i < all_bees.length; i ++){
    for (j = 0; j < all_bees[i]['bees'].length; j ++){
      total += parseInt(all_bees[i]['bees'][j]['total_points']);
    }
  }
  return total;
}
