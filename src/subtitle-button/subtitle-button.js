/*
   MODULE: SUBTITLE BUTTON
   Handle subtitle button

  Listens for:
   - player:subtitlechange
*/

Player.provide('subtitle-button',
  {},
  function(Player,$,opts){
    var $this = this;
    $.extend($this, opts);

    // Swedish language name translations
    var languageTranslations = {
      'English': 'Engelska',
      'Swedish': 'Svenska',
      'Spanish': 'Spanska',
      'French': 'Franska',
      'German': 'Tyska',
      'Italian': 'Italienska',
      'Portuguese': 'Portugisiska',
      'Dutch': 'Holländska',
      'Danish': 'Danska',
      'Norwegian': 'Norska',
      'Finnish': 'Finska',
      'Polish': 'Polska',
      'Russian': 'Ryska',
      'Chinese': 'Kinesiska',
      'Japanese': 'Japanska',
      'Korean': 'Koreanska',
      'Arabic': 'Arabiska'
    };

    // Translate language names to Swedish
    Player.getter('localesArray', function(){
      var locales = Player.get('locales') || [];
      return locales.map(function(locale){
        var translatedLanguage = languageTranslations[locale.language] || locale.language;
        return {
          locale: locale.locale,
          language: translatedLanguage
        };
      });
    });

    // Update UI when subtitle changes
    Player.bind('player:subtitlechange', function(e){
      $this.render(function(){
        $this.button = $this.container.find(".subtitle-button");
        $this.buttonMenu = $this.container.find(".button-menu");
        var localeCount = Player.get('localesArray').length;
        $this.button.one("mouseenter", function(){
          $this.buttonMenu.css({
            right: ($this.buttonMenu.width()-30)/-2,
            fontSize: $this.container.find("li").height()*(localeCount+1) + 12,
            maxHeight: $this.container.find("li").height()*4
          });
        });
      });
    });

    Player.getter('initialSubtitleAriaLabel', function(){
      var subtitleOn = Player.get('subtitleLocale') != "";
      if (subtitleOn) return "subtitle_on";
      else return "subtitle_off";
    });

    return $this;
  }
);

/* Translations for this module */
Player.translate("close_captioning",{
    en: "Closed captioning",
    sv: "Textning"
});
Player.translate("closed_captions_in",{
    en: "Closed captions in",
    sv: "Textning på"
});
Player.translate("disable_closed_captioning",{
    en: "Disable closed captioning",
    sv: "Stäng av textning"
});
Player.translate("none",{
    en: "None",
    sv: "Ingen"
});

Player.translate("subtitle_on",{
  en: "Captions button. The captions are turned on.",
  sv: "Textningsknapp. Textning är påslagen."
});
Player.translate("subtitle_off",{
  en: "Captions button. The captions are turned off.",
  sv: "Textningsknapp. Textning är avstängd."
});
