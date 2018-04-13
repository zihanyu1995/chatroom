var statusTemplate = `<li value="<%= value %>" class="statusItem" id="<%= id %>"><a href=#><span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span> <%= msg %></a></li>`;
var useraTemplate = `<a href="#">
<span class="glyphicon glyphicon-<%= status %>" style="color: rgb(<%= color %>);"></span>
<%= name %>
</a>`;
var statusMsgArray = ['', 'OK', 'Help', 'Emergency', 'Undefined'];

function changeUserStatus(id, status) {
  let userid = "#u" + id;
  let username = $(userid).text();
  $(userid).empty();
  let k = ejs.render(useraTemplate, {status: statusArray[status], color: colorArray[status], name: username});
  $(userid).append(k);
}

function bindStatusChange() {
  $('.statusItem').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if ($(this).val() != sessionStorage.getItem("status")) {
      sessionStorage.setItem("status", $(this).val());
      let data = {'status': $(this).val()};
      $.ajax({
        url:'/users/' + sessionStorage.getItem("id"),
        type:'POST',
        contentType: "application/json",
        data: JSON.stringify(data),
        success:(data, status, xhr) => {
          switch(xhr.status) {
            case 200:
              $('ul li').removeClass('active');
              $(this).addClass('active');
              changeUserStatus(sessionStorage.id, sessionStorage.status);
              $.notify({
                icon: 'glyphicon glyphicon-bell',
                message: `Status has been changed to ${statusMsgArray[sessionStorage.status]} successfully!`,
              });
              break;
            case 400:
              console.log('user not exists');
              break;
            default:
              console.log('other status change code');
          }
        },
        error:(xhr, textStatus, data) => {
          console.log('error status change');
        }
      });
    }
  })
}

function setStatusMenu() {
  let menu = $("#statusMenu");
  let status = sessionStorage.getItem("status");
  for (let i = 1; i < 5; ++i) {
    let k = ejs.render(statusTemplate, {value: i, id: "s"+i, status: statusArray[i], msg: statusMsgArray[i] + " ", color: colorArray[i]});
    menu.append(k);
  }
  bindStatusChange();
}
