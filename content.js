(function () {
  setInterval(add_textareas, 1000);

	function findTextBetweenChars(startChar, endChar, text) {
	 console.log(text);
		const startIndex = text.indexOf(startChar);
		const endIndex = text.indexOf(endChar, startIndex + 1);
		if (startIndex !== -1 && endIndex !== -1) {
			return text.substring(startIndex + 1, endIndex).trim();
		}
		return "";
	}

	function getSubjectID(subject_name) {
	console.log("subject name:", subject_name);
  var subject_data = [{
        "id": 1,
        "name": "Introducción a las Comunicaciones"
      },
      {
        "id": 2,
        "name": "Probabilidad y Estadística"
      },
      {
        "id": 3,
        "name": "Sistemas Operativos"
      },
      {
        "id": 4,
        "name": "Tecnologías de la información"
      },
      {
        "id": 6,
        "name": "Computación Aplicada"
      },
      {
        "id": 7,
        "name": "Laboratorio 3"
      },
      {
        "id": 8,
        "name": "Análisis de Sistemas"
      },
      {
        "id": 9,
        "name": "Física 1"
      },
      {
        "id": 10,
        "name": "Laboratorio 4 Base de Datos"
      },
      {
        "id": 11,
        "name": "Algebra Lineal"
      },
      {
        "id": 12,
        "name": "Álgebra"
      },
      {
        "id": 13,
        "name": "Algoritmos y Estructuras de Datos"
      },
      {
        "id": 14,
        "name": "Historia del Arte"
    }];

    for (var i = 0; i < subject_data.length; i++) {
      if (subject_data[i].name === subject_name) {
        return subject_data[i].id;
      }
    }
    return -1;

	}

function add_textareas() {
		const questions_section = document.querySelector(
			".attempt-authoring-container section",
		);
		const autoevaluations_textareas = document.querySelectorAll(
			".autoevaluations-assistant-textarea",
		);

		// only display button on the autoevaluations pages
		if (document.querySelector("div[ng-if='showCourse()']") && questions_section && autoevaluations_textareas.length === 0) {

  		window.subject_name = findTextBetweenChars(
  			")",
  			"-",
  			document.querySelector("div[ng-if='showCourse()']").textContent.trim(),
  		);

			log("Found questions section on the page.");
			// check all the questions
			//
			const question_forms = questions_section.querySelectorAll(
				"form[name='questionForm']",
			);

			log("Found " + question_forms.length + " questions on the page.");
			for (var i = 0; i < question_forms.length; i++) {
				const question_form = question_forms[i];

				const question_helper_container = document.createElement("div");

				// add copy text sections
				const prompt_button = document.createElement("button");
				prompt_button.innerText = "Get Prompt";
				prompt_button.setAttribute(
					"style",
					"background: #ff0081; color: white; padding: 10px 20px; border-radius: 5px; margin-left: 15px;",
				);

				prompt_button.addEventListener("click", get_prompt);

				question_helper_container.appendChild(prompt_button);

				const question_textarea = document.createElement("textarea");
				question_textarea.setAttribute(
					"style",
					"width: 100%; height: 100px; margin-top: 20px;",
				);
				question_textarea.setAttribute("readonly", "true");
				question_textarea.classList.add("autoevaluations-assistant-textarea");

				const question_content =
					question_form.querySelector(".question-content");

				question_helper_container.appendChild(question_textarea);

				question_content.insertAdjacentElement(
					"afterEnd",
					question_helper_container,
				);

				log("Addded textarea to question.");
			}
		}
	}

	async function get_prompt(evt) {
		console.log(window.basic_auth);
		if (localStorage.getItem("basic_auth") === null) {
			alert("Please set your basic auth credentials in the extension options.");
			return;
		}

		const question_form = evt.target.closest("form[name='questionForm']");

		const question_textarea = question_form.querySelector(
			".autoevaluations-assistant-textarea",
		);

		const semantic_search_query = get_question(question_form, "prompt");

		const url = new URL("https://examprep.jempe.org/v1/phrases_search");

		const params = {
			search: semantic_search_query,
			paper_id: 0,
			subject_id: getSubjectID(window.subject_name),
			page_size: 4,
		};

		url.search = new URLSearchParams(params).toString();

		const options = {
			method: "GET",
			headers: { Authorization: localStorage.getItem("basic_auth") },
		};

		try {
			const response = await fetch(url, options);
			const data = await response.json();
			console.log(data);
			console.log(question_textarea);

			var prompt_text = "";

			if (data.phrases.length > 0) {
				for (var i = 0; i < data.phrases.length; i++) {
					prompt_text += data.phrases[i].content + "\n";
				}
			}

			prompt_text += "\nArriba están mis apuntes de " + window.subject_name + "\n\n";

			prompt_text += semantic_search_query;

			prompt_text += "\n\n";

			if (
				question_form.querySelectorAll(
					"form[name='questionForm'] input[ng-click*='onSingleAnswer'], form[name='questionForm'] input[id*='true-false-answer-true']",
				).length > 0
			) {
				prompt_text += "Selecciona la opción correcta";
			} else {
				prompt_text +=
					"Selecciona las opciones que sean correctas, pueden ser varias";
			}

			question_textarea.value = prompt_text;

			setTimeout(() => {
				copy_to_clipboard(question_form);
			}, 100);
		} catch (error) {
			console.error(error);
		}
	}

	function copy_to_clipboard(question_form) {
		const question_textarea = question_form.querySelector(
			".autoevaluations-assistant-textarea",
		);
		question_textarea.select();
		document.execCommand("copy");
	}

	function get_question(question_form, format) {
		const question_title = question_form.querySelector("h3").innerText;
		const question_text = question_form
			.querySelector("div[role='presentation']")
			.innerText.replace(/\n+/g, "\n")
			.replace(/\s+/g, " ")
			.trim();

		var question_options = [];

		const question_options_elements = question_form.querySelectorAll(
			".multiple-answer-answers-container input, .true-false-answers input",
		);

		for (var j = 0; j < question_options_elements.length; j++) {
			const option = question_options_elements[j];
			const option_text = document.querySelector(
				"label[for='" + option.id + "']",
			).innerText;
			question_options.push(option_text);
		}

		if (format === "save") {
			var options_text = "";

			for (var k = 0; k < question_options.length; k++) {
				options_text += "[ ]" + question_options[k] + "\n";
			}

			return (
				question_title + "\n\n" + question_text + "\nOpciones:\n" + options_text
			);
		} else if (format === "prompt") {
			return question_text + "\nOpciones:\n" + question_options.join("\n");
		}
	}

	function get_images() {
		// get all step images
		const images = document.querySelectorAll(".step img");
		if (images && images.length > 0) {
			log("Found " + images.length + " images on this page.");
			var urls = [];

			let content = "";

			const title = document.querySelector("h1").innerText;

			content += "## " + title + "\n\n";

			const prefix = snake_case(title);

			for (var i = 0; i < images.length; i++) {
				const number_with_leading_zero = ("0" + (i + 1)).slice(-2);

				const step_title = images[i]
					.closest(".step")
					.querySelector("h3 > span.text-xl > span").innerText;

				const step_description = images[i]
					.closest(".step")
					.querySelector("p").innerText;

				const suffix = snake_case(step_title);

				// create a filename for the image
				const file_name =
					prefix + number_with_leading_zero + "_" + suffix + ".webp";

				content += i + 1 + ". " + step_description + "\n\n";

				content +=
					"![" +
					step_title +
					"](https://raw.githubusercontent.com/wiki/github_user/wiki_name/wiki_images_path/" +
					file_name +
					")\n\n";

				urls.push({
					src: images[i].src,
					filename: file_name,
				});
			}

			//create a base64 encoded string from the content
			const base64 = btoa(content);

			//create a data url from the base64 encoded string
			const dataUrl = "data:text/plain;base64," + base64;

			//add the markdown file to the urls array
			urls.push({
				src: dataUrl,
				filename: prefix + ".md",
			});

			chrome.runtime.sendMessage({
				action: "download",
				urls: urls,
			});
		} else {
			log("No images found on this page.");
		}
	}

	function log(message) {
		console.log("Autoevaluations Assistant Extension:", message);
	}

	function snake_case(str) {
		return str
			.replace(/\W+/g, " ")
			.split(/ |\B(?=[A-Z])/)
			.map((word) => word.toLowerCase())
			.join("_");
	}
})();
