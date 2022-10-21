const naicsUrl = "../oshareport/data/naics.json";
const statesUrl = "../oshareport/data/states.json";
const exemptUrl = "../oshareport/data/exempt.json";

const DEBOUNCE_TIMEOUT_MS = 100;

const input = document.querySelector("#naics");
const resultsList = document.querySelector("#autocomplete-results");
const dropdownArrow = document.querySelector(".autocomplete__dropdown-arrow");
const comboBox = document.querySelector(".autocomplete__container");

let naicsCodes;
let states;
let exempt;

let currentListItemFocused = -1;
let selectedNAICS = "";
let isDropDownOpen = false;

let filteredResults;


window.onload = function() { 
	document.querySelector("#results").style.display = "none";
}

fetch(naicsUrl)
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem importing naicsCodes. Status Code: ' + 
          response.status);  
        return;  
      }
      response.json().then(function(data) {  
        naicsCodes = data;
        filteredResults = [...naicsCodes.NAICS]
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('naicsCodes Fetch Error -', err);  
  });  
 
fetch(statesUrl)
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem importing naicsCodes. Status Code: ' + 
          response.status);  
        return;  
      }
      response.json().then(function(data) {  
        states = data;
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('States Fetch Error -', err);  
  });

fetch(exemptUrl)
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem importing exempt states. Status Code: ' + 
          response.status);  
        return;  
      }
      response.json().then(function(data) {  
        exempt = data;
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('Exempt States Fetch Error -', err);  
});


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
        if (/(\w|ArrowLeft|ArrowRight)/.test(event.key)) {
          input.focus();
        }
      }
      break;
  }
}

input.addEventListener("keydown", handleKeyboardEvents);
resultsList.addEventListener("keydown", handleKeyboardEvents);

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
	event.preventDefault()

	const state = document.querySelector("#state").value;
	const employment = document.querySelector("#employment").value;
	const government = document.querySelector('input[name=government]:checked').value;
	const naicsInfo = getNaicsInfo(selectedNAICS);
  const exemptPrivStates = exempt.exemptPrivStates
  const exemptStates = exempt.exemptStates

	let resultsStyle = "required";
  let governmentType = "Non-government";

	if (government == 'federal') {
		resultsStyle = "exempt";
    governmentType = 'Federal'
		document.querySelector("#fed-exempt").style.display = "list-item";
	} else if (exemptPrivStates.includes(state) && (government == "nongovernment" || government == "statelocal")) {
		resultsStyle = "possible";
    if (government == "statelocal") {
       governmentType = 'State or Local';
    }
		document.querySelector('#possible-exempt').style.display = "list-item";
	} else if (exemptStates.includes(state) && (government == "statelocal")) {
		resultsStyle = "possible";
    governmentType = 'State or Local';
		document.querySelector("#possible-exempt").style.display = "list-item";
	} else if (government == "statelocal") { 
		resultsStyle = "exempt";
    governmentType = 'State or Local';
		document.querySelector("#state-govt-exempt").style.display = "list-item";
	} else {
		if (naicsInfo.RKExempt == "TRUE") {
			resultsStyle = "exempt";
			document.querySelector("#rk-exempt").style.display = "list-item";
		} else if (naicsInfo.NotOSHAJurisdiction == "TRUE") {
			resultsStyle = "exempt";
			document.querySelector("#naics-exempt").style.display = "list-item";
		}
		if (naicsInfo.Employees20 == "TRUE" && employment < 20) {
			resultsStyle = "exempt";
			document.querySelector("#employment-exempt").style.display = "list-item";
		} else if (naicsInfo.Employees250 == "TRUE" && employment < 250) {
			resultsStyle = "exempt";
			document.querySelector("#employment250-exempt").style.display = "list-item";
		}
	}

	document.querySelector("#results-state").innerHTML = 
		document.querySelector("#results-state").innerHTML.replace("SS", getStateName(state)); 
	document.querySelector("#results-employment").innerHTML = 
		document.querySelector("#results-employment").innerHTML
			.replace("EEEE", Number(employment).toLocaleString());
  document.querySelector("#results-government").innerHTML = 
    document.querySelector("#results-government").innerHTML.replace("GG", governmentType);      
	document.querySelector("#results-naics").innerHTML = 
		document.querySelector("#results-naics").innerHTML
			.replace("NNNN", naicsInfo.NAICSCode + ": " + naicsInfo.NAICSTitle); 

  document.querySelector(".results_ul").style.display = "list-item";  
  let elList = document.querySelectorAll("." + resultsStyle);
  elList.forEach(el => el.style.display = "list-item");

	document.querySelector("#intro").style.display = "none";	
	document.querySelector("#data-entry").style.display = "none";		
	document.querySelector("#results").style.display = "block";
});









