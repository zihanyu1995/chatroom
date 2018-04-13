var mapTemplate = `
<div>
  <h4 class="location-title">Location</h4>
  <div id="map_container">Your network is poor, please check it again.</div>
  <button class="btn btn-self" id="sharelocation">Share Location</button>
</div>
`;

var map;

function addMap() {
  $('#location').on('click', function(e) {
    displayMap();
    $('#myNavbar').removeClass('in');
  });
  bindShareLocation();
}

function displayMap() {
  $('#content').empty();
  let k = ejs.render(mapTemplate);
  $('#content').append(k);
  loadMap();
  loadMarkers();
}

function bindShareLocation() {
  $('#content').on('click', '#sharelocation',function(e) {
    e.preventDefault();
    addPostLocation();
  })
}

function bindRoleBtn() {
  $('#locationrole1').on('click', function(e) {

  })
}

function loadMap() {
	let latlng = new google.maps.LatLng(37.41, -122.06);
	let myOptions = {
		zoom: 4,
	  center: latlng,
	  mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	map = new google.maps.Map(document.getElementById('map_container'), myOptions);
}

function loadMarkers() {
  getLocationPosts();
}

function getLocationPosts() {
  $.ajax({
    url: '/locations',
    type: 'GET',
    success:(data, status, xhr) => {
      switch(xhr.status) {
        case 200:
          let locations = data;
          renderLocationsResult(locations);
          break;
        default:
          console.log('other success code, should not come here');
      }
    }　
  })
}

function renderLocationsResult(data) {
  for(let i=0; i<data.length; i++) {
    let lat = data[i].latitude;
    let lng = data[i].longitude;
    let uluru = {lat, lng};
    let infowindow = new google.maps.InfoWindow({
        content: getDisplayInfo(data[i])
    });
    let marker = new google.maps.Marker({
        position: uluru,
        map: map,
        title: 'marker'
    });
    marker.addListener('click', function() {
        infowindow.open(map, marker);
    });
  }
}

function getDisplayInfo(data) {
  data.postTime = new Date(parseInt(data.postTime)).toLocaleString();
  let datap = data.role == 0 ?
    '<p id="info-post-role" style="color: #669999; font-size: 10px; font-weight: bold;">Provider&nbsp;</p>' :
    '<p id="info-post-role" style="color: #996666; font-size: 10px; font-weight: bold;">Seeker&nbsp;</p>'
  return '<p id="info-title">' + data.title + '</p>' +
  datap +
  '<div><p id="info-post-user">' + userMap[data.userID] + '&nbsp;</p>' +
  '<p id="info-post-time">' + ' post at ' + data.postTime + '</p></div>' +
  '<br/><p id="info-post-content">Details:&nbsp;' + data.content + '</p>' +
  '<p id="info-post-avatime">Available time:&nbsp;' + data.startTime + ' - ' + data.endTime + '</p>';
}
