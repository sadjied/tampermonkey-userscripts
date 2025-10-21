// ==UserScript==
// @name         GuruWatch: Filter + Halal & Ethisch (zonder datumfilter)
// @namespace    https://github.com/sadjied/tampermonkey-userscripts
// @version      1.7
// @description  Toon adviezen met "Kopen" of "Verkopen" en voeg kolommen toe voor Halal/Ethisch status.
// @match        https://www.guruwatch.nl/Adviezen/Default.aspx
// @grant        none
// @downloadURL  https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js
// @updateURL    https://raw.githubusercontent.com/sadjied/tampermonkey-userscripts/main/guruwatch-halal-ethics.user.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    /**
     * Gecombineerde dictionary met statusinformatie per aandeel.
     * Mogelijke waarden:
     *   - Voor halal: "true", "false"
     *   - Voor ethisch: "true", "false"
     */
    const STOCK_STATUS = {
        "Flow Traders": { halal: false, ethical: false },
        "TINC": { halal: false, ethical: false },
        "Xior": { halal: false, ethical: false },
        "X-FAB": { halal: true, ethical: false },
        "bpost": { halal: false, ethical: false },
        "ENTAIN PLC EO-,01": { halal: false, ethical: false },
        "Air France-KLM": { halal: false, ethical: false },
        "CTP":  { halal: false, ethical: false },
        "Land Securities Group PLC": { halal: false, ethical: false },
        "HAL Trust": { halal: false, ethical: false },
        "Recticel": { halal: true, ethical: true },
        "Eurocommercial Properties": { halal: false, ethical: false },
        "NEXTENSA": { halal: false, ethical: false },
        "CFE": { halal: false, ethical: false },
        "Compagnie du Bois Sauvage": { halal: false, ethical: false },
        "TKH": { halal: false, ethical: false },
        "Retail Estates": { halal: false, ethical: false },
        "Van de Velde": { halal: true, ethical: true },
        "Agfa-Gevaert": { halal: false, ethical: false },
        "Kendrion": { halal: false, ethical: false },
        "Corbion": { halal: false, ethical: false },
        "Amgen": { halal: false, ethical: false },
        "Walt Disney Company (The)": { halal: false, ethical: false },
        "ADMIRAL GROUP PLC LS-,001": { halal: false, ethical: false },
        "PENNON GROUP NEW LS-,6105": { halal: false, ethical: false },
        "UNITED UTILITIES GRP": { halal: false, ethical: false },
        "IBA": { halal: true, ethical: true },
        "Deceuninck": { halal: false, ethical: false },
        "Lotus Bakeries": { halal: true, ethical: true },
        "INTERTEK GROUP LS-,01": { halal: true, ethical: true },
        "Miko": { halal: false, ethical: false },
        "BAM": { halal: false, ethical: false },
        "RIO TINTO PLC LS-,10": { halal: true, ethical: false },
        "VISA": { halal: true, ethical: false },
        "Cofinimmo": { halal: false, ethical: false },
        "INVENTIVA PROM": { halal: false, ethical: false },
        "Materialise NV": { halal: false, ethical: false },
        "Qrf": { halal: false, ethical: false },
        "BESI": { halal: false, ethical: false },
        "SHURGARD": { halal: false, ethical: false },
        "HEIJMANS KON": { halal: false, ethical: false },
        "ALLFUNDS GROUP": { halal: false, ethical: false },
        "Schneider Electric": { halal: true, ethical: true },
        "LONDON STOCK EXCHANGE": { halal: false, ethical: false },
        "AIRBUS": { halal: false, ethical: false },
        "Renault": { halal: false, ethical: false },
        "Apple": { halal: true, ethical: false },
        "TOTALENERGIES": { halal: false, ethical: false },
        "SHELL PLC B EO-07": { halal: false, ethical: false },
        "VGP": { halal: false, ethical: false },
        "PROSUS": { halal: false, ethical: false },
        "NN Group": { halal: false, ethical: false },
        "ING": { halal: false, ethical: false },
        "Fagron": { halal: true, ethical: true },
        "Kinepolis": { halal: false, ethical: false },
        "SBM Offshore": { halal: false, ethical: false },
        "GLENCORE PLC DL -,01": { halal: false, ethical: false },
		"CAPGEMINI": { halal: true, ethical: false },
		"ASTRAZENECA PLC DL-,25": { halal: true, ethical: false },
		"E.ON SE NA O.N.": { halal: false, ethical: false },
		"National Grid PLC": { halal: false, ethical: false },
		"STMicroelectronics": { halal: true, ethical: false },
		"VINCI": { halal: false, ethical: false },
		"Nike": { halal: true, ethical: false },
		"Johnson & Johnson": { halal: true, ethical: false },
		"HSBC HLDGS PLC DL-,50": { halal: false, ethical: false },
		"Coca-Cola Company": { halal: true, ethical: false },
		"Gimv": { halal: false, ethical: false },
		"Ageas": { halal: false, ethical: false },
		"Ahold Delhaize": { halal: false, ethical: false },
		"Philips Koninklijke": { halal: false, ethical: false },
		"UCB": { halal: true, ethical: true },
		"Aegon": { halal: false, ethical: false },
		"AZELIS GROUP": { halal: false, ethical: false },
		"GBL": { halal: false, ethical: false },
        "Aedifica": { halal: false, ethical: false },
        "Ontex": { halal: false, ethical: false },
        "EVS": { halal: true, ethical: false},
        "ASR Nederland": { halal: false, ethical: false },
        "Euronext": { halal: false, ethical: false },
        "UNILEVER PLC": { halal: true, ethical: false },
        "ADYEN NV": { halal: false, ethical: false },
        "DSM FIRMENICH AG": { halal: true, ethical: true},
        "KBC Groep": { halal: false, ethical: false },
        "Umicore": { halal: false, ethical: false },
		"RELX PLC LS -,144397": { halal: true, ethical: true},
		"Coca-ColaEuropacif": { halal: false, ethical: false },
		"RECKITT BENCK.GRP LS -,10": { halal: true, ethical: false },
		"MERCEDES-BENZ GRP NA O.N.": { halal: false, ethical: false },
		"Walmart": { halal: false, ethical: false },
		"VESTAS WIND SYS. DK -,20": { halal: false, ethical: false },
		"Hermès International": { halal: true, ethical: true},
		"BNP Paribas": { halal: false, ethical: false },
		"BARCLAYS PLC LS 0,25": { halal: false, ethical: false },
		"Air Liquide": { halal: true, ethical: true},
		"AVIVA PLC LS-,33": { halal: false, ethical: false },
        "AB InBev": { halal: false, ethical: false },
        "Pernod Ricard": { halal: false, ethical: false },
        "DIAGEO PLC LS-,28935185": { halal: false, ethical: false },
        "ESSILORLUXOTTICA": { halal: false, ethical: false },
        "ROLLS ROYCE HLDGS LS 0.20": { halal: false, ethical: false },
        "VOLKSWAGEN AG VZO O.N.": { halal: false, ethical: false },
        "Sanofi": { halal: true, ethical: false },
        "Goldman Sachs Group": { halal: false, ethical: false },
        "Microsoft Corp": { halal: false, ethical: false },
        "RENTOKIL INITIAL  LS 0,01": { halal: false, ethical: false },
        "JUST EAT TAKEAWAY": { halal: false, ethical: false },
        "NYXOAH": { halal: false, ethical: false },
        "IMCD": { halal: true, ethical: false },
        "Pharming": { halal: false, ethical: false },
        "Heineken": { halal: false, ethical: false },
        "Vopak": { halal: false, ethical: false },
        "OCI": { halal: false, ethical: false },
        "D'IETEREN GROUP": { halal: true, ethical: true},
        "RELX PLC      LS -,144397": { halal: true, ethical: false },
        "Netflix": { halal: false, ethical: false },
        "Alphabet": { halal: false, ethical: false },
        "Kering": { halal: false, ethical: false },
        "BAY.MOTOREN WERKE AG ST": { halal: false, ethical: false },
        "JPMorgan Chase & Co": { halal: false, ethical: false },
        "PERSIMMON PLC      LS-,10": { halal: true, ethical: false },
        "AVIVA PLC          LS-,33": { halal: false, ethical: false },
        "HYLORIS": { halal: false, ethical: false },
        "Elia": { halal: false, ethical: false },
        "arGEN-X": { halal: false, ethical: false },
        "EKOPAK": { halal: true, ethical: true},
        "McDonald's Corp": { halal: false, ethical: false },
        "Tesla": { halal: true, ethical: true},
        "ASTRAZENECA PLC    DL-,25": { halal: true, ethical: false},
        "Salesforce": { halal: true, ethical: false},
        "Airbus": { halal: false, ethical: false },
        "SEQUANA MEDICAL": { halal: false, ethical: false },
        "Sif Holding": { halal: false, ethical: false },
        "BIOTALYS": { halal: false, ethical: false },
        "Avantium": { halal: false, ethical: false },
        "MONTEA": { halal: false, ethical: false },
        "Solvay": { halal: false, ethical: false },
        "Engie": { halal: false, ethical: false },
        "Starbucks Corp": { halal: true, ethical: false },
        "SHELL PLC         B EO-07": { halal: false, ethical: false },
        "RIO TINTO PLC      LS-,10": { halal: true, ethical: false },
        "Pfizer Inc": { halal: false, ethical: false },
        "IMPERIAL BRANDS PLC LS-10": { halal: false, ethical: false },
        "Crédit Agricole": { halal: false, ethical: false },
        "Boeing Company": { halal: false, ethical: false },
        "Michelin": { halal: false, ethical: false },
        "Danone": { halal: false, ethical: false },
        "PRUDENTIAL PLC LS-,05": { halal: false, ethical: false },
        "RWE AG INH O.N.": { halal: false, ethical: false },
        "SAP SE O.N.": { halal: true, ethical: false },
        "BUNZL PLC LS-,3214857": { halal: false, ethical: false },
        "LVMH": { halal: false, ethical: false },
        "Wolters Kluwer": { halal: true, ethical: true },
        "Arcadis": { halal: true, ethical: true },
        "CVC CAPITAL": { halal: false, ethical: false },
        "Alfen N.V.": { halal: true, ethical: true },
        "Brederode": { halal: false, ethical: false },
        "JDE PEET'S": { halal: false, ethical: false },
        "SAINSBURY-J.- LS-28571428": { halal: false, ethical: false },
        "L'OREAL": { halal: true, ethical: false },
        "Safran": { halal: true, ethical: false },
        "Saint-Gobain": { halal: false, ethical: false },
        "Tubize (Fin.de)": { halal: false, ethical: false },
        "Accor": { halal: false, ethical: false },
        "Home Depot": { halal: true, ethical: false },
        "ABN AMRO BANK N.V.": { halal: false, ethical: false },
        "LLOYDS BKG GRP LS-,10": { halal: false, ethical: false },
        "Greenyard": { halal: false, ethical: false },
        "ArcelorMittal": { halal: false, ethical: false },
        "ASML": { halal: true, ethical: true },
        "Tessenderlo": { halal: true, ethical: true },
        "Alstom": { halal: false, ethical: false },
        "SMITHS GROUP PLC LS -,375": { halal: true, ethical: true },
        "OCADO GROUP PLC LS -,02": { halal: false, ethical: false },
        "BAYER AG NA O.N.": { halal: false, ethical: false },
        "SYENSQO": { halal: false, ethical: false },
        "ONWARD MEDICAL": { halal: false, ethical: false },
        "Sofina": { halal: false, ethical: false },
        "EXOR NV": { halal: false, ethical: false },
        "RENTOKIL INITIAL LS 0,01": { halal: false, ethical: false },
        "BURBERRY GROUP LS-,0005": { halal: false, ethical: false },
        "DEME GROUP": { halal: true, ethical: true },
        "Alibaba Group Holding Limited": { halal: false, ethical: false },
        "WHITBREAD LS -,76797385": { halal: false, ethical: false },
        "ADECCO N": { halal: false, ethical: false },
        "COCA-COLA HBC NA.SF 6,70": { halal: false, ethical: false },
        "Barco": { halal: false, ethical: false },
        "ASMI": { halal: true, ethical: true },
        "AXA": { halal: false, ethical: false },
        "TESCO PLC LS-,0633333": { halal: false, ethical: false },
        "Amazon.com": { halal: false, ethical: false },
        "Meta Platforms": { halal: false, ethical: false },
        "Vodafone Group PLC": { halal: false, ethical: false },
        "INPOST": { halal: true, ethical: true },
        "Ackermans & v.H": { halal: false, ethical: false },
        "Floridienne": { halal: false, ethical: false },
        "Nokia": { halal: false, ethical: false },
        "INTERN.CONS.AIRL.GR.": { halal: false, ethical: false },
        "Verizon Communications": { halal: false, ethical: false },
        "SHELL PLC": { halal: false, ethical: false },
        "Akzo Nobel": { halal: false, ethical: false },
        "BP PLC DL-,25": { halal: false, ethical: false },
        "WHAT''S COOKING GP": { halal: false, ethical: false },
        "Basic-Fit": { halal: false, ethical: false },
        "GSK PLC LS-,3125": { halal: false, ethical: false },
        "Immobel": { halal: false, ethical: false },
        "STELLANTIS NV": { halal: false, ethical: false },
        "Procter & Gamble Company": { halal: true, ethical: false },
        "WDP": { halal: false, ethical: false },
        "Aperam": { halal: false, ethical: false },
        "Caterpillar": { halal: true, ethical: false },
        "Exxon Mobil Corp": { halal: true, ethical: true },
        "Publicis Groupe": { halal: false, ethical: false },
        "THEON INTERNAT": { halal: false, ethical: false },
        "Fugro": { halal: true, ethical: true },
        "FASTNED": { halal: false, ethical: false },
        "NSI": { halal: false, ethical: false },
        "CM.COM": { halal: false, ethical: false },
        "Dassault Systèmes": { halal: true, ethical: false },
        "NESTLE N": { halal: false, ethical: false },
        "KPN": { halal: false, ethical: false },
        "Chevron Corp": { halal: true, ethical: false },
        "Société Générale": { halal: false, ethical: false },
        "Thales": { halal: false, ethical: false },
        "Colruyt": { halal: false, ethical: false },
        "Proximus": { halal: false, ethical: false },
        "NEXT PLC LS 0,10": { halal: false, ethical: false },
        "BRIT.AMER.TOBACCO LS-,25": { halal: false, ethical: false },
        "Galapagos": { halal: false, ethical: false },
        "UNIBAIL-RODAMCO-WESTFIELD": { halal: false, ethical: false },
        "Bouygues": { halal: false, ethical: false },
        "Unitedhealth Group": { halal: false, ethical: false },
        "Care Property Invest": { halal: false, ethical: false },
        "Cisco Systems": { halal: true, ethical: false },
        // Voeg hier meer aandelen toe
    };
    /**
     * Zet een status om in HTML met bijpassend icoon en kleur.
     * @param {string} status - De status, bv. "halal", "niet-halal" of "onbekend"
     * @param {string} type - "halal" of "ethical"
     * @returns {string} HTML-code met icoon en tekst
     */
