// Saves options to chrome.storage
function save_options() {
  // Get the filename to be saved
  var FileOrText = $("#FileOrText option:selected").val();
  var FileName = document.getElementById('FileName').value;

  // Does SessionDuration needs to be applied?
  var ApplySessionDuration = $("#SessionDuration option:selected").val();

  // How log should the session be valid?
  var CustomSessionDuration = document.getElementById('CustomSessionDuration').value;

  // Is DEBUG log enabled?
  var DebugLogs = $("#DebugLogs option:selected").val();

  // Get the Role_ARN's (Profile/ARNs pairs) entered by the user in the table
  var RoleArns = {};
  if (FileOrText==='file'){

    // Iterate over all added profiles in the list
    $("input[id^='profile_']").each(function (index) {
      // Replace profile_<rowId> for arn_<rowId> to be able to get value of corresponding arn input field
      var input_id_arn = $(this).attr('id').replace("profile", "arn");
      // Create key-value pair to add to RoleArns dictionary.
      // Only add it to the dict if both profile and arn are not an empty string
      if ($(this).val() != '' && $('#' + input_id_arn).val() != '') {
        RoleArns[$(this).val()] = $('#' + input_id_arn).val();
      }
    });
  }

  var LoginUrl =  document.getElementById('LoginUrl').value;
  var LogoutUrl =  document.getElementById('LogoutUrl').value;
  // Save into Chrome storage
  chrome.storage.sync.set({
    FileOrText: FileOrText,
    FileName: FileName,
    ApplySessionDuration: ApplySessionDuration,
    CustomSessionDuration: CustomSessionDuration,
    DebugLogs: DebugLogs,
    RoleArns: RoleArns,
    LoginUrl: LoginUrl,
    LogoutUrl: LogoutUrl
  }, function () {
    // Show 'Options saved' message to let user know options were saved.
    var status = document.getElementById('status');
    $("#status").removeClass("d-none");

    status.textContent = 'Options saved.';
    setTimeout(function () {
      $("#status").addClass("d-none");
      status.textContent = '';
    }, 1500);
  });

  // Notify background process of changed storage items.
  chrome.runtime.sendMessage({ action: "reloadStorageItems" }, function (response) {
    console.log(response.message);
  });
}

// Restores state using the preferences stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    // Default values
    FileName: 'credentials',
    ApplySessionDuration: 'yes',
    CustomSessionDuration: '3600',
    DebugLogs: 'no',
    FileOrText: 'text',
    RoleArns: {},
    LoginUrl: '#',
    LogoutUrl: '#'
  }, function (items) {
    // Set filename
    document.getElementById('FileName').value = items.FileName;
    // Set CustomSessionDuration
    document.getElementById('CustomSessionDuration').value = items.CustomSessionDuration;
    // Set ApplySessionDuration
    $("#SessionDuration").val(items.ApplySessionDuration);
    // Set DebugLogs
    $("#DebugLogs").val(items.DebugLogs);
    $("#FileOrText").val(items.FileOrText);
    $("#LoginUrl").val(items.LoginUrl);
    $("#LogoutUrl").val(items.LogoutUrl);
    
    showFileName();
    // Set the html for the Role ARN's Table
    $("#role_arns").html('<table><tr id="tr_header"><th>Profile</th><th>ARN of the role</th><th></th><th></th></tr></table>');
    // For each profile/ARN pair add table row (showing the profile-name and ARN)
    for (var profile in items.RoleArns) {
      if (items.RoleArns.hasOwnProperty(profile)) {
        addTableRow('#tr_header', profile, items.RoleArns[profile]);
      }
    }
    // Add a blank table row if there are now current entries (So the user can easily add a new profile/ARN pair)
    if (Object.keys(items.RoleArns).length == 0) {
      addTableRow('#role_arns table tr:last', null, null);
    }
    // Show/hide divCustomSessionDuration
    showCustomSessionDurationDiv();
  });
}

// Add a blank table row for the user to add a new profile/ARN pair
function addTableRow(previousRowJquerySelector, profile, arn) {
  // Generate random identifier for the to be added row
  var newRowId = randomId();
  $(previousRowJquerySelector).after(getTableRowHtml(newRowId, profile, arn));
  // Add eventHandlers for the newly added buttons
  $('#btn_add_' + newRowId).on("click", function () {
    addTableRow('#tr_' + newRowId, null, null);
  });
  $('#btn_del_' + newRowId).on("click", function () {
    delTableRow('#tr_' + newRowId);
  });
}

// Remove table row
function delTableRow(tableRowJquerySelector) {
  // Remove table row from the DOM including bound events
  $(tableRowJquerySelector).remove();
}

// Generate HTML for a table row of the role_arns table
function getTableRowHtml(tableRowId, profile, arn) {
  var profileValue = '';
  var arnValue = '';
  // If profile and arn are not NULL, generate HTML value attribute
  if (profile) { profileValue = 'value="' + profile + '"' };
  if (arn) { arnValue = 'value="' + arn + '"' };
  // Generate HTML for the row
  var html = '<tr id="tr_' + tableRowId + '">\
          <th><input type="text" id="profile_' + tableRowId + '" size="18" ' + profileValue + '></th> \
          <th><input type="text" id="arn_' + tableRowId + '" size="55" ' + arnValue + '></th> \
          <th><button id="btn_del_' + tableRowId + '" class="btn btn-secondary">DEL</button></th> \
          <th><button id="btn_add_' + tableRowId + '" class="btn btn-danger">ADD</button></th> \
          </tr>';
  return html;
}

function randomId() {
  return Math.random().toString(36).substr(2, 8);
}

function showCustomSessionDurationDiv() {
  const selectedValue = document.querySelector('select[name="SessionDuration"]').value;
  if (selectedValue==="yes"){
    $("#divCustomSessionDuration").show();
  } else {
    $("#divCustomSessionDuration").hide();
  }
}

function showFileName() {
  const selectedValue = document.querySelector('select[name="FileOrText"]').value;
  if (selectedValue==="text") {
    $("#FileNameDiv").hide();
    $("#divRoles").hide()
  } else {
    $("#FileNameDiv").show();
    $("#divRoles").show();
  }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
document.getElementById('SessionDuration').addEventListener('change', showCustomSessionDurationDiv);
document.getElementById('FileOrText').addEventListener('change', showFileName);