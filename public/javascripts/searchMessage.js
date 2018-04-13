var searchMessageTemplate = `  <div class="search-msg-box">
    <div class="form-inline">
      <input type="text" class="search-msg-input form-control" id="searchMessageContent"></input>
      <button class="search-msg-button btn btn-default" id="searchMessageBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
      <button class="search-msg-collapse btn btn-default" id="searchCollapse"><span class="glyphicon glyphicon-remove" aria-hidden="true" ></span></button>
    </div>
    <div id="noresult" class="noresult">No Result</div>
    <div id="msgresult" class="search-msg-list hidden">
    </div>
    <button id="viewMoreMessagesBtn" class="more btn btn-self hidden">View More  <span class="glyphicon glyphicon-chevron-down"></span></button>
  </div>`;

var headerTemplate = `<h4 class="pull-left title" id="chatroomTitle"><%= title %></h4>
							<button id="opensearch" class="opensearchBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>`;
var msgResultTemplate = `<div class="search-msg-content">
        <span class="search-msg-name"><span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= name %></span>
        <span class="search-msg-time"><%= timestamp %></span>
      	<span class="search-msg-message"><%= message %></span>
        </div>`;

var stopWords;
   $.getJSON('/static/stopWords.json', function(data) {
          stopWords = new Set(data);
});

var viewMessageCount = 10;

function opensearch(){
  $("#opensearch").on('click', function(e) {
    $('#h').empty();
    let k = ejs.render(searchMessageTemplate);
    $('#h').append(k);
    $('#noresult').text("Enter search words");
    bindClosesearch();
    bindSearchMessage();
  });
}

function bindClosesearch(){
  $("#searchCollapse").on('click', function(e) {
    $('#h').empty();
    let focus = sessionStorage.focusUser;
    let title = userMap[focus];
    let k = ejs.render(headerTemplate, {title:title});
    $('#h').append(k);
    if (sessionStorage.focusUser == 0)
      messageFilter();
    opensearch();
  });
}

function appendMsgResult(name, message, timestamp, status) {
  let t = new Date(parseInt(timestamp)).toLocaleString();
  let k = ejs.render(msgResultTemplate, {name: name, message: message, timestamp: t, status: statusArray[status], color:colorArray[status]});
  $('#msgresult').append(k);
}

function getSearchMessages(myID, userID, words) {
  $.ajax({
    type: 'GET',
    url: '/messages/' + words,
    data: {fromUserID: myID, toUserID: userID},
    success: (data, status, xhr)=>{
      switch (xhr.status) {
        case 210:
        case 200:
          $('#msgresult').empty();
          if (data.length == 0) {
            $('#noresult').text("No Result");
            displayMessageNoResult();
            hideViewMoreMessagesBtn();
          } else {
            displayMessageResult();
            let length = (data.length >= viewMessageCount) ? viewMessageCount : data.length;
            if(data.length <= viewMessageCount) {
              hideViewMoreMessagesBtn();
            }else {
              displayViewMoreMessagesBtn();
            }
            for (var i = 0; i < length; i++) {
              appendMsgResult(data[i].fromUsername, data[i].message, data[i].sendtime, data[i].status);
            }
          }
          break;
        default:
          console.log(xhr.status + 'other success code, should not come here');
      }
    }
  });
}

function searchMessage() {
  let content = $('#searchMessageContent').val().split(" ");
  let words = [];
  content.forEach(function (word) {
    if(!stopWords.has(word) && word.length != 0){
      words.push(word);
    }
  });
  if(words.length == 0){
    $('#noresult').text("No Result");
    displayMessageNoResult();
    hideViewMoreMessagesBtn();
  } else {
    let userID = sessionStorage.focusUser;
    let myID = sessionStorage.id;
    getSearchMessages(myID, userID, words);
  }
}

function bindSearchMessage(){
  $('#content').on('click', '#searchMessageBtn',function(e) {
    viewMessageCount = 10;
    searchMessage();
  });
}

function bindMoreMessages() {
  $('#content').on('click', '#viewMoreMessagesBtn',function(e) {
    viewMessageCount += 10;
    searchMessage();
  })
}

function hideViewMoreMessagesBtn() {
  $('#viewMoreMessagesBtn').removeClass('hidden');
  $('#viewMoreMessagesBtn').addClass('hidden');
}

function displayViewMoreMessagesBtn() {
  $('#viewMoreMessagesBtn').addClass('hidden');
  $('#viewMoreMessagesBtn').removeClass('hidden');
}

function displayMessageNoResult() {
  $('#noresult').removeClass('hidden');
  $('#msgresult').addClass('hidden');
}

function displayMessageResult() {
  $('#msgresult').removeClass('hidden');
  $('#noresult').addClass('hidden');
}
