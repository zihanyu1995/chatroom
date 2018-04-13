function displayHistoryMessages(userID, force, cb) {
  sessionStorage.setItem('focusUser', userID);
  const chatroomTitle = $('#chatroomTitle');
  chatroomTitle.html(userMap[userID]);
  let myID = sessionStorage.id;
  let mode = 2;
  if (userID == 0) { // if public
    myID = -1;
    mode = 1;
  }
  $.ajax({
    type: 'GET',
    url: '/messages',
    data: {
      fromUserID: myID, toUserID: userID, timeStart: -1, timeEnd: -1, mode,
    },
    success: (data) => {
      for (let i = 0; i < data.length; i++) {
        appendMessage(data[i].fromuser, data[i].message, data[i].sendtime, data[i].status, data[i].vote, data[i].id, myVotes.has(data[i].id));
      }
      $('.box .list').css('height', screen.height * 0.75);
      if (force){
        console.log('move');
        setScrollTop();
      }
      cb();
    },
    error: () => {
      console.log('error');
    },
  });
}

function enterChatroom(userID, force) {
  if (sessionStorage.getItem('focusUser') != userID || force) {
    sessionStorage.setItem('focusUser', userID);
    $('#content').empty();
    const chatroom = ejs.render(chatroomTemplate, { title: userMap[userID] });
    $('#content').append(chatroom);
    displayHistoryMessages(userID, force, ()=>{
      $('#messagesList').css('height', `${screen.height * 0.7}px`);
    });
    opensearch();
    if (sessionStorage.getItem('focusUser') == 0) {
      messageFilter();
    }
  }
}

function sendMessage() {
  const messagePosted = {
    fromUserID: sessionStorage.id,
    toUserID: sessionStorage.getItem('focusUser'),
    message: $('#messageContent').val(),
    status: sessionStorage.getItem('status'),
  };
  $.ajax({
    type: 'POST',
    url: '/messages',
    data: messagePosted,
    success: () => { // TODO: what about error?
      $('#messageContent').val('');
    },
  });
}
const filterHtml = `<span class="glyphicon glyphicon-filter" aria-hidden="true" ></span>
<hr>
<div id="filter" class="form-check">
<div class="form-check">
<label class="form-check-label">
  <input class="form-check-input" type="radio" name="filterRadios" id="exampleRadios1" value="0" checked>
  ALL
</label>
</div>

<div class="form-check">
<label class="form-check-label">
  <input class="form-check-input" type="radio" name="filterRadios" id="exampleRadios2" value="1">
  Not Vote Yet
</label>
</div>

<div class="form-check">
<label class="form-check-label">
  <input class="form-check-input" type="radio" name="filterRadios" id="exampleRadios2" value="2">
  My Upvote
</label>
</div>

<div class="form-check">
<label class="form-check-label">
  <input class="form-check-input" type="radio" name="filterRadios" id="exampleRadios2" value="3">
  My Downvote
</label>
</div>

<div id="slidecontainer">
  Value:<a id="filterThreshold">-100</a>
  <div>
    <input type="range" min="-100" max="100" value="-100" class="slider" id="myRange">
  </div>
</div>
</div>
`;

function updateVoteRecord(cb) {
  const user = sessionStorage.id;

  $.ajax({
    type: 'GET',
    url: '/vote/voteList',
    data: {
      user,
    },
    success: (data) => {
      myVotes = new Map(data);
      cb();
    },
    error: () => {
      console.log('error');
    },
  });
}

function messageFilter() {
  $('#h').append(filterHtml);

  $('.glyphicon-filter').on('click', (e) => {
    toggleFilter();
  });

  $('#myRange').on('input', function(e) {
    $('#filterThreshold').html(this.value);
  });

  // perform filter
  $('.form-check-input').on('click', (e) => {
    displayFilteredMessages();
  });

  $('#slidecontainer').on('mouseup', (e) => {
    displayFilteredMessages();
  });
  toggleFilter();

}

function toggleFilter() {
  $('#filter').toggle();
}

function getOriginChoice(messageID) {
  let originChoice = 0;
  if (myVotes.has(messageID)) {
    const temp = myVotes.get(messageID);
    if (temp > 0) {
      originChoice = 1;
    } else if (temp < 0) {
      originChoice = -1;
    }
  }
  return originChoice;
}

function openOverlay(messageID) {
  $('#votePanelString').html($('#v' + messageID).parent().find('.message').html());
  $('#votePanelNumber').html($('#v' + messageID).attr('value'));
  const originChoice = getOriginChoice(messageID);
  // remove all class
  $('.glyphicon-thumbs-up').removeClass('active');
  $('.glyphicon-thumbs-down').removeClass('active');

  if (originChoice > 0) {
    $('.glyphicon-thumbs-up').addClass('active');
  } else if (originChoice < 0) {
    $('.glyphicon-thumbs-down').addClass('active');
  }

  $('#votePannel').css('height', screen.height);
  $('#votePannel').attr('value', messageID);
}

function closeOverlay() {
  $('#votePannel').css('height', 0);
}

function voteMessage(upvote) {
  const messageID = parseInt($('#votePannel').attr('value'), 10);
  const user = sessionStorage.id;
  let originChoice = getOriginChoice(messageID);
  let choice;
  if (upvote) {
    choice = 1;
  } else {
    choice = -1;
  }
  if (originChoice > 0 && upvote){
    choice = 0;
  } else if (originChoice < 0 && !upvote){
    choice = 0;
  }

  $.ajax({
    type: 'GET',
    url: '/vote',
    data: {
      choice, message: messageID, user
    },
    success: (data) => {
      updateVoteRecord(() => {
        enterChatroom(0, true);
        closeOverlay();
      });
    },
    error: () => {
      console.log('error');
    },
  });
}

function displayFilteredMessages() {
  const user = sessionStorage.id;
  const type = $('input[name=filterRadios]:checked').val();
  const threshold = $('#filterThreshold').html();
  // /filter?type=1&user=1&threshold=1

  $.ajax({
    type: 'GET',
    url: '/vote/filter',
    data: {
      type, user, threshold,
    },
    success: (data) => {
      $('#messagesList').empty();
      for (let i = 0; i < data.length; i += 1) {
        appendMessage(data[i].fromuser, data[i].message, data[i].sendtime, data[i].status, data[i].vote, data[i].id, myVotes.has(data[i].id));
      }
      $('.box .list').css('height', screen.height * 0.75);
      setScrollTop();
    },
    error: () => {
      console.log('error');
    },
  });
}
