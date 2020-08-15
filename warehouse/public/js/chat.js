var socket = io();
var messages = document.getElementById("messages");

let selectedFriendId = null;
let friends = [];
var _messages = [];

(function () {
  $("#chatWindow").hide();
  $(document).ready(function () {
    $('#logout').on('click', function () {
      // Cookies.remove('jwt');
      logOut();
      // removeAllcookies();
    });
  });


  socket.on("onlineUsers", data => {
    $("#users").empty();
    data = data.filter(x => x.socketId != socket.id);
    if (data.length == 0) {
      // $("#users").text("No users active")
    }
    friends.map(x => {
      x.online = data.some(y => y.userId == x.id)
    });
    bindUserStatus();
  });

  socket.on("receiveMessage", data => {
    console.log(data)
    bindMessage(data);
  });


  socket.on("loadMessages", data => {
    _messages = data;
    for (var i = 0; i < _messages.length; i++) {
      bindMessage(_messages[i])
    }
  });

  $("#users").on('click', 'button', function () {
    let _friend = $(this).attr('value');
    _friend = JSON.parse(_friend);
    selectedFriendId = _friend.id;
    $("#chatWindow").show();
    getSelectedFriendMessages(selectedFriendId)
  })

  getMyUsers();

  $("form").submit(function (e) {
    let li = document.createElement("li");
    e.preventDefault(); // prevents page reloading
    let _data = {
      senderId: selectedFriendId,
      message: $("#message").val()
    }
    socket.emit("sendMessage", _data);

    messages.appendChild(li).append($("#message").val());
    let span = document.createElement("span");
    messages.appendChild(span).append("by " + "Me" + ": " + "just now");

    $("#message").val("");

    return false;
  });

})();



function logOut() {
  $.ajax({
    url: "/api/chat/auth/logout",
    type: 'get',
    contentType: 'application/json',
    success: function (data) {
      if (data.status)
        window.location = "chatlogin.html?loggedOut=true";
    }
  });
}

function bindMessage(data) {
  let div = document.createElement("div");

  let li = document.createElement("li");
  messages.appendChild(li).append(data.message);
  let span = document.createElement("span");
  let name = null;
  if (friends.some(x => x.id == data.sender_id)) {
    let friend = friends.find(x => x.id == data.sender_id);
    name = `${friend.f_name} ${friend.l_name}`
  }
  else {
    name = "You";
  }
  let time = new Date(data.created_on);
  let _timeDate = `${time.getHours()}: ${time.getMinutes()}`;
  messages.appendChild(span).append("by " + name + ": " + _timeDate);
}

function getSelectedFriendMessages(friendId) {
  socket.emit("getMyMessages", {
    senderId: friendId
  });
}

function getMyUsers() {
  $("#users").html("");
  $.ajax({
    url: "/api/chat/users",
    dataType: 'json',
    type: 'get',
    contentType: 'application/json',
    success: function (res) {
      friends = res.data;
      friends.map(x => {
        x.online = false
      });
      // bindUserStatus();
    },
    error: function (res, status) {
      console.log(res, status);
      if (res.status == 401) {
        removeAllcookies();
        // window.location = "login.html"
      }
    }
  });
}

function bindUserStatus() {
  $("#users").empty();
  for (let i = 0; i < friends.length; i++) {
    let _status = friends[i].online ? 'Online ' : 'Offline ';
    let _button = $('<button/>', {
      text: _status + friends[i].f_name + friends[i].l_name,
      id: 'btn_refresh',
      class: _status,
      disabled: !friends[i].online,
      value: JSON.stringify(friends[i])
    });
    $("#users").append(_button);
    $("#users").append('<br />');
  }
  console.log('updated users and profile')
}






