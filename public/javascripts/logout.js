$(function() {
  $('#logout').on('click', e => {
    e.stopPropagation();
    e.preventDefault();
    let username = sessionStorage.username;
    logout(username);
  });
});
