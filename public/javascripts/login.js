$(function() {
  /* Submit user info and response depends on status */
  var reservedUserName;
  $.getJSON('/static/reservedUserName.json', function(data) {
    reservedUserName = new Set(data);
  });

  $('#submitBtn').on('click', e => {
    e.stopPropagation();
    e.preventDefault();
    $('#loginFail').empty();
    $('#wantRegister').empty();
    let username = $('#username').val();
    let password = $('#password').val();
    login(username, password);
  });

  /* Register */
  $('#register').on('click', e => {
    e.stopPropagation();
    e.preventDefault();
    let username = $('#username').val();
    let password = $('#password').val();
    register(username, password);
  });

  $('#join').bootstrapValidator({
    message: 'This value is not valid',
    feedbackIcons: {
        valid: 'glyphicon glyphicon-ok',
        invalid: 'glyphicon glyphicon-remove',
        validating: 'glyphicon glyphicon-refresh'
    },
    fields: {
      username: {
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
              return !reservedUserName.has($('#username').val());
            }
          }
        }
      },
      password: {
        validators: {
          notEmpty: {
            message: 'Password is required.'
          },
          stringLength: {
            min: 4,
            message: 'Password must be at least 4 characters.'
          }
        }
      }
    }
  })
  .on('error.field.bv', (e, data) => {
    if (!$("#join").data("bootstrapValidator").isValid()) {
        data.bv.disableSubmitButtons(true);
    }
  })
  .on('success.field.bv', (e, data) => {
    if (!$("#join").data("bootstrapValidator").isValid()) {
        data.bv.disableSubmitButtons(true);
    }
  });
});
