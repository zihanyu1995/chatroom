sessionStorage.setItem('focusUser', -1);
const userMap = { 0: 'Public Channel' }; // key:id, value:name
var users = [];
var userProfiles = [];
var myVotes = new Map();

const messageTemplate = `<div class="msg" contenteditable="true">
  <div class="content">
  <span class="time">
  <%= timestamp %>
  </span>
  <span class="name">
  <span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= name %>
  </span>
  <hr/>
  <span class="msg2 message">
  <%= message %>
  </span>
  <hr/>
  </div>
</div>`;
const myMessageTemplate = `<div class="msg" contenteditable="true">
  <div class="content">
  <span class="rname">
  <span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= name %>
  </span>
  <span class="rtime">
  <%= timestamp %>
  </span>
  <hr/>
  <span class="rmsg2 rmessage" contentEditable="false">
  <%= message %>
  </span>
  <hr/>
  </div>
</div>`;

const publicMessageTemplate = `<div class="msg" contenteditable="true">
  <div class="content">
  <span class="time">
  <%= timestamp %>
  </span>
  <span class="name">
  <span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= name %>
  </span>
  <span class="badge <%= colorClass %>" id="v<%= messageID %>" value="<%= vote %>"><%= voteStr %></span>
  <hr/>
  <span class="msg2 message">
  <%= message %>
  </span>
  <hr/>
  </div>
</div>`;

const publicMyMessageTemplate = `<div class="msg" contenteditable="true">
  <div class="content">
  <span contentEditable="false" class="rbadge badge <%= colorClass %>" id="v<%= messageID %>" value="<%= vote %>"><%= voteStr %></span>
  <span class="rname" contentEditable="false">
  <span contentEditable="false" class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= name %>
  </span>
  <span class="rtime">
  <%= timestamp %>
  </span>
  <hr/>
  <span class="rmsg2 rmessage message" contentEditable="false">
  <%= message %>
  </span>
  <hr/>
  </div>
</div>`;

const chatroomTemplate = `<div class="box">
  <div id="h">
  <h4 class="pull-left title" id="chatroomTitle"><%= title %></h4>
  <button id="opensearch" class="opensearchBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
  </div>
  <div class="list" id="messagesList"></div>
  <div class="send form-inline">
  <input type="text" class="send-input form-control" id="messageContent"></input>
  <button class="send-button btn btn-default sendBtn"><span class="glyphicon glyphicon-send " aria-hidden="true" ></span></button>
  </div>
  </div>`;
const userListTemplate = `<div id="no-user-result" class="noresult hidden">No Result</div>
  <ul class="nav nav-pills nav-stacked navs nav-side">
  <!-- Online Users -->
  <li class="userListNav">
  <a href=" "><span class="glyphicon glyphicon-minus-sign"></span> Online Users</a >
  </li>
  <div class="userList">
  <ul class="users nav" id="onlineUser"></ul>
  </div>
  <!-- Online Users end -->
  <hr class="myhr"/ >
  <!-- Offline Users -->
  <li class="userListNav">
  <a href="#"><span class="glyphicon glyphicon-minus-sign"></span> Offline Users</a >
  </li>
  <div class="userList">
  <ul class="users nav" id="offlineUser"></ul>
  </div>
  <!-- Offline Users end -->
  </ul>`;

const statusArray = ['', 'ok-sign', 'exclamation-sign', 'plus', 'question-sign'];
const colorArray = ['', '46,139,87', '255,215,0', '162,32,32', '0,0,0'];

function setScrollTop() {
  // TODO: click on a new user twice, window will jump
  $('#messagesList').scrollTop($('#messagesList')[0].scrollHeight);
}

function appendMessage(fromID, message, time, status, vote, messageID, voted) {
  const messagesList = $('#messagesList');
  // TODO: this if statment is fishy, append when
  // 1. focus public and sent to public
  // 2. from focus user || to focus user
  if (sessionStorage.getItem('focusUser') == 0 || fromID == sessionStorage.getItem('focusUser') || fromID == sessionStorage.id) {
    const t = new Date(parseInt(time)).toLocaleString();
    const content = {
      name: userMap[fromID], message, timestamp: t, status: statusArray[status], color: colorArray[status],
    };
    let k;
    if (sessionStorage.getItem('focusUser') == 0) {
      vote = parseInt(vote, 10);
      let colorClass;

      if (vote > 0) {
        colorClass = 'greenBadge';
      } else if (vote < 0) {
        colorClass = 'redBadge';
      } else {
        colorClass = 'greyBadge';
      }

      // const absVote = Math.abs(vote);
      if (vote >= 100 || vote <= -100) {
        voteStr = '99+';
      }
      else{
        voteStr = vote;
      }
      content.vote = vote;
      content.voteStr = voteStr;
      content.messageID = messageID;
      content.colorClass = colorClass;


      if (fromID == sessionStorage.id) {
        k = ejs.render(publicMyMessageTemplate, content);
      } else {
        k = ejs.render(publicMessageTemplate, content);
      }
    } else if (fromID == sessionStorage.id) {
      k = ejs.render(myMessageTemplate, content);
    } else {
      k = ejs.render(messageTemplate, content);
    }

    messagesList.append(k);
    setScrollTop();
    if (sessionStorage.getItem('focusUser') == 0) {
      $('#v' + messageID).on('click', function() {
        openOverlay(messageID);
      });
    }

  }
}


