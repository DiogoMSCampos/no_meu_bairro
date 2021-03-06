var MAX_WIDTH = 1024;
var MAX_HEIGHT = 768;
var IS_DOWNSIZE_ENABLED = false;

function isCanvasSupported(){
  var elem = document.createElement('canvas');
  return !!(elem.getContext && elem.getContext('2d'));
}

//Reuse de same canvas
if (isCanvasSupported()) {
	var canvas = $("<canvas></canvas>")[0];
	var ctx = canvas.getContext("2d");
}

function addSmallerImagesToForm () {
	var $fileInputs, $newReport;

	if (!window.FileReader || !isCanvasSupported() || !canvas.toDataURL || !IS_DOWNSIZE_ENABLED) {
		return $.Deferred().resolve();
	}

	$newReport = $("#new_report");
	$fileInputs = $("#new_report input[type=file]");

	return $.when.apply(null, $fileInputs.map(function (argument) {
		var $fileInput, files;

		$fileInput = $(this);
		
		files = $fileInput[0].files;

		if (files.length > 0 && files[0].type.match(/image.*/)) {
			return addSmallerImage($fileInput, $newReport, files[0])
				.then(function () {
					if (IS_DOWNSIZE_ENABLED) {
						$fileInput[0].value = null;						
					}
				});
		}

		return $.Deferred().resolve();
	}));
}

//Based on https://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
function addSmallerImage ($fileInput, $form, file) {
	var img, reader, defer;

	img = document.createElement("img");
	reader = new FileReader();
	defer = $.Deferred();

	reader.onabort = reader.onerror = function (argument) {
		defer.reject();
	};
	
	reader.onload = function(e) {
		var index, dataurl, $hiddenInput;

		try {
			img.src = e.target.result;
		
			//Do the resizing
			var width = img.width;
			var height = img.height;
			if (width > height) {
			  if (width > MAX_WIDTH) {
			    height *= MAX_WIDTH / width;
			    width = MAX_WIDTH;
			  }
			} else {
			  if (height > MAX_HEIGHT) {
			    width *= MAX_HEIGHT / height;
			    height = MAX_HEIGHT;
			  }
			}
			canvas.width = width;
			canvas.height = height;
			ctx.drawImage(img, 0, 0, width, height);

			//Convert the resize image in the cavas to base 64
			dataurl = canvas.toDataURL("image/jpeg");
			dataurl = dataurl.slice("data:image/jpeg;base64,".length);

			//Get the timestamp out of the name, which is like 'report[photos_attributes][1392484594913][attachment]'
			index = $fileInput.prop("name").split("[")[2].split("]")[0]

			//Adds the hidden input that contains the image as base64
			$hiddenInput = $('<input type="hidden" />');
			$hiddenInput.prop({
				value: dataurl,
				name: "report[photos_attributes_base64][" + index + "]"
			});
			$form.append($hiddenInput);

			//TODO: this may be necessary in FF
			//var file = canvas.mozGetAsFile("foo.png");
		} catch (e) {
			defer.reject(e);
		}

		defer.resolve();
	};
	reader.readAsDataURL(file);

	return defer.promise();
}