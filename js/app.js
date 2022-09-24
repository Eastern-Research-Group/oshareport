import naicsCodes from "../data/naics.json" assert { type: "json" };
import states from "../data/states.json" assert { type: "json" };

const DEBOUNCE_TIMEOUT_MS = 100;

const input = document.querySelector("#naics");
const resultsList = document.querySelector("#autocomplete-results");
const dropdownArrow = document.querySelector(".autocomplete__dropdown-arrow");
const comboBox = document.querySelector(".autocomplete__container");

let currentListItemFocused = -1;
let selectedNAICS = "";
let filteredResults = [...naicsCodes.NAICS];
let isDropDownOpen = false;

window.onload = function() { 
	// document.querySelector("#data-entry").style.display = "block";
	document.querySelector("#results").style.display = "none";
}

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

  // Prevent default if needed
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

document.querySelector("#reset").addEventListener("click", function() {
	location.reload();
});

document.querySelector("#form1").addEventListener("submit", function (event) {
	//don't submit the form
	event.preventDefault()

	const state = document.querySelector("#state").value;
	const employment = document.querySelector("#employment").value;
	const government = document.querySelector('input[name=government]:checked').value;
	const naicsInfo = getNaicsInfo(selectedNAICS);

	console.log(`state = ${state}`);
	console.log(`employment = ${employment}`);
	console.log(`government = ${government}`);	
	console.log(`naics = ${selectedNAICS}`);

	const exemptPrivStates = ["AK", "WA", "OR", "CA", "NV", "HI", "WY", "UT", "AZ", "NM", "MN", "IA", "MI", "IN", "KY", "TN", "VT", "MD", "VA", "NC", "SC", "PR"];
	const exemptStates = ["IL", "ME", "NY", "MA", "CT", "NJ", "VI"];

	let resultsStyle = "required";

	if (government == 'federal') {
		resultsStyle = "exempt";
		document.querySelector("#fed-exempt").style.display = "block";
		console.log(1);
	} else if (exemptPrivStates.includes(state) && (government == "nongovernment" || government == "statelocal")) {
		resultsStyle = "possible";
		document.querySelector('#possible-exempt').style.display = "block";
		console.log(2);
	} else if (exemptStates.includes(state)) {
		console.log(4);
		if (government == "statelocal") {
			resultsStyle = "possible";
			document.querySelector("#possible-exempt").style.display = "block";
			console.log(5);
		}
	} else {
		if (naicsInfo.RKExempt == "TRUE") {
			resultsStyle = "exempt";
			document.querySelector("#rk-exempt").style.display = "block";
			document.querySelector("#naics__exempt").style.display = "block";
			console.log(6);
		} else if (naicsInfo.NotOSHAJurisdiction == "TRUE") {
			resultsStyle = "exempt";
			document.querySelector("#naics-exempt").style.display = "block";
			document.querySelector("#naics__exempt").style.display = "block";
			console.log(7);
		}
		if (naicsInfo.Employees20 == "TRUE" && employment < 20) {
			resultsStyle = "exempt";
			document.querySelector("#employment-exempt").style.display = "block";
			console.log(8);
		} else if (naicsInfo.Employees250 == "TRUE" && employment < 250) {
			resultsStyle = "exempt";
			document.querySelector("#employment-exempt").innerHTML = 
				document.querySelector("#employment-exempt").innerHTML.replace("20", "250");
			document.querySelector("#employment-exempt").style.display = "block";
			document.querySelector("#naics__exempt").style.display = "block";
			console.log(9);
		}
	}

	console.log(`resultsStyle = ${resultsStyle}`);
	console.log(10);

	let elList = document.querySelectorAll("." + resultsStyle);
	elList.forEach(el => el.style.display = "block");

	document.querySelector("#results-state").innerHTML = 
		document.querySelector("#results-state").innerHTML.replace("SS", getStateName(state)); 
	document.querySelector("#results-employment").innerHTML = 
		document.querySelector("#results-employment").innerHTML
			.replace("EEEE", Number(employment).toLocaleString());
	document.querySelector("#results-naics").innerHTML = 
		document.querySelector("#results-naics").innerHTML
			.replace("NNNN", naicsInfo["NAICSCode"] + ": " + naicsInfo["NAICSTitle"]); 

	document.querySelector("#data-entry").style.display = "none";		
	document.querySelector("#results").style.display = "block";

	console.log(11);
});