function updateUserList() {
  getUserList();
}

function addUsers() {
  const users = ejs.render(userListTemplate);
  $('#content').append(users);
  updateUserList();
}

const statusFilterTemplate = '<option value="<%= value %>" class="statusFilterItem" id="<%= id %>"><%= msg %></a></option>';
const statusFilterMsgArray = ['All', 'OK', 'Help', 'Emergency', 'Undefined'];

$(() => {
  addSearchUsers();
  addUsers();
  setupSocket(); // TODO:is there any dependency?
  sendWelcomeMessage();
  setStatusMenu();
  enterAnnouncement();
	bindMoreMessages();
	addMap();
  enterMessageBox();
	enterPost();
	clickOnPost();
	clickOnSearch();
	clickOnCancel();
	closeSearchPosts();
  bindMoreMessages();
  updateVoteRecord(() => {});

  if (sessionStorage.privilege == 2){
    $('#profile').show();
    enterUserProfileList();
  } else {
    $('#profile').hide();
  }
  if (sessionStorage.privateChatList) {
    const s = JSON.parse(sessionStorage.getItem('privateChatList'));
    for (const i in s) {
      addUserToDropdown(parseInt(i), s[i], true);
    }
  } else {
    sessionStorage.setItem('privateChatList', '{}');
  }


  $('.userList').slideToggle();

  $('#notification').on('click', (e) => {
    hideUnreadIndicator();
    $('#privateDropdown').delay(100).queue(() => {
      $('#privateDropdown').trigger('click');
    });
  });

  /* Change left nav li status when clicked */
  $('#content').on('click', 'ul li', function (e) {
    e.preventDefault();
    $('#content ul li').removeClass('active');
    $(this).addClass('active');
  });

  /* Change upper nav bar li status when clicked */
  $('#myNavbar').on('click', 'ul li', function (e) {
    e.preventDefault();
    $('#myNavbar ul li').removeClass('active');
    $(this).addClass('active');

    let navNeedToBeHide = ['Home', 'Public Chatroom', 'Announcement', 'Friend Status', 'Help Forum', 'Administer Profile', 'Log out'];
    if(navNeedToBeHide.indexOf($(this).text()) >= 0){
      $('#myNavbar').removeClass('in');
    }
  });

  /* Show Chatroom, hide online & offline */
  /* Show or hide online users list when OnlineUsers is clicked */
  $('#content').on('click', '.userListNav', function (e) {
    e.preventDefault();
    const icon = $(this).find('span');
    if (icon.is('.glyphicon-plus-sign')) {
      icon.removeClass('glyphicon-plus-sign');
      icon.addClass('glyphicon-minus-sign');
    } else {
      icon.removeClass('glyphicon-minus-sign');
      icon.addClass('glyphicon-plus-sign');
    }
    const userList = $(this).next('.userList');
    userList.slideToggle();
  });

  $('#content').on('click', '.box .send .sendBtn', () => {
    if ($('#messageContent').val()) {
      sendMessage();
    }
  });

  $('#content').on('keypress', '.box .send #messageContent', (e) => {
    if (e.which == 13) {
      if ($('#messageContent').val()) {
        sendMessage();
      }
    }
  });

  $('#chat').on('click', (e) => {
    if (sessionStorage.getItem('focusUser') != 0) {
      $('#content').empty();
      const chatroom = ejs.render(chatroomTemplate, { title: 'Public Channel' });
      $('#content').append(chatroom);
      enterChatroom(0);
    }
  });

  $('#home').on('click', (e) => {
    sessionStorage.setItem('focusUser', -1);
    $('#content').empty();

    addSearchUsers();

    const users = ejs.render(userListTemplate);
    $('#content').append(users);

    updateUserList();
    $('.userList').slideToggle();
  });

  $('.overlay .glyphicon').on('mousedown', function(){
    if ($(this).hasClass('active')) {
      $(this).removeClass('active');
    } else {
      $(this).addClass('active');
    }
  });

  $('.glyphicon-thumbs-up').on('mouseup', function(){
    voteMessage(true);
  });

  $('.glyphicon-thumbs-down').on('mouseup', function(){
    voteMessage(false);
  });

});
