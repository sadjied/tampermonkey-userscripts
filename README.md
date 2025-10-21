# Tampermonkey Userscripts

Verzameling Tampermonkey (v5.3.3 voor Chrome) userscripts.  
Momenteel bevat dit repo:
- **GuruWatch – Filter + Halal & Ethisch**: toont alleen adviezen “Kopen/Verkopen” en voegt Halal/Ethisch kolommen toe.

## Installatie
1. Installeer [Tampermonkey](https://www.tampermonkey.net/).
2. Open de ruwe script-URL hieronder en klik **Install**.

### GuruWatch – Filter + Halal & Ethisch
- **Download/Install**: `https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js`
- Vereist: `lib/stock-status.js` (wordt via `@require` geladen)

## Auto-updates
Het script bevat `@downloadURL` en `@updateURL` die wijzen naar dit repo, zodat Tampermonkey automatisch kan updaten.

## Licentie
MIT
