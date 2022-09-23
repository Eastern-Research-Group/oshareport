import naicsCodes from "../data/naics.json" assert { type: "json" };
import states from "../data/states.json" assert { type: "json" };

const DEBOUNCE_TIMEOUT_MS = 100;

const input = document.querySelector("#naics");
const resultsList = document.querySelector("#autocomplete-results");
const dropdownArrow = document.querySelector(".autocomplete__dropdown-arrow");
const comboBox = document.querySelector(".autocomplete__container");

let currentListItemFocused = -1;

// naicsArray = naicsCodes.NAICS;
let selectedNAICS = "";

// const naicsArray = [
//   {
//       "NAICSCode": "111110",
//       "NAICSTitle": "Soybean Farming",
//   },
//   {
//       "NAICSCode": "111120",
//       "NAICSTitle": "Oilseed (except Soybean) Farming",
//   },
//   {
//       "NAICSCode": "111130",
//       "NAICSTitle": "Dry Pea and Bean Farming",
//   },
//   {
//       "NAICSCode": "111140",
//       "NAICSTitle": "Wheat Farming",
//   },
//   {
//       "NAICSCode": "111150",
//       "NAICSTitle": "Corn Farming",
//   },
//   {
//       "NAICSCode": "111160",
//       "NAICSTitle": "Rice Farming",
//   },
//   {
//       "NAICSCode": "111191",
//       "NAICSTitle": "Oilseed and Grain Combination Farming",
//   },
//   {
//       "NAICSCode": "111199",
//       "NAICSTitle": "All Other Grain Farming",
//   },
//   {
//       "NAICSCode": "111211",
//       "NAICSTitle": "Potato Farming",
//   }
// ];

let filteredResults = [...naicsCodes.NAICS];

let isDropDownOpen = false;

function openDropdown() {
  isDropDownOpen = true;
  resultsList.classList.add("visible");
  dropdownArrow.classList.add("expanded");
  comboBox.setAttribute("aria-expanded", "true");
}

function closeDropdown() {
  isDropDownOpen = false;
  resultsList.classList.remove("visible");
  dropdownArrow.classList.remove("expanded");
  comboBox.setAttribute("aria-expanded", "false");
  input.setAttribute("aria-activedescendant", "");
}

function outsideClickListener(event) {
  const dropdownClicked = [
    input,
    dropdownArrow,
    ...resultsList.childNodes
  ].includes(event.target);

  if (!dropdownClicked) {
    closeDropdown();
  }
}

document.addEventListener("click", outsideClickListener);

input.addEventListener("click", openDropdown);

dropdownArrow.addEventListener("click", (event) => {
  event.preventDefault();
  if (!isDropDownOpen) {
    openDropdown();
  } else {
    closeDropdown();
  }
});

function setResults(results) {
  if (Array.isArray(results) && results.length > 0) {
    const innerListItems = results
      .map(
        (item, index) =>
          `<li class="autocomplete-item" id="naics-item-${index}" role="listitem" tabindex="0" value="${item['NAICSCode']}">${item['NAICSCode']}: ${item['NAICSTitle']}</li>`
      )
      .join("");
  resultsList.innerHTML = innerListItems;
  currentListItemFocused = -1;
  }
}

function focusListItem(listItemNode) {
  const id = listItemNode.id;
  input.setAttribute("aria-activedescendant", id);
  listItemNode.focus();
}

function selectValue(listItemNode) {
  // const value = listItemNode.innerText;
  // input.value = value;
  input.value = listItemNode.innerText;
  selectedNAICS = listItemNode.value;
  input.removeAttribute("aria-activedescendant");
  listItemNode.setAttribute("aria-selected", "true");
  input.focus();
  closeDropdown();
}

resultsList.addEventListener("click", (event) => {
  if ([...resultsList.childNodes].includes(event.target)) {
    selectValue(event.target);
  }
});

function handleKeyboardEvents(event) {
  const listItems = resultsList.childNodes;
  let itemToFocus = null;

  // Prevent defaitt if needed
  if (["ArrowUp", "ArrowDown", "Enter"].includes(event.key)) {
    event.preventDefault();
  }

  switch (event.key) {
    case "ArrowDown":
      if (currentListItemFocused < listItems.length - 1) {
        if (!isDropDownOpen) {
          openDropdown();
        }
        currentListItemFocused = currentListItemFocused + 1;
        itemToFocus = listItems.item(currentListItemFocused);
        focusListItem(itemToFocus);
      }
      break;
    case "ArrowUp":
      if (currentListItemFocused > 0) {
        currentListItemFocused = currentListItemFocused - 1;
        itemToFocus = listItems.item(currentListItemFocused);
        focusListItem(itemToFocus);
      }
      break;
    case "Home":
      if (currentListItemFocused > 0) {
        currentListItemFocused = 0;
        itemToFocus = listItems.item(currentListItemFocused);
        focusListItem(itemToFocus);
      }
      break;
    case "End":
      if (currentListItemFocused < listItems.length - 1) {
        currentListItemFocused = listItems.length - 1;
        itemToFocus = listItems.item(currentListItemFocused);
        focusListItem(itemToFocus);
      }
      break;
    case "Enter":
      if (!isDropDownOpen) {
        openDropdown();
      } else {
        if (listItems[currentListItemFocused].innerText) {
          selectValue(listItems[currentListItemFocused]);
        }
      }
      break;
    case "Escape":
      if (isDropDownOpen) {
        closeDropdown();
      }
      break;
    default:
      if (event.target !== input) {
        if (/([a-zA-Z0-9_]|ArrowLeft|ArrowRight)/.test(event.key)) {
          // If list item is focused and user presses an alphanumeric key, or left or right
          // Focus on the input instead
          input.focus();
        }
      }
      break;
  }
}

