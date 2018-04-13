const userProfileTemplate = `
<div class="box">
  <form id="profileForm" role="form" class="profileForm">
    <div class="form-group">
      <label for="accountStatus">Account Status</label>
      <select class="form-control" id="accountStatus">
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>
    <div class="form-group">
      <label for="privilege">Privilege Level</label>
      <select class="form-control" id="privilege">
        <option value=0>Citizen</option>
        <option value=1>Coordinator</option>
        <option value=2>Administrator</option>
      </select>
    </div>
    <div class="form-group">
      <label class="label-self" for="pro_username">Username</label>
      <input class="form-control" id="pro_username" name="pro_username" value="<%= username %>" placeholder="Type here to change the username."></input>
    </div>
    <div class="form-group">
      <label class="label-self" for="pro_password">Password</label>
      <input type="password" class="form-control" id="pro_password" name="pro_password" placeholder="Type here to change the password."></input>
    </div>
  <button name="submit" type="submit" id="saveProfile" class="btn btn-self save-profile-btn" disabled="disabled">Save</button>
  <button id="cancelProfile" class="btn cancel-profile-btn">Back</button>
  </form>
  <div id="updateResult"></div>
</div>
`;

const userProfileListTemplate = `
<h4 class="title">User List</h4>
<div class="pro-userList" id="profileList">
<ul class="users nav" id="pro-user">
</ul>
</div>
`;

const userProfileItemTemplate = `<li class="puser" id="pu<%= id %>">
<a href="#"><span class="glyphicon glyphicon-user"></span> <%= name %><span class="glyphicon glyphicon-pencil" style="float: right;"></span></a>
</li>`;

var reservedUserName;
$.getJSON('/static/reservedUserName.json', function(data) {
  reservedUserName = new Set(data);
});

function enterUserProfileList() {
  $('#profile').on('click', function(e) {
    $('#content').empty();
    let k = ejs.render(userProfileListTemplate);
    $('#content').append(k);
    getUserProfileList();
  })
}

function getUserProfileList() {
  $.ajax({
    type: 'GET',
    url: '/admin/users',
    success: (Users)=>{
      userProfiles = Users;
      renderUserProfileList(Users);
    },
  });
}

function renderUserProfileList(Users) {
  $.each(Users, function(i, user) {
    userMap[user.id] = user.userName;
    if (user.username != 'ESNAdmin') {
      let k = ejs.render(userProfileItemTemplate, {id: String(user.id), name: user.username});
      $('#pro-user').append(k);
    }
    $('.puser').on('click', function(e) {
      let id = parseInt($(this).attr("id").slice(2));
      enterUserProfile(id);
    });
  });
}

function enterUserProfile(id) {
  let chosen_user;
  for(let i = 0; i < userProfiles.length; i ++) {
    if(userProfiles[i].id == id) {
      chosen_user = userProfiles[i];
    }
  }
  $('#content').empty();
  let k = ejs.render(userProfileTemplate, { username: chosen_user.username, password: chosen_user.password });
  $('#content').append(k);
  addValidation();
  $('#profileForm').data('bootstrapValidator').validate();
  $('#privilege').val(chosen_user.privilege);
  if (chosen_user.active) {
    $('#accountStatus').val("true");
  } else {
    $('#accountStatus').val("false");
  }
  $('#cancelProfile').on('click', function(e) {
    e.stopPropagation();
    e.preventDefault();
    $('#content').empty();
    let k = ejs.render(userProfileListTemplate);
    $('#content').append(k);
    getUserProfileList();
  });
  $('#saveProfile').on('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    let active = 'true';
    if ($('#accountStatus').val() == "false")
      active = 'false';
    let username = $('#pro_username').val();
    let password = chosen_user.password;
    if ($('#pro_password').val() != '') {
      password = SparkMD5.hash($('#pro_password').val());
    }
    var privilege = parseInt($('#privilege').val());
    for(let i = 0; i < userProfiles.length; i ++) {
      if(userProfiles[i].id == id) {
        userProfiles[i].username = username;
        userProfiles[i].password = password;
        if ($('#accountStatus').val() == "false")
          userProfiles[i].active = 'false';
        else
          userProfiles[i].active = 'true';
        userProfiles[i].privilege = parseInt($('#privilege').val());
      }
    }
    const data = {
      username: username,
      password: password,
      active: active,
      privilege: privilege
    };
    console.log(data);
    $.ajax({
      url: '/admin/users/' + id,
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(data),
      success: (data, status, xhr) => {
        switch (xhr.status) {
          case 200:
            $('#updateResult').empty();
            $('#updateResult').append('<div class="alert alert-success">Update has been saved.</div>');
            break;
          default:
            $('#updateResult').empty();
            $('#updateResult').append('<div class="alert alert-warning">Update fails.</div>');
        }
      },
      error: (xhr, textStatus, data) => {
        console.log('unknown error');
      },
    });
  });
}

function addValidation() {
  $('#profileForm').bootstrapValidator({
    message: 'This value is not valid',
    feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      pro_username: {
        validators: {
          notEmpty: {
            message: 'Username is required.'
          },
          stringLength: {
            min: 3,
            message: 'Username must be at least 3 characters.'
          },
          callback: {
            message: 'Username cannot be a reserved username.',
            callback: function (value, validator, $field) {
              return !reservedUserName.has($('#pro_username').val());
            }
          }
        }
      },
      pro_password: {
        validators: {
          stringLength: {
            min: 4,
            message: 'Password must be at least 4 characters.'
          }
        }
      }
    }
  })
  .on('error.field.bv', (e, data) => {
    if (!$("#profileForm").data("bootstrapValidator").isValid()) {
        data.bv.disableSubmitButtons(true);
    }
  })
  .on('success.field.bv', (e, data) => {
    if (!$("#profileForm").data("bootstrapValidator").isValid()) {
        data.bv.disableSubmitButtons(true);
    }
  });
}
