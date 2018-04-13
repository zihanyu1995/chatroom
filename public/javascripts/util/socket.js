let socket;
function setupSocket() {
  // send back the token received
  socket = io();
  socket.on('authToken', (sockID) => {
    $.ajax({
      type: 'POST',
      url: '/auth',
      data: { sockID: sockID.sockID },
      success: () => { // TODO: what about error
      },
    });
  });
  socket.on('message', (data) => {
    if (data.fromUserID != sessionStorage.id) {
      displayUnreadIndicator();
      addUserToDropdown(data.fromUserID, userMap[data.fromUserID], false);
    }
    console.log(data.toUserID);
    if (sessionStorage.focusUser == data.toUserID) { appendMessage(data.fromUserID, data.message, data.time, data.status, data.vote, data.id); }
    if (sessionStorage.focusUser == data.fromUserID && data.toUserID != 0) { appendMessage(data.fromUserID, data.message, data.time, data.status, data.vote, data.id); }
  });

  socket.on('announcement', (data) => {
    if (data.username != sessionStorage.username) {
      $.notify({
        icon: 'glyphicon glyphicon-bell',
        message: `  @${data.username} just post a new announcement!`,
      });
    }
    getHistoryAnnouncements();
  });

  socket.on('registerUser', (data) => {
    if (data.registerUserId != sessionStorage.id) {
      console.log('update for new registered user');
      updateUserList();
    }
  });

  socket.on('logout', function (data) {
    if(data.id != sessionStorage.id){
      console.log('update for user logout');
      updateUserList();
    }
  });

  socket.on('inactive', function (data) {
    if(data.id != sessionStorage.id){
      console.log('update for user logout');
      updateUserList();
    } else {
      $.notify({
        icon: 'glyphicon glyphicon-bell',
        message: 'Your account is inactive now! You will be logged out in 3 seconds.',
        type: 'danger'
      });
      setTimeout(function(){
        let username = sessionStorage.username;
        logout(username);
      },3000)
    }
  });

  socket.on('status', function (data) {
    if ((sessionStorage.id == data.id)&&(sessionStorage.status != data.status)) {
      sessionStorage.status = data.status;
    }
    changeUserStatus(data.id, data.status);
    getHistoryFriendsMessages();
    updateUserList();
  });

  socket.on('friendStatus', function (data) {
    if (data.status == 2 || data.status == 3) {
      $.notify({
        icon: 'glyphicon glyphicon-bell',
        message: '  @' + userMap[data.id] + ' just changed status to ' + statusMsgArray[data.status] + '!'
      });
    }
  });
  // TODO:server should emit signal to everyone if someone logout, login, or is being created
  // socket.on('userChange', function (data) {
  // blahblahblah
  // });

  socket.on('request', function (data) {
    $.notify({
      icon: 'glyphicon glyphicon-bell',
      message: '  @' + userMap[data.fromUserID] + ' wants to be your friend! Open Home to check!'
    });
    updateUserList();
  });

  socket.on('accept', function (data) {
    $.notify({
      icon: 'glyphicon glyphicon-bell',
      message: '  @' + userMap[data.id] + ' accepts your friend request!'
    });
    updateUserList();
  });

  socket.on('refuse', function (data) {
    $.notify({
      icon: 'glyphicon glyphicon-bell',
      message: '  @' + userMap[data.id] + ' refuses your friend request.'
    });
  });

}
