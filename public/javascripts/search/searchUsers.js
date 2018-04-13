var searchUserTemplate = `<div class="search-box">
              <div class="search form-inline">
                <input type="text" class="search-user-input form-control" id="usernameFilter"></input>
                <select class="selectpicker form-control search-user-select" data-width="30%" style="border-radius: 0" id="statusFilter">
                </select>
                <button class="search-button btn btn-default form-control" id="searchUserBtn"><span class="glyphicon glyphicon-search" aria-hidden="true" ></span></button>
              </div>
            </div>`;

function addSearchUsers(){
  let search = ejs.render(searchUserTemplate);
  $('#content').empty();
  $('#content').append(search);
  renderStatusFilter();
  renderSearchUserBtn();
}

function renderStatusFilter(){
  let statusFilter = $('#statusFilter');
  for (let i = 0; i < 5; ++i) {
    let k = ejs.render(statusFilterTemplate, {value: i, id: "s"+i, msg: statusFilterMsgArray[i] + " "});
    statusFilter.append(k);
  }
  $('#statusFilter').selectpicker('refresh');
}

function renderSearchUserBtn(){
  $('#searchUserBtn').on("click", function(e) {
    let username = $('#usernameFilter').val().split(' ');
    let status = $('#statusFilter').val();
    let ret = [];
    for(let i = 0; i < users.length; i ++) {
      if(isStatus(users[i], status) && isPartOfUsername(users[i], username)) {
        ret.push(users[i]);
      }
    }
    console.log(ret);
    displayUserResult(ret);
  });
}

function displayUserResult(ret) {
  renderUsers(ret);
  if(ret.length == 0) {
    $('#no-user-result').removeClass('hidden');
  }
  else{
    $('#no-user-result').addClass('hidden');
  }
}

function isStatus(user, status) {
  status = (status == 0) ? '1234' : status;
  if(status.indexOf(user.status) >= 0) {
    return true;
  }
  return false;
}

function isPartOfUsername(user, username) {
  if(username[0].length == 0){
    return true;
  }
  let fitConditions = true;
  for(let j = 0; j < username.length; j ++) {
    if(user.userName.indexOf(username[j]) < 0) {
      fitConditions = false;
      break;
    }
  }
  return fitConditions;
}
