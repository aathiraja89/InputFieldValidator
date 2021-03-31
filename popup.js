// function contains(selector, text) {
// 	var elements = document.querySelectorAll(selector);
// 	return Array.prototype.filter.call(elements, function(element){
// 	  return RegExp(text).test(element.textContent);
// 	});
//   }

// $(document).ready(function(){
		var startBtnState = false;
		var stopBtnState = true;
		
		// chrome.storage.sync.clear(function() {
		//     var error = chrome.runtime.lastError;
		//     if (error) {
		//         console.error(error);
		//     }
		// });

		chrome.browserAction.onClicked.addListener( function(tab){
			console.log("Hello from popup"); // This does not show up either
		});

	  document.addEventListener("DOMContentLoaded", function() {
	  	var validatorForm = document.forms.validatorForm, elem = validatorForm.elements;
	  	var startBtn = document.getElementById("start");
		var stopBtn = document.getElementById("stop");	
		var defaultValuesBtn = document.getElementById("defaultValuesBtn");

		chrome.storage.sync.get('storeInputValues', function(items){
		    if(!chrome.runtime.error){
		        //do what you want to do with the data
		        var optionsList = items.storeInputValues;
	        	addOptionsToSelect(optionsList);
		    }
		})

			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			  	chrome.tabs.sendMessage(tabs[0].id, {message: "isObserverActive"}, function(isActive) {
				  	if(isActive){
				  		startBtn.disabled = true;
						stopBtn.disabled = false;	
				  	} else {
				  		startBtn.disabled = false;
						stopBtn.disabled = true;
				  	}
		  		});
			});
		
		//var reportBtn = document.getElementById("report");	 
		 chrome.storage.local.get("isStartBtnDisabled", function (value) { 
		 	console.log("isStartBtnDisabled ",value['isStartBtnDisabled']);
			 startBtnState = value['isStartBtnDisabled'] === 'undefined' ? false : value['isStartBtnDisabled'];  
			 startBtn.disabled = startBtnState;
		});
		 chrome.storage.local.get("isStopBtnDisabled", function (value) { 
		 	console.log("isStopBtnDisabled ",value['isStopBtnDisabled']);
		 	stopBtnState = value['isStopBtnDisabled'] === 'undefined' ? true : value['isStopBtnDisabled'];  
		 	stopBtn.disabled = stopBtnState;
		 });
		console.log("Initial ",startBtnState,stopBtnState);
		 
		 
		// stopBtn.disabled = false;
		// reportBtn.disabled = false;
		// reportBtn.addEventListener("click", function() {
		// 	generateReport();
		// });
		validatorForm.onsubmit = function(){
		    if(!elem.addValues.value){
		        elem.addValues.focus();
		        return false;
		    }
		    var val = $("#addRow").val();
			var htm = '';
			htm += '<option>' + val + '</option>';
			$('.selectpicker').prepend(htm);
			$('.selectpicker option:first').prop('selected', true);
			$('.selectpicker').selectpicker('refresh');
			validatorForm.reset();

			chrome.storage.sync.set({'storeInputValues' : getAllOptions()}, function(){
			    if(chrome.runtime.error){
			        console.log("Error storing input values to Storage sync");
			    }
			});
		    return false;
		}

		defaultValuesBtn.addEventListener("click", function() {
				defaultSelectMenu();
		});

		startBtn.addEventListener("click", function() {
				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				  	chrome.tabs.sendMessage(tabs[0].id, {message: "startObserver", data: getSelectedValues()}, function(isActive) {
					  	// isActive1 = !isActive1;
					    // setIcon(tab.id, true);
					    startBtn.disabled = true;
						stopBtn.disabled = false;
						chrome.storage.local.set({"isStartBtnDisabled":true});
						chrome.storage.local.set({"isStopBtnDisabled":false});
			  		});
				});
				
			// var evt = document.createEvent('Event');
			// evt.initEvent('initiateObserver_Event', true, false);
			// // fire the event
			// console.log('Start triggered');
			// document.dispatchEvent(evt);
		});

			  
		stopBtn.addEventListener("click", function() {
			chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
			  	chrome.tabs.sendMessage(tabs[0].id, {message: "stopObserver"}, function(isActive) {
				  	// isActive1 = !isActive1;
				    // setIcon(tab.id, false);
				    startBtn.disabled = false;
					stopBtn.disabled = true;
					chrome.storage.local.set({"isStartBtnDisabled":false});
					chrome.storage.local.set({"isStopBtnDisabled":true});
		  		});
			});

			// var evt = document.createEvent('Event');
			// evt.initEvent('disconnectObserver_Event', true, false);
			// // fire the event
			// console.log('Stop triggered');
			// document.dispatchEvent(evt);
		});
	  });

function setIcon(tabId, isActive) {
  const path = isActive ? "print_16x16.png" : "get_started128.png";
  chrome.browserAction.setIcon({
    path, tabId
  });
}


	function getElementByXpath(path) {
		return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
	
	// let startButton = getElementByXpath('//button[contains(string(),"Start")]');
	// console.log("STAAAAART Button : ",startButton);
	// 	startButton.onclick = function(){
	// 		console.log('Calling MutationObserver');
	// 		respawn();
	// 	}


		

	async function generateReport() {
		console.log("Generate Report!!!");
		var options = {
			orientation: "l",
			unit: "mm",
			format: "letter"
		};
		var doc = new jsPDF("p", "pt", "a4");
		var options = {
			pagesplit: true
		};
	
		await document.dispatchEvent(new CustomEvent("documentEvent", { "detail":doc }));

	}


	
	$(function() {
		$(".selectpicker option").prop("selected", "selected");
		$('.selectpicker').selectpicker();
	});
	
	//  $(function () {
	// 	$('#btn').click(function () {
	// 		var val = $("#addRow").val();
	// 		var htm = '';
	// 		htm += '<option>' + val + '</option>';
	// 		$('.selectpicker').append(htm);
	// 		$('.selectpicker').selectpicker('refresh');
	// 	});
	// 	/* $('#chkveg').multiselect({
		
	// 		includeSelectAllOption: false
		
	// 	}); */
	
	// });
	 $(function () {
		$('.selectpicker').on('changed.bs.select', function (e) {
	   // check if no option is selected.
		// if ($('.selectpicker').val().length < 1) {
		// 	$('.selectpicker').selectpicker('val', 'Value of your desired option u wish to be selected');
		// }
	  });
	  });

	 function addOptionsToSelect(optionsList){
	 	console.log(optionsList);
			$(".selectpicker").empty();
			optionsList.forEach(opt => {
				console.log("OPTION -> ",opt);
				$(".selectpicker").append( $("<option>").html(opt));
			});

			$(".selectpicker option").prop("selected", "selected");
		$('.selectpicker').selectpicker('refresh');
	 }

	 function defaultSelectMenu(){
	 	var defaultOptions = ['0.1223', '1000', 'lorem ipsum', '#$%@%$*', '00001111'];
	 	console.log("Default Options reset");
	 	addOptionsToSelect(defaultOptions);
	 }

	  function getSelectedValues() {

		var selected = $('.selectpicker').find("option:selected"); //get current selected value
		var arrSelected = []; //Array to store your multiple value in stack
		selected.each(function() {
		  arrSelected.push($(this).val()); //Stack the value
		});
		console.log(arrSelected);
		return arrSelected;
	  }

	function getAllOptions() {
		var options = $.map($('.selectpicker option'), e => $(e).val())
		console.log("ALL OPTIONS : ",options);
		return options;
	}
	
	
	



// });