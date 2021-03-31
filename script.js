		// chrome.storage.local.clear(function() {
		//     var error = chrome.runtime.lastError;
		//     if (error) {
		//         console.error(error);
		//     }
		// });
		var observer;
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
		var skipping = false;
		var i = 0;
		var booleanArray = [];
		var pageArray = [];
		var inputs = ["0.1223", "1000", "lorem ipsum", "#$%@%$*", "00001111"];
		var target = [];
		var srcList = [];
		var currentHeight = 20;
		var isFirst = true;
		var observerActive = false;
		var count1 = 0;

		var elementsList1 = document.querySelectorAll('input:not([readonly],[disabled],[type="checkbox"],[type="radio"],[type="button"],[type="hidden"],[class*="date"],[class*="time"],[formcontrolname*="day"],[formcontrolname*="date"],[formcontrolname*="time"],[class*="Date"],[class*="Time"],[formcontrolname*="Day"],[formcontrolname*="Date"],[formcontrolname*="Time"])');
		Array.from(elementsList1).filter((el) => el.offsetParent !== null).reduce((a, b) => {
		    target.push(b)
		}, 0);

		// var callback = () => {
		var observer = new MutationObserver(e => {
		    if (!isFirst)
		        count1 = target.length;
		    elementsList1 = document.querySelectorAll('input:not([readonly],[disabled],[type="checkbox"],[type="radio"],[type="button"],[type="hidden"],[class*="date"],[class*="time"],[formcontrolname*="day"],[formcontrolname*="date"],[formcontrolname*="time"],[class*="Date"],[class*="Time"],[formcontrolname*="Day"],[formcontrolname*="Date"],[formcontrolname*="Time"])');
		    target.length = 0;
		    Array.from(elementsList1).filter((el) => el.offsetParent !== null).reduce((a, b) => {
		        target.push(b)
		    }, 0);
		    if (target.length != count1) {
		        i = 0;
		        booleanArray.length = 0;
		        pageArray.length = 0;
		        myFunction(target);
		        isFirst = false;
		        count1 = target.length;
		    }
		});


		chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		    switch (request.message) {
		        case 'startObserver':
		            inputs = request.data;
		            observer.observe(document.body, {
		                attributes: true,
		                childList: true,
		                subtree: true
		            });
		            observerActive = true;
		            sendResponse("Started");
		            break;
		        case 'stopObserver':
		            observer.disconnect();
		            observerActive = false;
		            generateReport();
		            sendResponse("Stopped");
		            break;
		        case 'isObserverActive':
		            sendResponse(observerActive);
		            break;
		    }
		});

		function getList() {
		    return srcList;
		}

		function generatePDF(input, doc, cb) {
		    setTimeout(() => {
		        const margin = 0.1;

		        const pdfWidth = doc.internal.pageSize.width * (1 - margin);
		        const pdfHeight = doc.internal.pageSize.height * (1 - margin);

		        const x = doc.internal.pageSize.width * (margin / 2);
		        const y = doc.internal.pageSize.height * (margin / 2);

		        doc.setFont("courier");
		        doc.setFontType("normal");
		        doc.setFontSize(13);
		        currentHeight = 40;
		        doc.text(20, currentHeight, "URL : ");
		        currentHeight = Math.round((currentHeight + 20) / 10) * 10;
		        var wrapUrl = doc.splitTextToSize(input.url, pdfWidth);

		        doc.setFontType("italic");
		        doc.setTextColor(0, 0, 255);
		        for (var i = 0; i < wrapUrl.length; i++) {
		            if (currentHeight > 275) {
		                currentHeight = 40;
		                doc.addPage();
		            }
		            doc.textWithLink(wrapUrl[i], 20, currentHeight, {
		                url: input.url
		            });
		            currentHeight = currentHeight + 20;
		        }
		        doc.setTextColor(0, 0, 0);
		        doc.setFontType("normal");
		        currentHeight = Math.round((currentHeight + 20) / 10) * 10;
		        var wrapName = doc.splitTextToSize(input.name, pdfWidth - 20);
		        doc.text(20, currentHeight, 'Not Validated Fields: ');
		        doc.text(60, currentHeight + 15, wrapName);

		        addImageProcess(input.canvas).then((image) => {
		            const widthRatio = pdfWidth / image.width;
		            const heightRatio = pdfHeight / image.height;
		            const ratio = Math.min(widthRatio, heightRatio);

		            const w = image.width * ratio;
		            const h = image.height * ratio;

		            currentHeight = Math.round(currentHeight + 20);
		            if (currentHeight > pdfHeight) {
		                doc.addPage();
		                currentHeight = 20;
		            }
		            doc.addImage(image, 'JPEG', x, y + currentHeight, w, h);
		            doc.addPage();
		            cb();
		        });
		    }, 100);
		    return doc;
		}
		document.addEventListener('documentEvent', function(e) {
		    return new Promise((resolve, reject) => {
		        return getLocalStorageValue("failedValidations").then((obj) => {
		            doc = e.detail;
		            const inputsList3 = Array.from(obj['failedValidations']).reduce((promiseChain3, input) => {
		                return promiseChain3.then(() => new Promise((resolve) => {
		                    generatePDF(input, doc, resolve);
		                }));
		            }, Promise.resolve());

		            inputsList3.then(() => {
		                var pageCount = doc.internal.getNumberOfPages();
		                doc.deletePage(pageCount);
		                doc.save('document.pdf');
		                resolve(doc);
		            });
		        });

		    });
		}, false);

		function addImageProcess(src) {
		    return new Promise((resolve, reject) => {
		        let img = new Image()
		        img.onload = () => resolve(img)
		        img.onerror = reject
		        img.src = src
		    })
		}

		function myFunction(elements) {
		    var backgroundColor;
		    var noValidationNameArray = [];
		    const elementsList = Array.from(elements).reduce((promiseChain, element) => {
		        return promiseChain.then(() => new Promise((resolve) => {
		            element.style.backgroundColor = "#FDFF47";
		            elementValues(element, resolve);

		            const inputsList = Array.from(inputs).reduce((promiseChain1, input) => {
		                return promiseChain1.then(() => new Promise((resolve) => {
		                    inputValues(input, element, resolve);
		                }));
		            }, Promise.resolve());

		            inputsList.then(() => {
		                element.value = '';
		                if (!booleanArray.some(hasValidation)) {
		                    noValidationNameArray.push(element.getAttribute("placeholder") != null ? element.getAttribute("placeholder") :
		                        element.getAttribute("name") != null ? element.getAttribute("name") :
		                        element.getAttribute("formcontrolname") != null ? element.getAttribute("formcontrolname") :
		                        element.getAttribute("id") != null ? element.getAttribute("id") :
		                        element);
		                    element.style.backgroundColor = "red";
		                } else {
		                    element.style.backgroundColor = "";
		                }
		                booleanArray.length = 0;
		            })
		        }));
		    }, Promise.resolve());

		    elementsList.then(() => {
		        if (noValidationNameArray.length > 0) {
		            takeScreenShot().then(function(canvasImg) {
		                let noValidationElement = {
		                    "url": window.location.href,
		                    "name": noValidationNameArray,
		                    "canvas": canvasImg.toDataURL("image/jpeg")
		                }
		                srcList.push(noValidationElement);
		            }).then(() => {
		                chrome.storage.local.set({
		                    "failedValidations": srcList
		                }, function() {
		                    console.log('Saved', srcList);
		                });
		            })
		        }
		    });
		}


		function saveAs(canvas, fileName) {
		    if (window.navigator.msSaveBlob) {
		        window.navigator.msSaveBlob(canvas.msToBlob(), fileName);
		        e.preventDefault();
		    } else {
		        var a = document.createElement('a');
		        a.setAttribute('download', fileName);
		        a.setAttribute('href', canvas.toDataURL());
		        document.body.appendChild(a);
		        a.click();
		        document.body.removeChild(a);
		    }
		}

		function elementValues(element, cb) {
		    setTimeout(() => {
		        cb();
		    }, (1000 * inputs.length) + 500);

		}

		function inputValues(input, item, cb) {
		    setTimeout(() => {
		        item.scrollIntoView({
		            behavior: 'smooth'
		        });
		        item.value = input;

		        if (item.value == input) {
		            booleanArray.push(false);

		        } else {
		            booleanArray.push(true);
		        }
		        cb();
		    }, 1000);
		}

		function hasValidation(validation) {
		    return validation === true;
		}

		function takeScreenShot() {
		    return html2canvas(document.body, {
		        useCORS: false,
		        dpi: 300,
		        scale: 2
		    }).then(function(canvas) {
		        //saveAs(canvas, 'image1.png');
		        return canvas;
		    });
		}

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

		    await document.dispatchEvent(new CustomEvent("documentEvent", {
		        "detail": doc
		    }));
		}

		function getLocalStorageValue(key) {
		    return new Promise((resolve, reject) => {
		        try {
		            chrome.storage.local.get(key, function(value) {
		                resolve(value);
		            })
		        } catch (ex) {
		            reject(ex);
		        }
		    });
		}
		//     });
		// });