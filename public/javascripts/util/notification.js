function displayUnreadIndicator() {
	$('#unread-indicator').removeClass('hidden');
  $("#notification").slideDown();
}

function hideUnreadIndicator() {
	$('#unread-indicator').addClass('hidden');
}