function formatStatus(status, type) {
    if (status === true) {
        return `<span style="color: green;">✔️ ${type === "halal" ? "Halal" : "Ethisch"}</span>`;
    } else if (status === false) {
        return `<span style="color: red;">❌ ${type === "halal" ? "Niet-halal" : "Niet-ethisch"}</span>`;
    } else {
        return `<span style="color: orange;">❓ Onbekend</span>`;
    }
}

    /**
     * Doorloopt de tabelrijen, filtert op advies ("Kopen" of "Verkopen")
     * en voegt extra kolommen toe voor de gecombineerde status.
     */
function filterRows() {
    const rows = document.querySelectorAll("tbody tr");
    if (!rows.length) return;

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 4) return; // onvolledige rij

        // Aandeelnaam in kolom 3 (index 2)
        const stockName = cells[2].innerText.trim();
        // Advies in kolom 4 (index 3)
        let advice = cells[3].querySelector("span") ? cells[3].querySelector("span").innerText.trim() : cells[3].innerText.trim();

        // Pas filtering aan op basis van de geselecteerde modus
        const rowIsRelevant = (advice === filterMode);

        if (!rowIsRelevant) {
            row.style.display = "none";
            return;
        } else {
            row.style.display = "";
            // Controleer of de extra kolommen al aanwezig zijn
            if (!row.dataset.processed) {
                row.dataset.processed = "true"; // Markeer rij als verwerkt

                const status = STOCK_STATUS[stockName] || { halal: "onbekend", ethical: "onbekend" };

                // (1) Halal-kolom
                const halalCell = document.createElement("td");
                halalCell.style.fontWeight = "bold";
                halalCell.innerHTML = formatStatus(status.halal, "halal");
                row.appendChild(halalCell);

                // (2) Ethisch-kolom
                const ethicalCell = document.createElement("td");
                ethicalCell.style.fontWeight = "bold";
                ethicalCell.innerHTML = formatStatus(status.ethical, "ethical");
                row.appendChild(ethicalCell);
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

// Voeg de CSS toe aan de pagina
const styleSheet = document.createElement("style");
styleSheet.innerText = css;
document.head.appendChild(styleSheet);

function createFancyToggle() {
    const container = document.createElement("div");
    container.id = "toggleContainer";
    container.style.position = "fixed";
    container.style.top = "10px";
    container.style.right = "10px";
    container.style.zIndex = "1000";

    // Toggle switch container
    const toggleSwitch = document.createElement("label");
    toggleSwitch.className = "toggle-switch";

    // De eigenlijke input (checkbox)
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = "toggleCheckbox";

    // Slider + Tekst
    const slider = document.createElement("span");
    slider.className = "slider";
    const textSpan = document.createElement("span");
    textSpan.className = "toggle-text";
    textSpan.textContent = "Kopen"; // Default waarde

    // Elementen in elkaar zetten
    toggleSwitch.appendChild(checkbox);
    toggleSwitch.appendChild(slider);
    slider.appendChild(textSpan);
    container.appendChild(toggleSwitch);
    document.body.appendChild(container);

    // Event listener voor de toggle
    checkbox.addEventListener("change", () => {
        filterMode = checkbox.checked ? "Verkopen" : "Kopen";
        textSpan.textContent = filterMode;
        filterRows();
    });
}

// Voeg de fancy toggle toe zodra de pagina geladen is
window.addEventListener("load", createFancyToggle);

// Huidige filterstatus (default: "Kopen")
let filterMode = "Kopen";

    // Voer de filterfunctie uit zodra de pagina geladen is
    window.addEventListener("load", filterRows);

    // Gebruik een MutationObserver zodat dynamische updates ook gefilterd worden
    const observer = new MutationObserver(() => {
        filterRows();
    });
    observer.observe(document.body, { childList: true, subtree: true });

function addHeaderColumns() {
    const table = document.querySelector("table"); // Pak de eerste tabel op de pagina
    if (!table) return;

    const thead = table.querySelector("thead");
    if (!thead) return;

    const headerRow = thead.querySelector("tr");

    // Check of de extra kolommen al bestaan
    if (headerRow.querySelector("#halalHeader")) return;

    // Maak de kolomkop voor Halal
    const halalHeader = document.createElement("td");
    halalHeader.id = "halalHeader";
    halalHeader.textContent = "Halal";
    halalHeader.style.width = "60px";  // Zelfde breedte als "Potentieel"
    halalHeader.style.textAlign = "center";
    halalHeader.className = "First"; // Zelfde stijl als de andere kolommen

    // Maak de kolomkop voor Ethisch
    const ethicalHeader = document.createElement("td");
    ethicalHeader.id = "ethicalHeader";
    ethicalHeader.textContent = "Ethisch";
    ethicalHeader.style.width = "70px";
    ethicalHeader.style.textAlign = "center";
    ethicalHeader.className = "Last Right"; // Zelfde stijl als de andere kolommen

    // Voeg de kolommen toe aan de header
    headerRow.appendChild(halalHeader);
    headerRow.appendChild(ethicalHeader);
}

// Voer deze functie één keer uit bij het laden van de pagina
window.addEventListener("load", addHeaderColumns);

})();
