// var messageBoxTemplate = `
// <p class="historyTitle">Moments</p>
// <div id="historyFriendsMessages">
// </div>`;

var messageBoxTemplate = `<div class="box">
						<div id="h">
							<h4 class="pull-left title">Moments</h4>
						</div>
            <div class="list" id="historyFriendsMessages"></div>
          </div>`;

// var statusMessageTemplate = `
// <p class="announcement"><%= content %><br/> <br/><p class="announcement" style="font-style:italic"><%= author %><br/><%= date %></p></p>
// `;

var statusMessageTemplate = `<div class="msg" contenteditable="true">
	<div class="content">
		<span class="time">
			<%= date %>
		</span>
		<span class="name">
			<%= author %>
		</span>
    <hr/>
    <span class="moments">
      <%= author %> changed status to <%= description %> <span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span>
    </span>
    <hr/>
	</div>
</div>`;

function enterMessageBox() {
  if (sessionStorage.getItem("focusUser") != -3) {
    $('#messagebox').on('click', function(e) {
      sessionStorage.setItem("focusUser", -3);
      $('#content').empty();
      let k = ejs.render(messageBoxTemplate);
      $('#content').append(k);
      getHistoryFriendsMessages();
    })
  }

}

function getHistoryFriendsMessages() {
  $.ajax({
    url: '/friends/moments/' + sessionStorage.id,
    type: 'GET',
    success:(data, status, xhr) => {
      switch(xhr.status) {
        case 200:
          $('#historyFriendsMessages').empty();
					if (data.length == 0) {
						let noResult = '<div id="noresult" class="noChange">No friend is in emergency/help.</div>';
						$('#historyFriendsMessages').append(noResult);
					} else {
						for (var i = 0; i < data.length; i++) {
							let time = new Date(parseInt(data[i].sendtime)).toLocaleString();
							let status = data[i].status;
							let content = userMap[data[i].userid] + ' changed status to  ' + statusMsgArray[data[i].status] + '.';
							let k = ejs.render(statusMessageTemplate, {description: statusMsgArray[data[i].status], author: userMap[data[i].userid], date: time, status: statusArray[status], color:colorArray[status]});
							$('#historyFriendsMessages').append(k);
						}
					}
          break;
        default:
          console.log('other success code, should not come here');
      }
    }　
  })
}
