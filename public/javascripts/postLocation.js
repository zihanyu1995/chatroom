var postLocationTemplate = `
<div>
  <h4 class="location-title">Post Location</h4>
  <form id="locationform">
    <div class="form-group">
      <input type="text" class="location-input form-control" placeholder="title" id="title"></input>
      <textarea class="location-textarea form-control" rows="3" placeholder="Resources details and so on." id="location-content"></textarea>
      <div class='location-picker input-group date' placeholder="start time" id='datetimepicker1'>
        <input type='text' class="form-control" id="starttime" />
        <span class="input-group-addon">
          <span class="glyphicon glyphicon-calendar"></span>
        </span>
      </div>
      <div class='location-picker input-group date' id='datetimepicker2'>
        <input type='text' class="form-control" id="endtime" />
        <span class="input-group-addon">
          <span class="glyphicon glyphicon-calendar"></span>
        </span>
      </div>
      <div>
        <div class="form-check location-radio">
          <label class="form-check-label">
          <input class="form-check-input" type="radio" name="locationRadios" id="roleradios1" value="0" checked>
          I am a resource provider
          </label>
        </div>
        <div class="form-check location-radio">
          <label class="form-check-label">
          <input class="form-check-input" type="radio" name="locationRadios" id="roleradios2" value="1">
          I am a resource seeker
          </label>
        </div>
      </div>
      <script type="text/javascript">
        $(function () {
          $('#datetimepicker1').datetimepicker({
            format: "L",
            minDate: Date.now()
          });
          $('#datetimepicker2').datetimepicker({
            format: "L",
            minDate: Date.now()
          });
        });
      </script>
    </div>
    <div>
      <button class="post-location-btn btn btn-self" id="postlocation">Post</button>
      <button class="cancel-location-btn btn" id="cancelpostlocation">Cancel</button>
    </div>
  </form>
</div>
`;

var longitude;
var latitude;

function addPostLocation() {
  $('#content').empty();
  let k = ejs.render(postLocationTemplate);
  $('#content').append(k);
  bindPostLocation();
  bindCancelLocation();
}

function bindPostLocation() {
  $('#content').on('click', '#locationform #postlocation',function(e) {
    e.preventDefault();
    getCurrentLocation();
  })
}

function validatePost(data) {
  return validateNullPost(data) && validateDate(data) && validateLatlng();
}

function validateNullPost(data) {
  if(data.title.length == 0 || data.startTime.length == 0 || data.endTime.length == 0) {
    $.notify({
      icon: 'glyphicon glyphicon-warning-sign',
      message: 'Input Needed!'
    }, {
      type: 'danger'
    });
    return false;
  }
  else {
    return true;
  }
}

function validateDate(data) {
  let startDate = parseInt(data.startTime.slice(6, 10)) * 10000 + parseInt(data.startTime.slice(0, 2)) * 100 + parseInt(data.startTime.slice(3, 5));
  let endDate = parseInt(data.endTime.slice(6, 10)) * 10000 + parseInt(data.endTime.slice(0, 2)) * 100 + parseInt(data.endTime.slice(3, 5));
  if(startDate > endDate) {
    $.notify({
      icon: 'glyphicon glyphicon-warning-sign',
      message: 'Wrong input date!'
    }, {
      type: 'danger'
    });
    return false;
  }
  else {
    return true;
  }
}

function validateLatlng() {
  if(latitude == null || longitude == null) {
    alert('Location is not available');
    return false;
  }
  return true;
}

function bindCancelLocation() {
  $('#content').on('click', '#locationform #cancelpostlocation',function(e) {
    e.preventDefault();
    displayMap();
  })
}

function postLocation() {
  let data = {
      "userID": sessionStorage.id,
      "title": $('#title').val(),
      "content": $('#location-content').val(),
      "startTime": $('#starttime').val(),
      "endTime": $('#endtime').val(),
      "role": $('input[name="locationRadios"]:checked').val(),
      "longitude": longitude,
      "latitude": latitude
  }
  console.log(data);
  if(validatePost(data)) {
    $.ajax({
      url: '/locations',
      type: 'POST',
      data: data,
      success:(data, status, xhr) => {
        switch(xhr.status) {
          case 200:
            displayMap();
            break;
          default:
            console.log('other success code, should not come here');
        }
      }　
    })
  }
}

function getCurrentLocation() {
  var options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0
  };

  function success(pos) {
    var crd = pos.coords;

    latitude = crd.latitude;
    longitude = crd.longitude;

    postLocation();

    console.log('Your current position is:');
    console.log(`Latitude : ${crd.latitude}`);
    console.log(`Longitude: ${crd.longitude}`);
    console.log(`More or less ${crd.accuracy} meters.`);
  };

  function error(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error, options);
  } else {
    alert("The navigator does not support getting location!");
  }


}
// To be change after testing with https.
