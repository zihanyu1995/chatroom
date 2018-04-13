function modifySession(sessionName, key, value) {
  const s = JSON.parse(sessionStorage.getItem(sessionName));
  if (value) { s[key] = value; } else { delete s[key]; }
  sessionStorage.setItem('privateChatList', JSON.stringify(s));
}

function addUserToDropdown(userID, username, fromMe) {
  const newId = `pu${userID}`;
  const newIDString = `#${newId}`;
  if ($(newIDString).length) { // don't add if it's already in list
    if (!fromMe) {
      $(newIDString).find('a').addClass('sentMsgUser');
    }
  } else {
    modifySession('privateChatList', userID, username);

    const appendUser = (['<li id="', newId, '"><a>', username, '<span class="glyphicon glyphicon-remove-circle"></span></a></li>']).join('');
    $('#privateChatList').append(appendUser);

    if (!fromMe) {
      $(newIDString).find('a').addClass('sentMsgUser');
    }

    // delete user
    $('#privateChatList .glyphicon-remove-circle').last().on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      $(this).closest('li').remove();
      modifySession('privateChatList', userID);
    });

    $(newIDString).on('click', function (e) {
      $('#myNavbar').removeClass('in');
      const userID = parseInt($(this).attr('id').slice(2));
      $(this).find('a').removeClass('sentMsgUser');
      enterChatroom(userID);
    });
  }
}
