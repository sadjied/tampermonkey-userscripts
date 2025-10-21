// ==UserScript==
// @name         GuruWatch: Filter + Halal & Ethisch (zonder datumfilter)
// @namespace    https://github.com/sadjied/tampermonkey-userscripts
// @version      1.8.0
// @description  Toon adviezen met "Kopen" of "Verkopen" en voeg kolommen toe voor Halal/Ethisch status.
// @match        https://www.guruwatch.nl/Adviezen/*
// @run-at       document-idle
// @downloadURL  https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js
// @updateURL    https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js
// @grant        GM_xmlhttpRequest
// @grant        GM_getResourceURL
// @connect      raw.githubusercontent.com
// @require      https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js
// @resource     sqlWasm https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm
// ==/UserScript==

(function() {
    'use strict';

    // Configuratie.
    const DB_URL = 'https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/db/stocks.sqlite?v=1';

    async function initSql() {
        // Alleen voor wasm-bestand de blob-URL gebruiken; andere files via CDN laten.
        const locateFile = (file) =>
        file === 'sql-wasm.wasm'
        ? GM_getResourceURL('sqlWasm')
        : `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`;
        return await initSqlJs({ locateFile });
    }

    // Download de .sqlite als ArrayBuffer via Tampermonkey XHR.
    function fetchDbBinary() {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: DB_URL,
                responseType: 'arraybuffer',
                onload: (res) => {
                    if (res.status >= 200 && res.status < 300 && res.response) {
                        resolve(new Uint8Array(res.response));
                    } else {
                        console.error('DB download failed:', res.status, res.statusText);
                        reject(new Error('DB download failed'));
                    }
                },
                onerror: (e) => { console.error('DB XHR error', e); reject(e); }
            });
        });
    }
    // sql.js-module.
    let sql;
    // Geopende database in memory.
    let db;

    async function loadDatabaseOnce() {
        if (db) return db;
        sql = sql || await initSql();
        const bin = await fetchDbBinary();
        db = new sql.Database(bin);
        return db;
    }

    // Haal de halal- en ethiekstatus op of geef null terug bij geen match.
    async function getStatusFromDb(stockName) {
        const database = await loadDatabaseOnce();
        const stmt = database.prepare('SELECT halal, ethical FROM stocks WHERE name = ?');
        stmt.bind([stockName]);
        let result = null;
        if (stmt.step()) {
            const row = stmt.getAsObject();
            result = {
                halal:   row.halal === 1 ? true : (row.halal === 0 ? false : null),
                ethical: row.ethical === 1 ? true : (row.ethical === 0 ? false : null)
            };
        }
        stmt.free();
        return result;
    }

    // Genereer HTML voor de statusindicator.
    function formatStatus(status, type) {
        if (status === true)   return `<span style="color: green;">✔️ ${type === "halal" ? "Halal" : "Ethisch"}</span>`;
        if (status === false)  return `<span style="color: red;">❌ ${type === "halal" ? "Niet-halal" : "Niet-ethisch"}</span>`;
        return `<span style="color: orange;">❓ Onbekend</span>`;
    }

    // Filter relevante rijen en vul statuskolommen aan.
    function filterRows() {
        const rows = document.querySelectorAll("tbody tr");
        if (!rows.length) return;

        rows.forEach(row => {
            const cells = row.querySelectorAll("td");
            if (cells.length < 4) return; // Onvolledige rij.

            // Aandeelnaam staat in kolom 3 (index 2).
            const stockName = cells[2].innerText.trim();
            // Advies staat in kolom 4 (index 3).
            let advice = cells[3].querySelector("span") ? cells[3].querySelector("span").innerText.trim() : cells[3].innerText.trim();

            // Pas filtering toe op basis van de geselecteerde modus.
            const rowIsRelevant = (advice === filterMode);

            if (!rowIsRelevant) {
                row.style.display = "none";
                return;
            } else {
                row.style.display = "";
                // Voeg statuskolommen slechts eenmaal toe.
                if (!row.dataset.processed) {
                    row.dataset.processed = "true";
                    (async () => {
                        let status = null;
                        try {
                            status = await getStatusFromDb(stockName);
                        } catch (e) {
                            console.error('DB query error for', stockName, e);
                        }
                        status = status || { halal: null, ethical: null };

                        const halalCell = document.createElement("td");
                        halalCell.style.fontWeight = "bold";
                        halalCell.innerHTML = formatStatus(status.halal, "halal");

                        const ethicalCell = document.createElement("td");
                        ethicalCell.style.fontWeight = "bold";
                        ethicalCell.innerHTML = formatStatus(status.ethical, "ethical");

                        row.appendChild(halalCell);
                        row.appendChild(ethicalCell);
                    })();
                }
            }
        });
    }


    const css = `
/* Algemene stijlen voor de toggle */
.toggle-switch {
    position: relative;
    display: inline-block;
    width: 140px; /* Groter voor betere tekstweergave */
    height: 40px;
}

/* Verberg de standaard checkbox */
.toggle-switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

/* Slider: de basisstijl van de switch */
.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ddd; /* Lichte achtergrond */
    transition: .4s;
    border-radius: 34px;
    box-shadow: inset 0 4px 6px rgba(0, 0, 0, 0.2); /* 3D-effect */
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 12px;
    color: white;
    text-transform: uppercase;
    padding: 0 10px;
}

/* Cirkel die beweegt bij het schakelen */
.slider:before {
    position: absolute;
    content: "";
    height: 34px;
    width: 34px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.3); /* 3D-effect */
}

/* Actieve kleur voor KOPEN */
input:checked + .slider {
    background: linear-gradient(to bottom, #4CAF50, #3e8e41); /* Groen verloop */
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3); /* 3D-effect */
}

/* Actieve kleur voor VERKOPEN */
input:not(:checked) + .slider {
    background: linear-gradient(to bottom, #007bff, #0056b3); /* Blauw verloop */
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.3); /* 3D-effect */
}

/* Cirkel verschuiven bij schakelen */
input:checked + .slider:before {
    transform: translateX(100px);
}

/* Zorgt ervoor dat de tekst correct weergegeven wordt */
.toggle-text {
    position: absolute;
    width: 100%;
    text-align: center;
    z-index: 2;
}
`;

    // Voeg de CSS toe aan de pagina.
    const styleSheet = document.createElement("style");
    styleSheet.innerText = css;
    document.head.appendChild(styleSheet);

    function createFancyToggle() {
        // Plaats een zwevende toggle voor het wisselen van modus.
        const container = document.createElement("div");
        container.id = "toggleContainer";
        container.style.position = "fixed";
        container.style.top = "10px";
        container.style.right = "10px";
        container.style.zIndex = "1000";

        const toggleSwitch = document.createElement("label");
        toggleSwitch.className = "toggle-switch";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = "toggleCheckbox";

        const slider = document.createElement("span");
        slider.className = "slider";
        const textSpan = document.createElement("span");
        textSpan.className = "toggle-text";
        textSpan.textContent = "Kopen"; // Standaardwaarde.

        toggleSwitch.appendChild(checkbox);
        toggleSwitch.appendChild(slider);
        slider.appendChild(textSpan);
        container.appendChild(toggleSwitch);
        document.body.appendChild(container);

        checkbox.addEventListener("change", () => {
            filterMode = checkbox.checked ? "Verkopen" : "Kopen";
            textSpan.textContent = filterMode;
            filterRows();
        });
    }

    // Voeg de toggle toe zodra de pagina geladen is.
    window.addEventListener("load", createFancyToggle);

    // Huidige filterstatus (standaard: "Kopen").
    let filterMode = "Kopen";

    // Voer de filterfunctie uit zodra de pagina geladen is.
    window.addEventListener("load", filterRows);

    // Houd dynamische tabelupdates in de gaten.
    const observer = new MutationObserver(() => {
        filterRows();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    function addHeaderColumns() {
        // Zoek de eerste tabel en voeg ontbrekende kolommen toe.
        const table = document.querySelector("table");
        if (!table) return;

        const thead = table.querySelector("thead");
        if (!thead) return;

        const headerRow = thead.querySelector("tr");

        // Voorkom dubbele headerkolommen.
        if (headerRow.querySelector("#halalHeader")) return;

        const halalHeader = document.createElement("td");
        halalHeader.id = "halalHeader";
        halalHeader.textContent = "Halal";
        halalHeader.style.width = "60px";  // Zelfde breedte als "Potentieel".
        halalHeader.style.textAlign = "center";
        halalHeader.className = "First"; // Zelfde stijl als de andere kolommen.

        const ethicalHeader = document.createElement("td");
        ethicalHeader.id = "ethicalHeader";
        ethicalHeader.textContent = "Ethisch";
        ethicalHeader.style.width = "70px";
        ethicalHeader.style.textAlign = "center";
        ethicalHeader.className = "Last Right"; // Zelfde stijl als de andere kolommen.

        headerRow.appendChild(halalHeader);
        headerRow.appendChild(ethicalHeader);
    }

    // Voer deze functie één keer uit bij het laden van de pagina.
    window.addEventListener("load", addHeaderColumns);

})();
