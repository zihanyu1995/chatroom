let privilege = sessionStorage.getItem('privilege');
//let privilege = 1;

function checkPrivilegePostAnnouncement() {
  if(privilege == 0) {
    setSearchAnnouncements();
    setDisplayAnnouncements();
  }
  else if(privilege == 1 || privilege == 2) {
    setSearchAnnouncements();
    setPostAnnouncement();
    setDisplayAnnouncements();
  }
}
