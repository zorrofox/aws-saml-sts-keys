// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// On load of popup
document.addEventListener('DOMContentLoaded', function() {
  // On load of the popup screen check in Chrome's storage if the
  // 'SAML to AWS STS Keys' function is in a activated state or not.
  // Default value is 'activated'
  chrome.storage.sync.get({
    Activated: true
  }, function(items) {
    document.getElementById('chkboxactivated').checked = items.Activated;
  });

  chrome.storage.sync.get({
    AccessKeyConetent: ""
  }, function(items) {
    document.getElementById('chkboxoutputtext').value = items.AccessKeyConetent;
  });

  chrome.storage.sync.get({
    FileOrText: "text"
  }, function(items) {
    chkboxOutputChange(items.FileOrText==='text');
  });

  chrome.storage.sync.get({
    LoginUrl: "#"
  }, function(items) {
    document.getElementById('login').setAttribute("href", items.LoginUrl);
  });

  chrome.storage.sync.get({
    LogoutUrl: "#"
  }, function(items) {
    document.getElementById('logout').setAttribute("href", items.LogoutUrl);
  });

  // Add event handler to checkbox
  document.getElementById('chkboxactivated').addEventListener('change', chkboxChangeHandler);
  document.getElementById("copy").addEventListener("click", triggerExample);
});



function chkboxChangeHandler(event) {
  var checkbox = event.target;
  // Save checkbox state to chrome.storage
  chrome.storage.sync.set({ Activated: checkbox.checked });
  chrome.storage.sync.set({ AccessKeyConetent: "" });
  // Default action for background process
  var action = "removeWebRequestEventListener";
  // If the checkbox is checked, an EventListener needs to be started for
  // webRequests to signin.aws.amazon.com in the background process
  if (checkbox.checked) {
    action = "addWebRequestEventListener";
  }
  chrome.runtime.sendMessage({action: action}, function(response) {
    console.log(response.message);
  });
}


function chkboxOutputChange(checked) {
  if (checked){
    document.getElementById("outputlabel").style.visibility = "visible";
    document.getElementById("chkboxoutputtext").style.visibility = "visible";
    document.getElementById("copy").style.visibility = "visible";
  } else {
    document.getElementById("outputlabel").style.visibility = "hidden";
    document.getElementById("chkboxoutputtext").style.visibility = "hidden";
    document.getElementById("copy").style.visibility = "hidden";
  }
}

function triggerExample() {
  const element = document.querySelector('#chkboxoutputtext');
  element.select();
  element.setSelectionRange(0, 99999);
  document.execCommand('copy');
}