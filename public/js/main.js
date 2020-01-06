(function () {
    /**
     * Obtains parameters from the hash of the URL
     * @return Object
     */
    function getHashParams() {
        var hashParams = {};
        var e, r = /([^&;=]+)=?([^&;]*)/g,
            q = window.location.hash.substring(1);
        while (e = r.exec(q)) {
            hashParams[e[1]] = decodeURIComponent(e[2]);
        }
        return hashParams;
    }

    function getDiviceId(devices) {
        var result = devices.filter(device => device.name === "MacBook Pro de Blas")[0]
        return result.id
    }

    window.testPlayList = function() {
        iniciarPlaylist(access_token)
    } 

    function iniciarPlaylist(access_token) {
        $.ajax({
            url: 'https://api.spotify.com/v1/me/player/devices',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: function (response) {
                console.log('devices', response.devices)
                var deviceId = getDiviceId(response.devices)
                $.ajax({
                    method: "PUT",
                    url: 'https://api.spotify.com/v1/me/player/play?device_id=' + deviceId,
                    headers: {
                        'Authorization': 'Bearer ' + access_token
                    },
                    contentType: 'application/json',
                    data: JSON.stringify({
                        "context_uri": uriPlaylist,
                        "offset": {
                            "position": 0
                        },
                        "position_ms": 0
                    }),
                    success: function (response) {
                        showRadio()
                    }
                });
            }
        });
    }

    function fixTime(time) {
        if(time < 10) {
            time = '0' + time
        } else {
            time = '' + time
        }
        return time
    }

    function activeCountdown() {
        var countdown = $('#countdown');
        countdown.show();
        var timer = setInterval(function() {
            var dt = new Date();
            var current = {
                hours : fixTime(dt.getHours()),
                minutes : fixTime(dt.getMinutes()),
                seconds : fixTime(dt.getSeconds())
            }

            countdown.find('.hours').text(current.hours)
            countdown.find('.minutes').text(current.minutes)
            countdown.find('.seconds').text(current.seconds)

            if(JSON.stringify(current) === JSON.stringify(timeRadio) ) {
                // clearInterval(timer);
                iniciarPlaylist()
            }
            if(JSON.stringify(current) === JSON.stringify(timeSaludo) ) {
                showSaludo()
            }
          }, 1000);
    }

    function showSaludo() {
        $('#countdown').hide()
        $('#alert-saludo').show()
    }

    function showRadio() {
        $('#alert-radio').show();
    }

    var userProfileSource = document.getElementById('user-profile-template').innerHTML,
        userProfileTemplate = Handlebars.compile(userProfileSource),
        userProfilePlaceholder = document.getElementById('user-profile');

    var oauthSource = document.getElementById('oauth-template').innerHTML,
        oauthTemplate = Handlebars.compile(oauthSource),
        oauthPlaceholder = document.getElementById('oauth');

    var params = getHashParams();

    var access_token = params.access_token,
        refresh_token = params.refresh_token,
        error = params.error;

    var uriPlaylist = "spotify:playlist:0GfXEJes7BQCK8bHQDK96Q"

    
    var timeSaludo = {
        hours: "00",
        minutes: "00",
        seconds: "00"
    }
    
    var timeRadio = {
        hours: "00",
        minutes: "05",
        seconds: "00"
    }

    $('#loggedin').hide();
    $('#countdown').hide();
    $('#alert-radio').hide();
    $('#alert-saludo').hide();

    if (error) {
        alert('There was an error during the authentication');
    } else {
        if (access_token) {
            // render oauth info
            oauthPlaceholder.innerHTML = oauthTemplate({
                access_token: access_token,
                refresh_token: refresh_token
            });

            $.ajax({
                url: 'https://api.spotify.com/v1/me',
                headers: {
                    'Authorization': 'Bearer ' + access_token
                },
                success: function (response) {
                    userProfilePlaceholder.innerHTML = userProfileTemplate(response);
                    $('#login').hide();
                    // $('#loggedin').show();
                    setInterval(function() {
                        $('#obtain-new-token').trigger("click")
                    }, 1000 * 60 * 30)
                }
            });
            
            activeCountdown()
            // showSaludo()
            // iniciarPlaylist(access_token)
        } else {
            // render initial screen
            $('#login').show();
            $('#loggedin').hide();
            $('#countdown').hide();
            $('#alert-radio').hide();
            $('#alert-saludo').hide();
        }

        document.getElementById('obtain-new-token').addEventListener('click', function () {
            $.ajax({
                url: '/refresh_token',
                data: {
                    'refresh_token': refresh_token
                }
            }).done(function (data) {
                console.log('new token')
                access_token = data.access_token;
                oauthPlaceholder.innerHTML = oauthTemplate({
                    access_token: access_token,
                    refresh_token: refresh_token
                });
            });
        }, false);
    }
})();