/*
   MODULE: BIG PLAY BUTTON
   Show a play/pause button
 */

Player.provide('big-play-button',
  {
    hideBigPlay: false,
    bigPlaySource: '',
    bigPlayPosition: 'center',
    bigPlayStyle: 'traditional',
    bigPlayForPause: false
  },
  function(Player,$,opts){
    var $this = this;
    $.extend($this, opts);

    // Get relevant settings
    Player.bind('player:settings', function(e,settings){
      PlayerUtilities.mergeSettings($this, ['hideBigPlay', 'bigPlaySource', 'bigPlayPosition', 'bigPlayStyle', 'bigPlayForPause']);
      if($this.bigPlaySource.length>0 && !/\/\//.test($this.bigPlaySource)){
        $this.bigPlaySource = Player.get('url')+$this.bigPlaySource;
        $this.bigPlayStyle = 'traditional';
      }
      $this.render();
    });

    // Update element on play, pause and more
    Player.bind('player:video:loaded player:video:loadstart player:video:play player:video:playing player:video:seeked player:video:pause player:video:ended player:action:loaded player:action:dispatched', function (e) {
      _updateBigPlay();
    });
    Player.bind('player:video:play player:video:playing player:video:seeked player:video:pause player:video:ended', function(e) {
      $this.container.find('.big-play-button').toggleClass((Player.get('isStream') ? 'stop' : 'pause'), Player.get("playing") || Player.get("seeking"))
    });
    Player.bind('player:video:progress player:video:timeupdate player:video:seeked player:video:ended', function() {
      var ct = Player.get('currentTime')
      var display = (ct > 0 ? ct : Player.get('duration'))
      $this.container.find('.current-time').text(formatTime(display))
    })

    /* GETTERS */
    Player.getter('bigPlaySource', function(){
      return $this.bigPlaySource;
    });
    Player.getter('hideBigPlay', function(){
      return $this.hideBigPlay;
    });
    Player.getter('bigPlayPosition', function(){
      return $this.bigPlayPosition;
    });
    Player.getter('bigPlayStyle', function(){
      return $this.bigPlayStyle;
    });
    Player.getter('bigPlayForPause', function(){
      return $this.bigPlayForPause;
    });
    /* SETTERS */
    Player.setter('bigPlaySource', function(bps){
      $this.bigPlaySource = bps;
      $this.render();
    });
    Player.setter('hideBigPlay', function(hbp){
      $this.hideBigPlay = hbp;
      _updateBigPlay();
    });

    function debounce(callback, delay) {
      var timer
      return function() {
        clearTimeout(timer)
        timer = setTimeout(() => {
          callback();
        }, delay)
      }
    }

    var _prevShow = false;
    var _flashTimeout = null;

    // Flash the big play button briefly when play/pause is clicked
    var _flashBigPlay = function() {
      var isTouchDevice = $('body').hasClass('touch');

      // Only flash on desktop, not on touch devices
      if(isTouchDevice) {
        console.log('Skipping flash - touch device');
        return;
      }

      // Find the actual .big-play-container element inside $this.container
      var bigPlayContainer = $this.container.find('.big-play-container');
      console.log('Flashing big play!');

      // CRITICAL: Parent must be visible for child to show!
      $this.container.css('display', 'block');

      // Force element to be visible with inline styles (bypasses all CSS)
      // Parent is already centered, so child doesn't need positioning
      bigPlayContainer.css({
        'display': 'block',
        'opacity': '1',
        'visibility': 'visible',
        'background': 'red',
        'z-index': '99999'
      });

      clearTimeout(_flashTimeout);
      _flashTimeout = setTimeout(function() {
        console.log('Hiding flash');
        // Reset both parent and child
        $this.container.css('display', '');
        bigPlayContainer.css({
          'display': '',
          'opacity': '',
          'visibility': '',
          'background': '',
          'z-index': ''
        });
      }, 600);
    };

    var _updateBigPlay = debounce(function(){
      var isTouchDevice = $('body').hasClass('touch');
      var trayShown = $('body').hasClass('tray-shown');

      // On touch devices: show big play button when tray is shown (during playback)
      // On desktop: only show at start (currentTime == 0)
      var show = (
        !$this.hideBigPlay &&
        Player.get("video_playable") &&
        !Player.get("actionsShown") &&
        (
          (isTouchDevice && trayShown) || // Touch: show with tray
          (!isTouchDevice && Player.get('currentTime')==0 && !Player.get("playing") && !Player.get("seeking")) // Desktop: show at start only
        )
      );
      if (show != _prevShow) {
        $this.container.toggle(show);
        $this.container.toggleClass("big-play-shown", show);
        _prevShow = show;
      }
    }, 50);

    // Update big play button when tray visibility changes (for touch devices)
    var _trayObserver = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.attributeName === "class") {
          _updateBigPlay();
        }
      });
    });
    _trayObserver.observe(document.body, { attributes: true });

    // Flash big play button when play/pause state changes
    var _lastPlayingState = Player.get('playing');
    var _videoHasStarted = false;

    Player.bind('player:video:play player:video:pause player:video:playing', function() {
      var currentPlaying = Player.get('playing');
      var currentTime = Player.get('currentTime');

      // Mark video as started once we're past the beginning
      if (currentTime > 0) {
        _videoHasStarted = true;
      }

      // Flash when play state changes, but not on initial load (only after video has started)
      if (currentPlaying !== _lastPlayingState && _videoHasStarted) {
        console.log('Flashing big play button - playing:', currentPlaying);
        _flashBigPlay();
      }
      _lastPlayingState = currentPlaying;
    });

    return $this;
  }

);
