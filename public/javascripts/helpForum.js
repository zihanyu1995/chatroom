var postTemplate = `
<div>
  <div class="btn-toolbar" role="toolbar">
     <p class="title">Help Forum</p>
     <div class="form-inline" >
      <button id="searchPostBtn" class="search-Post-Btn" >search <span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
      <button id="PostBtn" class="Post-Btn">post  <span class="glyphicon glyphicon-plus-sign" aria-hidden="true" ></span></button>
    </div>
  </div>

<br/>
   <p class="historyTitle">History Posts</p>
   <div class="history" id="historyPost"></div>
<br/>
`;

var historyPostTemplate = `
<p class="posts-content">
  <span class="posts-topic"><%= topic %></span>
  <a data-toggle="collapse" href="#<%= id %>"><span class="posts-title"><%= title %></span></a>
  <br/>
</p>
<p class="posts-postinfo">
  <span class="posts-name"><%= author %></span>
  <span class="posts-time"><%= date %></span>
  </br>
</p>
<p class="posts-postinfo posts-full-context panel-collapse collapse" id= "<%= id %>"><%= post %></p>
`;

var clickPostTemplate =`
<div class="form-group">
  <p class="title">Add Tips</p>
   <form id="postValidation" role="form">
    <div class="form-group">
      <input type="text" class="post-title-input form-control" placeholder="title"  name="title_content" id="title_content"></input>
    </div>
    <div class="form-group">
      <textarea class="post-tips-textarea form-control" rows="5" placeholder="Input your tips here." name="post_content" id="post_content"></textarea>
    </div>
    <div class="form-group">
      <div id="poatValidMessages"></div>
    </div>
   </form>
   <form class="forumForm">
    <div class="topic_radios">
     <div class="form-check topic-radio ">
       <label class="form-check-label">
       <input class="form-check-input" type="radio" name="topicRadios" id="roleradios1" value=0 checked>
       tips for earthquake
       </label>
     </div>
     <div class="form-check topic-radio ">
       <label class="form-check-label">
       <input class="form-check-input" type="radio" name="topicRadios" id="roleradios2" value=1>
       tips for fire
       </label>
     </div>
     <div class="form-check topic-radio ">
       <label class="form-check-label">
       <input class="form-check-input" type="radio" name="topicRadios" id="roleradios3" value=2>
       tips for Chemical Emergency
       </label>
     </div>
     <div class="form-check topic-radio ">
       <label class="form-check-label">
       <input class="form-check-input" type="radio" name="topicRadios" id="roleradios4" value=3>
       tips for other
       </label>
     </div>
   </div>
   </form>
   <div>
     <button class="post-location-btn btn btn-self" id="submitPostBtn">submit</button>
     <button class="cancel-location-btn btn" id="cancelPostBtn">Cancel</button>
   </div>
`;

var clickSearchTemplate = `
 <div class="search-post-box">
    <div class="form-inline">
      <input type="text" class="search-post-input form-control" id="searchPostContent"></input>
      <button class="search-post-button btn btn-default" id="searchTipBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
      <button class="search-post-collapse btn btn-default" id="closeSearchBtn"><span class="glyphicon glyphicon-remove" aria-hidden="true" ></span></button>
    </div>
    <div id="noresult" class="noresult">No Result</div>
    <div id="postresult" class="search-post-list hidden">
    </div>
    <button id="viewMorePostsBtn" class="more btn btn-self hidden">View More  <span class="glyphicon glyphicon-chevron-down"></span></button>
    <br/>
       <div class="history" id="historyPost"></div>
    <br/>
  </div>
  `;

var stopWords;
  $.getJSON('/static/stopWords.json', function(data) {stopWords = new Set(data);});
var posts;
var postsResult;

var viewPostCount = 10;

function initPostDisplay(){
  // displayTitle('History Posts');
  viewPostCount = 10;
  displayViewMoreBtn();
}

function enterPost() {
  initPostDisplay();
  addViewMoreBtn();
  // -2 : focus on post
  if (sessionStorage.getItem("focusUser") != -2) {
    $('#post').on('click', function(e) {
      sessionStorage.setItem("focusUser", -2);
      $('#content').empty();
      let k = ejs.render(postTemplate);
      $('#content').append(k);
      getHistoryPosts();
    })
  }
}

function getHistoryPosts() {
  // displayTitle('History posts');
  $.ajax({
    url: '/posts',
    type: 'GET',
    success:(data, status, xhr) => {
      switch(xhr.status) {
        case 210:
        case 200:
          posts = data.title;
          postsResult = data;
          renderPostsResult();
          break;
        default:
          console.log('other success code, should not come here');
      }
    }　
  })
}

function renderPostsResult() {
  let data = postsResult;
  $('#historyPost').empty();
  let length = (data.length >= viewPostCount) ? viewPostCount : data.length;
  if(data.length < viewPostCount) {
    hideViewMoreBtn();
  }
  for (var i = 0; i < length; i++) {
    let time = new Date(parseInt(data[i].sendtime)).toLocaleString();
    if(data[i].topic === 0)
      tipsTopic = "[EQ]  ";
    if(data[i].topic === 1)
      tipsTopic = "[FR]  " ;
    if(data[i].topic === 2)
      tipsTopic = "[CE]  " ;
    if(data[i].topic === 3)
      tipsTopic = "[Other]  ";
    let k = ejs.render(historyPostTemplate, {"id": i, "title": data[i].title, "post": data[i].post, "author": data[i].username, "date": time, "topic": tipsTopic});
    $('#historyPost').append(k);
  }
}

