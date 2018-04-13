var postAnnouncementTemplate = `
<form id="announceform">
  <div class="form-group">
    <textarea id="anuc_content" class="form-control" rows="3"></textarea>
  </div>
  <button id="announce" class="btn btn-self">Announce</button>
</form>
<br/>
`;

var displayAnnouncementTemplate = `
<div>
  <div class="history" id="historyAnnounce">
  </div>
  <button id="viewMoreBtn" class="btn btn-self">View More</button>
  <hr id="viewMoreHr" class="hidden"/>
</div>
`;

var historyAnnouncementTemplate = `
<p class="announcement-title">
  <span class="search-announcement-name"><%= author %></span>
  <span class="search-announcement-time"><%= date %></span>
  <br/>
</p>
<p class="announcement-content">
  <span class="search-announcement-message"><%= content %></span>
  <br/>
</p>
<br/>
`;

var announcements;
var viewAnnouncementCount = 10;

var stopWords;
$.getJSON('/static/stopWords.json', function(data) {
  stopWords = new Set(data);
});

function enterAnnouncement() {
  //-2 : focus on post announcement
  if (sessionStorage.getItem("focusUser") != -2) {
    $('#announcement').on('click', function(e) {
      sessionStorage.setItem("focusUser", -2);
      $('#content').empty();
      checkPrivilegePostAnnouncement();
    })
  }
}

function setPostAnnouncement() {
  let k = ejs.render(postAnnouncementTemplate);
  $('#content').append(k);
  bindPostAnnouncement();
}

function setDisplayAnnouncements() {
  let k = ejs.render(displayAnnouncementTemplate);
  $('#content').append(k);
  initAnnouncementDisplay();
  addViewMoreBtn();
  getHistoryAnnouncements();
}

function initAnnouncementDisplay(){
  viewAnnouncementCount = 10;
  displayViewMoreBtn();
}

function addViewMoreBtn() {
  $('#content').on('click', '#viewMoreBtn',function(e) {
    viewAnnouncementCount += 10;
    renderAnnouncementsResult();
  })
}

function renderAnnouncementsResult() {
  let data = announcements;
  $('#historyAnnounce').empty();
  let length = (data.length >= viewAnnouncementCount) ? viewAnnouncementCount : data.length;
  if(data.length < viewAnnouncementCount) {
    hideViewMoreBtn();
  }
  for (var i = 0; i < length; i++) {
    let time = new Date(parseInt(data[i].sendtime)).toLocaleString();
    let k = ejs.render(historyAnnouncementTemplate, {content: data[i].content, author: data[i].username, date: time});
    $('#historyAnnounce').append(k);
  }
}

function getHistoryAnnouncements() {
  $.ajax({
    url: '/announcements',
    type: 'GET',
    success:(data, status, xhr) => {
      switch(xhr.status) {
        case 210:
        case 200:
          announcements = data;
          renderAnnouncementsResult();
          break;
        default:
          console.log('other success code, should not come here');
      }
    }　
  })
}

function bindPostAnnouncement() {
  $('#content').on('click', '#announceform #announce',function(e) {
    e.preventDefault();
    let data = {"userid": sessionStorage.id, "username": sessionStorage.username, "announcement": $('#anuc_content').val()};
    $.ajax({
      url: '/announcements',
      type: 'POST',
      data: data,
      success:(data, status, xhr) => {
        switch(xhr.status) {
          case 201:
          case 210:
            $('#anuc_content').val("");
            getHistoryAnnouncements();
            break;
          default:
            console.log('other success code, should not come here');
        }
      }　
    })
  })
}

function displayViewMoreBtn() {
  $('#viewMoreBtn').removeClass('hidden');
  $('#viewMoreHr').addClass('hidden');
}

function hideViewMoreBtn() {
  $('#viewMoreBtn').addClass('hidden');
  $('#viewMoreHr').removeClass('hidden');
}
