(function() {

	setInterval(add_textareas, 1000);

	function add_textareas() {
		const questions_section = document.querySelector(".attempt-authoring-container section");
		const autoevaluations_textareas = document.querySelectorAll('.autoevaluations-assistant-textarea');

		// only display button on the autoevaluations pages
		if(questions_section && autoevaluations_textareas.length === 0) {
			log('Found questions section on the page.');
			// check all the questions
			//
			const question_forms = questions_section.querySelectorAll("form[name='questionForm']");

			log('Found ' + question_forms.length + ' questions on the page.');
			for (var i = 0; i < question_forms.length; i++) {
				const question_form = question_forms[i];
				// add copy text sections
				/*const download_button = document.createElement('button');
				download_button.innerText = 'Download Images';
				download_button.setAttribute('style', 'background: #ff0081; color: white; padding: 0 20px; border-radius: 5px; margin-left: 15px;');

				download_button.addEventListener('click', get_images);*/


				const question_title = question_form.querySelector('h3').innerText;
				const question_text = question_form.querySelector("div[role='presentation']").innerText.replace(/\n+/g, '\n').replace(/\s+/g, ' ').trim();

				var question_options = "Opciones:\n";

				const question_options_elements = question_form.querySelectorAll('.multiple-answer-answers-container input, .true-false-answers input');

				for (var j = 0; j < question_options_elements.length; j++) {
					const option = question_options_elements[j];
					const option_text = document.querySelector("label[for='" + option.id + "']").innerText;
					question_options += '[ ] ' + option_text + "\n";
				}

				const question_textarea = document.createElement('textarea');
				question_textarea.setAttribute('style', 'width: 100%; height: 100px; margin-top: 20px;');
				question_textarea.setAttribute('readonly', 'true');
				question_textarea.classList.add('autoevaluations-assistant-textarea');
				question_textarea.value = question_title + ":\n" + question_text + "\n" + question_options;


				const question_content = question_form.querySelector('.question-content');

				question_content.insertAdjacentElement('afterEnd', question_textarea);

				log('Addded textarea to question.');
			}

		}
	}

	function get_images() {

		// get all step images
		const images = document.querySelectorAll('.step img');
		if (images && images.length > 0) {
			log('Found ' + images.length + ' images on this page.');
			var urls = [];

			let content = "";

			const title = document.querySelector('h1').innerText;

			content += "## " + title + "\n\n";

			const prefix = snake_case(title);

			for (var i = 0; i < images.length; i++) {

				const number_with_leading_zero = ("0" + (i + 1)).slice(-2);

				const step_title = images[i].closest('.step').querySelector('h3 > span.text-xl > span').innerText;

				const step_description = images[i].closest('.step').querySelector('p').innerText;

				const suffix = snake_case(step_title);

				// create a filename for the image
				const file_name = prefix + number_with_leading_zero + "_" + suffix + ".webp";

				content +=  (i + 1)  + ". " + step_description + "\n\n";

				content += "![" + step_title + "](https://raw.githubusercontent.com/wiki/github_user/wiki_name/wiki_images_path/" + file_name + ")\n\n";

				urls.push({
					src: images[i].src,
					filename: file_name
				});
			}

			//create a base64 encoded string from the content
			const base64 = btoa(content);

			//create a data url from the base64 encoded string
			const dataUrl = "data:text/plain;base64," + base64;

			//add the markdown file to the urls array
			urls.push({
				src: dataUrl,
				filename: prefix + ".md"
			});

			chrome.runtime.sendMessage({
				action: 'download',
				urls: urls
			});
		} else {
			log('No images found on this page.');
		}
	}

	function log(message) {
		console.log("Autoevaluations Assistant Extension:", message);
	}

	function snake_case(str) {
		return str.replace(/\W+/g, " ")
			.split(/ |\B(?=[A-Z])/)
			.map(word => word.toLowerCase())
			.join('_');
	}
})();
