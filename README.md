# GuruWatch – Filter + Halal & Ethisch

## Waarom gebruiken?
Krijg direct inzicht in halal- en ethiekstatus bij adviezen op GuruWatch zonder handmatig te filteren of extra bronnen te raadplegen.

## Belangrijkste features
- Toont uitsluitend adviezen met de status "Kopen" of "Verkopen" via een interactieve toggle.
- Voegt halal- en ethiekkolommen toe met duidelijke kleur-icoonindicaties.
- Haalt statusinformatie live op uit een beheerde SQLite-database voor actuele gegevens.
- Houdt tabellen automatisch synchroon dankzij een MutationObserver.

## Controle en criteria
- Halal-status wordt per nieuw aandeel handmatig getoetst via [Muslim Xchange](https://muslimxchange.com/), [Zoya](https://zoya.finance/) en [Musaffa](https://musaffa.com/).
- Ethische beoordeling volgt deze richtlijnen:
  - NIET pro-occupatie zijn.
  - NIET Israël steunen (direct of indirect).
  - NIET actief zijn in Israël of de bezette Palestijnse gebieden.
  - NIET op andere gronden als onethisch verantwoord worden aangemerkt.

> Let op: gebruik de database niet blindelings. Voer altijd eigen controle uit en deel nieuwe inzichten zodat de gegevens actueel blijven.

## Installatie / snelstart
1. Installeer [Tampermonkey](https://www.tampermonkey.net/) in je browser.
2. Open `https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js` en klik op **Install**.
3. Controleer dat het script ingeschakeld is binnen Tampermonkey.

## Gebruik
1. Bezoek `https://www.guruwatch.nl/Adviezen/`.
2. Kies bovenaan rechts de gewenste adviessoort via de toggle (standaard: "Kopen").
3. Bekijk per aandeel de halal- en ethiekstatus in de extra kolommen.

## Licentie
MIT
