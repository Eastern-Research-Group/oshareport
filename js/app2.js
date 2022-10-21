const naicsUrl = "../oshareport/data/naics2.json";
const statesUrl = "../oshareport/data/states2.json";
const exemptUrl = "../oshareport/data/exempt.json";

let naicsCodes;
let states;
let exempt;
let selectedNAICS;

window.onload = function() { 
	document.querySelector("#results").style.display = "none";
}

let dropdown = document.querySelector("#naics-datalist");

fetch(naicsUrl)  
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem importing NAICS. Status Code: ' + 
          response.status);  
        return;  
      }

      response.json().then(function(data) {  
        naicsCodes = data;
        let option;
    
      for (let i = 0; i < naicsCodes.length; i++) {
          option = document.createElement('option');
          option.text = naicsCodes[i].NAICSTitle;
          option.value = naicsCodes[i].NAICSCode;
          dropdown.appendChild(option);
      }    
      });  
    }  
  )  
  .catch(function(err) {  
    console.error('NAICS Fetch Error -', err);  
  });

fetch(statesUrl)
  .then(  
    function(response) {  
      if (response.status !== 200) {  
        console.warn('Looks like there was a problem importing states. Status Code: ' + 
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

document.querySelector("#naics-input").addEventListener("change", (event) => {
  selectedNAICS = event.target.value; 
})

function getStateName(statecode) {
	let obj = states;
	let result = obj.filter(e => e.code == statecode);
	return result[0].name;
}

function getNaicsInfo(naics) {
	let obj = naicsCodes;
	let result = obj.filter(e => e.NAICSCode == naics);
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