function clickOnPost() {
  $('#content').on('click', '#PostBtn', function(e) {
      $('#content').empty();
    let k = ejs.render(clickPostTemplate);
    $('#content').append(k);
    e.preventDefault();
    clickOnSubmit();
  })　
}

function clickOnSearch() {
  $('#content').on('click', '#searchPostBtn', function(e) {
    $('#content').empty();
    let k = ejs.render(clickSearchTemplate);
    $('#content').append(k);
    getHistoryPosts();
    $('#noresult').text("Enter search words");
    closeSearchPosts();
    searchPosts();
  })　
}

function searchPosts() {
  $('#content').on('click', '#searchTipBtn', function(e) {
   $("#historyPost").empty();
   let content = $('#searchPostContent').val().split(" ");
   if($('#searchPostContent').val()){
   let words = [];
   content.forEach(function (word) {
   if(!stopWords.has(word) && word.length != 0){
     words.push(word);
   }
  });
  if(words.length == 0){
      $('#noresult').text("No Result");
      displayPostNoResult();
      hideViewMorePostsBtn();
  } else {
      getSearchPosts(words);
    }
   }
   else{
     alert("No input");
   }
  })
}

function getSearchPosts(words) {
  $.ajax({
    type: 'GET',
    url: '/posts/' + words,
    success: (data, status, xhr)=>{
      switch (xhr.status) {
        case 210:
        case 200:
          $('#postresult').empty();
          if (data.length == 0) {
            $('#noresult').text("No Result");
            displayPostNoResult();
            hideViewMorePostsBtn();
          } else {
            displayPostResult();
            let length = (data.length >= viewPostCount) ? viewPostCount : data.length;
            if(data.length <= viewPostCount) {
              hideViewMorePostsBtn();
            }else {
              displayViewMorePostsBtn();
            }
            for (var i = 0; i < length; i++) {
              let time = new Date(parseInt(data[i].sendtime)).toLocaleString();
              if(data[i].topic === 0)
                tipsTopic = "[EQ]  ";
              if(data[i].topic === 1)
                tipsTopic = "[FR]  " ;
              if(data[i].topic === 2)
                tipsTopic = "[CE]  " ;
              if(data[i].topic === 3)
                tipsTopic = "[Other]  ";
              let k = ejs.render(historyPostTemplate, {"id": i, "title": data[i].title, "post": data[i].post, "author": data[i].username,
               "date": time, topic: tipsTopic});
              $('#postresult').append(k);
              $(function () { $('#'+i+'').collapse('hide')});
            }
          }
          break;
        default:
          console.log(xhr.status + 'other success code, should not come here');
      }
    }
  });
}

function clickOnSubmit() {
  $('#postValidation').bootstrapValidator({
        container: '#poatValidMessages',
　　　　　message: 'This value is not valid',
        feedbackIcons: {
              valid: 'glyphicon glyphicon-ok',
              invalid: 'glyphicon glyphicon-remove',
              validating: 'glyphicon glyphicon-refresh'
        },
        fields: {
          title_content: {
              validators: {
                notEmpty: {
                  message: 'Title is required'
                },
                stringLength: {
                  max: 100,
                  message: 'Title is limited to 100 characters.'
                },
              }
          },
          post_content: {
              validators: {
                notEmpty: {
                  message: 'Content is required'
                },
                stringLength: {
                  max: 5000,
                  message: 'Content is limited to 5000 characters.'
                }
              }
          },
          }
    });
    $('#content').on('click', '#submitPostBtn', function(e) {
    e.preventDefault();
      sendPost();
  })
}

function sendPost(){
  let postData = {
    "userid": sessionStorage.id,
    "title": $('#title_content').val(),
    "post": $('#post_content').val(),
    "topic": $('input[name="topicRadios"]:checked').val()
   };

  $.ajax({
    url: '/posts',
    type: 'POST',
    contentType: "application/x-www-form-urlencoded",
    data: postData,
    success: (data, status, xhr) =>{
      switch(xhr.status) {
        case 201:
        case 210:
          $('#title_content').val("");
          $('#post_content').val("");
          $('input[name="topicRadios"]:checked').val();
          break;
        default:
          console.log('other success code, should not come here');
      }
    }
  })
}

function clickOnCancel() {
  $('#content').on('click', '#cancelPostBtn', function(e) {
    e.preventDefault();
    $('#title_content').val("");
    $('#post_content').val("");
    $('#content').empty();
    let k = ejs.render(postTemplate);
    $('#content').append(k);
    getHistoryPosts();
  })
}

function closeSearchPosts(){
  $('#content').on('click', '#closeSearchBtn', function(e) {
    sessionStorage.setItem("focusUser", -2);
    $('#content').empty();
    let k = ejs.render(postTemplate);
    $('#content').append(k);
    getHistoryPosts();
  });
}


function hideViewMorePostsBtn() {
  $('#viewMorePostsBtn').removeClass('hidden');
  $('#viewMorePostsBtn').addClass('hidden');
}

function displayViewMorePostsBtn() {
  $('#viewMoreMessagesBtn').addClass('hidden');
  $('#viewMoreMessagesBtn').removeClass('hidden');
}

function displayPostNoResult() {
  $('#noresult').removeClass('hidden');
  $('#postresult').addClass('hidden');
}

function displayPostResult() {
  $('#postresult').removeClass('hidden');
  $('#noresult').addClass('hidden');
}
