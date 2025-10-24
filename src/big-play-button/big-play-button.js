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
    var _flashTimeout2 = null;
    var _flashTimeout3 = null;

    // Flash the big play button briefly when play/pause is clicked
    var _flashBigPlay = function(isPlaying) {
      var isTouchDevice = $('body').hasClass('touch');

      // Only flash on desktop, not on touch devices
      if(isTouchDevice) {
        return;
      }

      // Clear all previous timeouts to prevent overlap
      clearTimeout(_flashTimeout);
      clearTimeout(_flashTimeout2);
      clearTimeout(_flashTimeout3);

      // Find the actual .big-play-container element inside $this.container
      var bigPlayContainer = $this.container.find('.big-play-container');
      var playButton = bigPlayContainer.find('.big-play-button');

      // CRITICAL: Parent must be visible for child to show!
      $this.container.css('display', 'block');

      // Completely reset to initial state first (no transition)
      bigPlayContainer.css({
        'display': 'block',
        'opacity': '0',
        'transform': 'scale(0.7)',
        'transition': 'none'
      });

      // Force reflow to ensure styles are applied
      bigPlayContainer[0].offsetHeight;

      // Invert icon: show what just happened, not current state
      // Wait a moment for normal update logic to finish, then override
      _flashTimeout3 = setTimeout(function() {
        // If now playing, show play icon (remove .pause)
        // If now paused, show pause icon (add .pause)
        if(isPlaying) {
          playButton.removeClass('pause stop');
        } else {
          playButton.addClass('pause');
        }
      }, 5);

      // Animate in: fade in while growing
      _flashTimeout = setTimeout(function() {
        bigPlayContainer.css({
          'transition': 'opacity 150ms ease-out, transform 150ms ease-out',
          'opacity': '1',
          'transform': 'scale(1)'
        });
      }, 20);

      // Hold for a moment, then fade out
      _flashTimeout2 = setTimeout(function() {
        bigPlayContainer.css({
          'opacity': '0'
        });

        // Clean up after fade out completes
        setTimeout(function() {
          $this.container.css('display', '');
          bigPlayContainer.css({
            'display': '',
            'opacity': '',
            'transform': '',
            'transition': ''
          });
          // Reset icon to correct state (will be set by normal update logic)
          if(isPlaying) {
            playButton.addClass('pause');
          } else {
            playButton.removeClass('pause');
          }
        }, 150);
      }, 420);
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
        _flashBigPlay(currentPlaying);
      }
      _lastPlayingState = currentPlaying;
    });

    return $this;
  }

);
