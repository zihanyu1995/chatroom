var searchAnnouncementCloseTemplate = `
<div class="box">
  <div id="h-announcement">
    <h4 class="pull-left title" id="chatroomTitle">History Announcements</h4>
    <button id="opensearch-announcement" class="opensearchBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
  </div>
</div>
`;

var searchAnnouncementOpenTemplate = `
<div class="search-msg-box">
  <div class="form-inline">
    <input type="text" class="search-msg-input form-control" id="searchAnnouncementContent"></input>
    <button class="search-msg-button btn btn-default" id="searchAnnouncementBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
    <button class="search-msg-collapse btn btn-default" id="searchAnnouncementCollapse"><span class="glyphicon glyphicon-remove" aria-hidden="true" ></span></button>
  </div>
  <div id="noresult-announcement" class="noresult">No Result
  </div>
  <div id="result-announcement" class="search-msg-list hidden">
  </div>
  <button id="viewMoreMessagesBtn" class="more btn btn-self hidden">View More  <span class="glyphicon glyphicon-chevron-down"></span></button>
</div>
`;

var announcementResultTemplate = `
<div class="search-msg-content">
  <span class="search-announcement-name"><%= name %></span>
  <span class="search-announcement-time"><%= timestamp %></span>
  <span class="search-announcement-message"><%= content %></span>
</div>
`;


function setSearchAnnouncements() {
  let k = ejs.render(searchAnnouncementCloseTemplate);
  $('#content').append(k);
  bindSearchAnnouncements();
}

function bindSearchAnnouncements(){
  $("#opensearch-announcement").on('click', function(e) {
    $('#h-announcement').empty();
    let k = ejs.render(searchAnnouncementOpenTemplate);
    $('#h-announcement').append(k);
    $('#noresult-announcement').text("Enter search words");
    bindSearchClose();
    bindSearchBtn();
  });
}

function bindSearchClose() {
  $("#searchAnnouncementCollapse").on('click', function(e) {
    $('#h-announcement').empty();
    let k = ejs.render(searchAnnouncementCloseTemplate);
    $('#h-announcement').append(k);
    bindSearchAnnouncements();
  });
}

function bindSearchBtn() {
  $('#content').on('click', '#searchAnnouncementBtn', (e) => {
    initAnnouncementDisplay();
    let content = $('#searchAnnouncementContent').val().split(" ");
    let words = [];
    content.forEach(function (word) {
      if(!stopWords.has(word) && word.length != 0 && !words.includes(word)){
        words.push(word);
      }
    });
    if(words.length != 0){
      searchWords = words;
      getAnnouncementsByConditions(words);
    }
    else{
      displayAnnouncementNoResult();
    }
  })
}

function appendAnnouncementResult(name, timestamp, content) {
  let t = new Date(parseInt(timestamp)).toLocaleString();
  let k = ejs.render(announcementResultTemplate,
    {name: name, timestamp: t, content: content});
  $('#result-announcement').append(k);
}

function getAnnouncementsByConditions(words) {
  let ret = isPartOfAnnouncement(words);
  renderSearchAnnouncements(ret);
}

function renderSearchAnnouncements(announcements) {
  console.log(announcements);
  $('#result-announcement').empty();
  if(announcements.length == 0) {
    displayAnnouncementNoResult();
  }
  else {
    for(let i=0; i<announcements.length; i++) {
      appendAnnouncementResult(announcements[i].username, announcements[i].sendtime, announcements[i].content);
    }
    displayAnnouncementResult();
  }
}

function isPartOfAnnouncement(words) {
  let ret = [];
  for(let i = 0; i < announcements.length; i ++) {
    let fitConditions = true;
    for(let j = 0; j < words.length; j ++) {
      if(announcements[i].content.indexOf(words[j]) < 0){
        fitConditions = false;
      }
    }
    if(fitConditions) {
      ret.push(announcements[i]);
    }
  }
  return ret;
}

function displayAnnouncementNoResult() {
  $('#noresult-announcement').text('No Result');
  $('#noresult-announcement').removeClass('hidden');
  $('#result-announcement').addClass('hidden');
}

function displayAnnouncementResult() {
  $('#noresult-announcement').text("Enter search words");
  $('#result-announcement').removeClass('hidden');
  $('#noresult-announcement').addClass('hidden');
}
