const userTemplate = `<li class="user" id="u<%= id %>"><a href="#">
<span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span>
<%= name %><i id="f<%= id %>" class="friend fa <%= friend %>" aria-hidden="true"></i>
</a></li>`;

var userWithRequestTemplate = `<li class="user" id="u<%= id %>"><a href="#">
<span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span>
<%= name %><i id="ac<%= id %>" class="accept fa-check" aria-hidden="true"> Accept</i> <i id="re<%= id %>" class="refuse fa-times" aria-hidden="true"> Refuse</i>
</a></li>`;

var userselfTemplate = `<li class="user" id="u<%= id %>"><a href="#">
<span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span>
<%= name %>
</a></li>`;

var friendsArray = ['fa-user-plus', 'fa-heart'];

function setSession(id, isNewUser, username, status, privilege){
  sessionStorage.setItem("id", id);
  sessionStorage.setItem("isNewUser", isNewUser);
  sessionStorage.setItem("username", username);
  sessionStorage.setItem("status", status);
  sessionStorage.setItem("privilege", privilege);
}

function login(username, password) {
  const data = { username, password: SparkMD5.hash(password), inputType: 0 };
  $.ajax({
    url: '/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: (data, status, xhr) => {
      switch (xhr.status) {
        /* Login Successfully */
        case 200:
          setSession(data.id, data.isNewUser, data.username, data.status, data.privilege);
          location.replace('/');
          users = data;
          break;
        /* User not exist, ask if want to register */
        case 202:
          $('#registerModal').modal('show');
          break;
        default:
          console.log('other success code, should not come here');
      }
    },
    error: (xhr, textStatus, data) => {
      switch (xhr.status) {
        /* Wrong Password */
        case 303:
          $('#loginFail').append('<div class="alert alert-warning">Inactive User</div>');
          break;
        case 302:
            $('#loginFail').append('<div class="alert alert-warning">Wrong password</div>');
            break;
        default:
          console.log('unknown error');
      }
    },
  });
}

function register(username, password) {
  const data = { username, password: SparkMD5.hash(password), inputType: 1 };
  $.ajax({
    url: '/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: (data, status, xhr) => {
      switch (xhr.status) {
        /* Register Successfully */
        case 201:
          setSession(data.id, data.isNewUser, data.username, 4, 0);
          location.replace('/');
          break;
        default:
          location.replace('/');
      }
    },
    error: (xhr, textStatus, data) => {
      console.log('unknown error');
    },
  });
}

function logout(username) {
  const data = { username, inputType: 2 };
  $.ajax({
    url: '/users',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: (data, status) => {
      location.href = '/';
      sessionStorage.clear();
    },
    error: (data, status, e) => {
      if (status == 'error') {
        location.href = '/';
        sessionStorage.clear();
      }
    },
  });
}

function sendWelcomeMessage() {
  if (sessionStorage.getItem('isNewUser') == 'true') {
    sessionStorage.setItem('isNewUser', false);
    $('#welcomeModal').modal('show');
  }
}
function renderUsers(Users) {
    var onlineUser = $("#onlineUser");
    var offlineUser = $("#offlineUser");
    onlineUser.empty();
    offlineUser.empty();
    var whichList;
    $.each(Users, function(i, user) {
      userMap[user.id] = user.userName;
      if(user.online == "0") {
        whichList = onlineUser;
      } else {
        whichList = offlineUser;
      }
      let status = user.status;
      let friend = user.friend;
      let friendReq = user.friendReq;
      if (user.id != sessionStorage.id) {
        if (friendReq == 0) {
          let k = ejs.render(userTemplate, {id: String(user.id), status: statusArray[status], color: colorArray[status], name: user.userName, friend: friendsArray[friend]});
          whichList.append(k);
        } else {
          let k = ejs.render(userWithRequestTemplate, {id: String(user.id), status: statusArray[status], color: colorArray[status], name: user.userName});
          whichList.append(k);
        }
      } else {
        let k = ejs.render(userselfTemplate, {id: String(user.id), status: statusArray[status], color: colorArray[status], name: user.userName});
        whichList.append(k);
      }


    });
    $('.user').on('click', function(e) {
      $('ul li').removeClass('active');
      $(this).addClass('active');
      let userID = parseInt($(this).attr("id").slice(1));
      if(sessionStorage.id != userID ){ // don't talk to yourself
        addUserToDropdown(userID, $.trim($(this).text()), true);
        enterChatroom(userID);
        $('#myNavbar').removeClass('in');
      }
    });
    $('.fa-user-plus').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      let userID = parseInt($(this).attr("id").slice(1));
      let data = {"fromuser": sessionStorage.id, "touser": userID};
      $.ajax({
        type: 'POST',
        url: '/friends/request',
        data: data,
        success:(data,status) => {
          $.notify({
            icon: 'glyphicon glyphicon-bell',
            message: 'Friend request has been sent successfully!'
          });
        },
        error:(xhr, textStatus, data) => {
          $.notify({
            icon: 'glyphicon glyphicon-bell',
            message: 'Friend request has already been sent! Please wait for respond :)'
          });
        }
      });
    });

    $('.accept').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      let userID = parseInt($(this).attr("id").slice(2));
      let data = {"uid1": sessionStorage.id, "uid2": userID, "accept": 1};
      $.ajax({
        type: 'POST',
        url: '/friends',
        data: data,
        success:(data,status) => {
          updateUserList();
          $.notify({
            icon: 'glyphicon glyphicon-bell',
            message: 'You accepted friend request from ' + userMap[userID] + '.'
          });
        }
      });
    });

    $('.refuse').on('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      let userID = parseInt($(this).attr("id").slice(2));
      let data = {"uid1": sessionStorage.id, "uid2": userID, "accept": 0};
      $.ajax({
        type: 'POST',
        url: '/friends',
        data: data,
        success:(data,status) => {
          updateUserList();
          $.notify({
            icon: 'glyphicon glyphicon-bell',
            message: 'You refused friend request from ' + userMap[userID] + '.'
          });
        }
      });
    });
}

// updateUserList
function getUserList() {
  $.ajax({
    type: 'GET',
    url: '/users?id=' + sessionStorage.id,
    success: (Users)=>{
      renderUsers(Users);
      users = Users;
    },
  });
}