input.addEventListener("keydown", handleKeyboardEvents);
resultsList.addEventListener("keydown", handleKeyboardEvents);

setResults(naicsCodes.NAICS);

let bounce = undefined;
function debounce(callback) {
  clearTimeout(bounce);
  bounce = setTimeout(() => {
    callback();
  }, [DEBOUNCE_TIMEOUT_MS]);
}

function filter(value) {
  if (value) {
    filteredResults = naicsCodes.NAICS.filter(o => Object.keys(o).some(k => o[k].toLowerCase().includes(value.toLowerCase())));
  } else {
    filteredResults = [...naicsCodes.NAICS];
  }
  setResults(filteredResults);
}

input.addEventListener("input", (event) => {
  const value = event.target.value;

  debounce(() => {
    filter(value);
    if (!isDropDownOpen) {
      openDropdown();
    }
  });
});

const form = document.querySelector("#form1");

form.addEventListener("submit", function (event) {
	// stop form submission
	event.preventDefault();

	// find any exemptions
	let exemptions = getExemptions();

	// update the HTML page
	document.querySelector("#content").innerHTML = getResults(exemptions);
});

const EMPLOYMENT_EXEMPT_MSG = "<li>Based on your entry for NAICS code and peak establishment employment, you are NOT required to submit your injury and illness data through the Injury Tracking Application. Only establishments with ZZ or more employees are required to report their injury and illness data through the ITA.</li><ul><li>NAICS code = XXXX YYYY</li><li>State = SS</li></ul>";
const NAICS_RK_EXEMPT_MSG = "<li>Based on your entry for NAICS code, you are partially exempt from OSHA's injury and illness recordkeeping requirements and are NOT required to submit your injury and illness data through the Injury Tracking Application. See <a href=\"https://www.osha.gov/recordkeeping/presentations/exempttable\">https://www.osha.gov/recordkeeping/presentations/exempttable</a> for more information.</li><ul><li>NAICS code = XXXX YYYY</li></ul>";
const NAICS_EXEMPT_MSG = "<li>Based on your entry for NAICS code, you are NOT required to submit your injury and illness data through the Injury Tracking Application. See <a href=\"https://www.osha.gov/recordkeeping/naics-codes-electronic-submission\">https://www.osha.gov/recordkeeping/naics-codes-electronic-submission</a> for more information.</li><ul><li>NAICS code = XXXX YYYY</li></ul>";
const FED_EXEMPT_MSG = "<li>As a Federal Government Agency, do NOT submit your injury and illness data through the Injury Tracking Application (see the <a href=\"https://www.osha.gov/sites/default/files/federal_injury_illness_recordkeeping_brochure.pdf\">OSHA Federal Agency Recordkeeping/Reporting Modernization brochure</a>).</li>";
const STATE_GOVT_EXEMPT_MSG = "<li>As a state or local government establishment in SS your are NOT required to submit your injury and illness data through the Injury Tracking Application.</li>"
const STATE_EXEMPT_MSG = "<li>Based on your entry for state, you are NOT required to submit your injury and illness data through the Injury Tracking Application.</li><ul><li>State = SS</li></ul>"
const STATE_POSSIBLE_EXEMPT_MSG = "<li>Based on your entry for state, please contact your state occupational safety and health agency for information about your reporting requirements. See <a href=\"https://www.osha.gov/stateplans\">https://www.osha.gov/stateplans</a> for contact information.</li><ul><li>State = SS</li></ul>"

function getSpecialExemption(state, government) {
	const exemptPrivStates = ["AK", "WA", "OR", "CA", "NV", "HI", "WY", "UT", "AZ", "NM", "MN", "IA", "MI", "IN", "KY", "TN", "VT", "MD", "VA", "NC", "SC", "PR"];
	if (exemptPrivStates.includes(state) && (government == "nongovernment" || government == "statelocal")) {
		return STATE_POSSIBLE_EXEMPT_MSG.replace("SS", getStateName(state));
	}	
	return false;
}

