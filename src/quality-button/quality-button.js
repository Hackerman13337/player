/*
   MODULE: QUALITY BUTTON
   Handle quality switching

  Listens for:
   - player:video:qualitychange
*/

Player.provide('quality-button',
  {},
  function(Player,$,opts){
    var $this = this;
    $.extend($this, opts);
    var menuCloseTimeout = null;
    var qualityChanging = false;

    // Update UI when quality changes
    Player.bind('player:video:qualitychange', function(e){
        // Quality is changing, keep gear rotated
        clearTimeout(menuCloseTimeout);
        qualityChanging = true;

        $this.render(function(){
            $this.button = $this.container.find(".quality-button");
            $this.buttonMenu = $this.container.find(".button-menu");
            var qualityCount = Player.get('qualitiesArray').length;
            $this.button.one("mouseenter", function(){
                $this.buttonMenu.css({
                    right: ($this.buttonMenu.width()-30)/-2,
                    fontSize: $this.container.find("li").height()*qualityCount + 12
                });
            });

            // Add gear rotation animation support
            $this.container.on("mouseenter", function(){
                clearTimeout(menuCloseTimeout);
                $this.container.addClass("gear-rotating");
                $('body').addClass("quality-gear-rotating");
            });

            $this.container.on("mouseleave", function(){
                if (!qualityChanging) {
                    menuCloseTimeout = setTimeout(function(){
                        $this.container.removeClass("gear-rotating");
                        $('body').removeClass("quality-gear-rotating");
                    }, 400);
                }
            });

            // Detect clicks on quality menu items
            $this.buttonMenu.find(".button-menu-item").on("click", function(){
                qualityChanging = true;
                clearTimeout(menuCloseTimeout);
                $('body').addClass("quality-gear-rotating");
            });

            // Re-apply gear-rotating class if quality is changing
            if (qualityChanging) {
                $this.container.addClass("gear-rotating");
                $('body').addClass("quality-gear-rotating");
            }
        });
    });

    // When video starts loading after quality change, rotate gear back
    Player.bind('player:video:loadstart player:video:playing', function(e){
        if (qualityChanging) {
            if ($this.container) {
                $this.container.removeClass("gear-rotating");
            }
            $('body').removeClass("quality-gear-rotating");
            qualityChanging = false;
        }
    });

    // Only show the button with more than a single element
    Player.getter('hasQualitySwitching', function(){return Player.get('qualitiesArray').length>1;});

    return $this;
  }
);

/* Translations for this module */
Player.translate("quality",{
    en: "Quality menu"
});
Player.translate("quality_2",{
    en: "quality. Press enter key to choose this quality."
});