function getGovernmentExemption(state, government) {
	if (government == 'federal') {
		return FED_EXEMPT_MSG;
	}
	const exemptStates = ["IL", "ME", "NY", "MA", "CT", "NJ", "VI"];
	if (exemptStates.includes(state)) {
		if (government == "statelocal") {
			return STATE_POSSIBLE_EXEMPT_MSG.replace("SS", getStateName(state));
		} else {
			return STATE_EXEMPT_MSG.replace("SS", getStateName(state));
		}
	}
	return false;
}

function getNaicsExemption(naicsInfo) {
	if (naicsInfo.RKExempt == "TRUE") {
		return NAICS_RK_EXEMPT_MSG.replace("XXXX", naicsInfo.NAICSCode).replace("YYYY", naicsInfo.NAICSTitle);
	} else if (naicsInfo.NotOSHAJurisdiction == "TRUE") {
		return NAICS_EXEMPT_MSG.replace("XXXX", naicsInfo.NAICSCode).replace("YYYY", naicsInfo.NAICSTitle);
	}
	return false;
}

function getEmploymentExemption(employment, state, naicsInfo) {
	if (naicsInfo.Employees20 == "TRUE" && employment < 20) {
		return EMPLOYMENT_EXEMPT_MSG.replace("ZZ", "20").replace("XXXX", naicsInfo.NAICSCode).replace("YYYY", naicsInfo.NAICSTitle).replace("SS", getStateName(state));
	} else if (naicsInfo.Employees250 == "TRUE" && employment < 250) {
		return EMPLOYMENT_EXEMPT_MSG.replace("ZZ", "250").replace("XXXX", naicsInfo.NAICSCode).replace("YYYY", naicsInfo.NAICSTitle).replace("SS", getStateName(state));
	}
	return false;
}

function getExemptions() {
	console.log(`state = ${document.querySelector("#state").value}`);
	console.log(`employment = ${document.querySelector("#employment").value}`);
	console.log(`government = ${document.querySelector('input[name=government]:checked').value}`);	
	console.log(`naics = ${selectedNAICS}`);

	let naicsInfo = getNaicsInfo(selectedNAICS);
	// console.log(naicsInfo);

	let specialExempt = getSpecialExemption(document.querySelector("#state").value, document.querySelector('input[name=government]:checked').value);
	let governmentExempt = getGovernmentExemption(document.querySelector("#state").value, document.querySelector("#state").value);
	let naicsExempt = getNaicsExemption(naicsInfo);
	let employmentExempt = getEmploymentExemption(document.querySelector("#employment").value, document.querySelector("#state").value, naicsInfo);

	return {"specialExempt": specialExempt,
			"governmentExempt": governmentExempt,
			"naicsExempt": naicsExempt,
			"employmentExempt": employmentExempt
			}
}

function getStateName(statecode) {
	let obj = states;
	let result = obj.States.filter(e => e.code == statecode);
	return result[0].name;
}

function getNaicsInfo(naics) {
	let obj = naicsCodes;
	let result = obj.NAICS.filter(e => e.NAICSCode == naics);
	return result[0];
}

function getCommaNumber(number) {
	return Number(number).toLocaleString();
}

function getResults(exemptions) {
	let stateName = getStateName(document.querySelector("#state").value);
	let naicsTitle = selectedNAICS + " " + getNaicsInfo(selectedNAICS).NAICSTitle;
	let employmentNum = getCommaNumber(document.querySelector("#employment").value);

	let isExempt = false;
	let heading = "Reporting is required for this establishment.";
	let divContent = ""
	
	if (exemptions.specialExempt) {
		heading = "Reporting may be required for this establishment."
		divContent = divContent + exemptions.specialExempt;
		isExempt = true;
	} else {
		if (exemptions.governmentExempt) {
			divContent = divContent + exemptions.governmentExempt;
			isExempt = true;
		}		
		if (exemptions.naicsExempt) {
			divContent = divContent + exemptions.naicsExempt;
			isExempt = true;
		}
		if (exemptions.employmentExempt) {
			divContent = divContent + exemptions.employmentExempt;
			isExempt = true;
		}
		if (isExempt === true) {
			heading = "No reporting is required for this establishment.";
		}
	}
	if (isExempt === false) {
		divContent = divContent + "Based on your entries, you are required to report your Form 300A summary data to OSHA through the Injury Tracking Application.";
		divContent = divContent + "<ul><li>State = " + stateName + "</li>";
		divContent = divContent + "<li>Peak establishment employment = " + employmentNum + "</li>";
		divContent = divContent + "<li>NAICS code = " + naicsTitle + "</li>";
	}
	divContent = "<h3>" + heading + "</h3><ul>" + divContent + "</ul>";
	return divContent
}