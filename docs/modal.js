/***[ DOM Elements ]***
 **********************/
const navbar = document.getElementById("myTopnav");
const modalBtn = document.querySelectorAll('.modal-btn');
const modalbg = document.querySelector('.bground');
const modalBody = modalbg.querySelector('.modal-body');
const modalCloseBtn = modalbg.querySelector('.close');
const modalFinishBtn = modalbg.querySelector('#thank-you .button');
const form = document.querySelector('#reserve-form');
/** @type {HTMLInputElement[]} */
const inputCheckboxes = Array.from(form.querySelectorAll('input[type="text"], input[type="email"], input[type="date"], input[type="number"], input[type="checkbox"], input[type="radio"]').values());
const inputs = inputCheckboxes.splice(0, 5);
const inputCities = inputCheckboxes.splice(0, 6);



/***[ FORM VALIDATION VARS ]***
 ******************************
 * @typedef {'first' | 'last' | 'email' | 'birthdate' | 'quantity' | 'location' | 'cgu' | 'next-events'} IField
 * 
 * @typedef {(i: HTMLInputElement) => any} ExtractHelper
 * @typedef {(v: any) => any} FormatHelper
 * @typedef {(v: any) => true | string} ValidationHelper
 * @typedef {string | undefined} IError
 * @typedef {number | undefined} ITimer
 * 
 * @typedef {{
 *	input?: HTMLInputElement,
 *	inputs?: NodeListOf<HTMLInputElement>,
 *	extractValue: ExtractHelper,
 *	formatValue: FormatHelper,
 *	validation: ValidationHelper,
 *	error: IError,
 *	timer: ITimer
 * }} IFieldHelper<F extends IField>
 * 
 * @type {Record<IField, IFieldHelper>} */
const FORM = {
	first: {
		input: form.querySelector('#first'),
		extractValue: (i) => i.value,
		formatValue: (v) => v,
		validation: (v) => {
			if (v.length > 1) return true;
			return 'Veuillez entrer 2 caractères ou plus pour le champ du prénom.';
		},
		error: undefined,
	},
	last: {
		input: form.querySelector('#last'),
		extractValue: (i) => i.value,
		formatValue: (v) => v,
		validation: (v) => {
			if (v.length > 1) return true;
			return 'Veuillez entrer 2 caractères ou plus pour le champ du nom.';
		},
		error: undefined,
	},
	email: {
		input: form.querySelector('#email'),
		extractValue: (i) => i.value,
		formatValue: (v) => v,
		validation: (v) => {
			if (v.length === 0) return 'Veuillez entrer une adresse email.';
			const match = v.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/);
			if (match === null) return 'Veuillez entrer une adresse email valide.';
			return true;
		},
		error: undefined,
	},
	birthdate: {
		input: form.querySelector('#birthdate'),
		extractValue: (i) => i.value,
		formatValue: (v) => v === '' ? null : new Date(v),
		validation: (v) => {
			if (v === null) return 'Veuillez entrer votre date de naissance.';
			const now = Date.now();
			if (v >= now) return 'Vous n\'êtes pas né dans le futur. ;)';
			if (now - v > 1000 * 60 * 60 * 24 * 365 * 150) return 'Vous n\'avez pas plus de 150 ans. ;)';
			return true;
		},
		error: undefined,
	},
	quantity: {
		input: form.querySelector('#quantity'),
		extractValue: (i) => i.value.length > 0 ? i.value : null,
		formatValue: (v) => v !== null ? Number(v) : v,
		validation: (v) => {
			if (v === null) return 'Veuillez entrer le nombre de tournoi auxquels vous avez déjà participé.'
			if (v === NaN) return 'Veuillez entrer un nombre.';
			if (v < 0) return 'Veuillez entrer un nombre supérieur ou égal à 0 (zéro).'
			return true;
		},
		error: undefined,
	},
	location: {
		inputs: form.querySelectorAll('.cities input'),
		extractValue: (i) => i.checked === true ? i.value : null,
		formatValue: (v) => v,
		validation: (v) => {
			if (v === null) return 'Veuillez préciser le tournoi auquel vous souhaitez participer.';
			return true;
		},
		error: undefined,
	},
	cgu: {
		input: form.querySelector('#cgu'),
		extractValue: (i) => i.checked === true,
		formatValue: (v) => v,
		validation: (v) => (v === true || 'Vous devez vérifier que vous acceptez les termes et conditions.'),
		error: undefined,
	},
	"next-events": {
		input: form.querySelector('#next-events'),
		extractValue: (i) => i.checked,
		formatValue: (v) => Boolean(v),
		validation: (v) => true,
		error: undefined,
	},
};

/***[ NAVBAR FUNCTIONS ]***
 **************************/
/** Toggle navigation between desktop & mobile state */
function editNav() {
	navbar.classList.toggle("responsive");
}



/***[ MODAL FUNCTIONS ]***
 *************************/
/** Launch modal form */
function launchModal() {
	modalbg.classList.add('open');
	const firstInput = form.querySelector('input');
	firstInput.focus();
}
/** Close modal form
 * @param {MouseEvent | undefined} event Event that triggers this function, if exist. */
function closeModal(event = undefined) {
	if (event) {
		event.preventDefault();
	}
	if (modalbg.classList.contains('open')) {
		modalbg.classList.remove('open');
	}
	resetModal();
}
/** Reset modal form values */
function resetModal() {
	form.reset();
	setTimeout(() => modalBody.classList.remove('thank-you'), 300);
}



/***[ FORM FUNCTIONS ]***
 ************************/
/** Retrieve form data and format them to a classic object
 * @returns {Record<string, unknown>} */
function getFormData() {
	const json = {};
	Object.keys(FORM).forEach(id => {
		const helpers = FORM[id];

		if (helpers.input !== undefined) {
			json[id] = helpers.formatValue(helpers.extractValue(helpers.input));
		} else if (helpers.inputs !== undefined) {
			json[id] = [];
			helpers.inputs.forEach(input => {
				json[id].push(helpers.formatValue(helpers.extractValue(input)));
			});
			json[id] = json[id].filter(v => v !== null)[0] || null;
		}
	});

	return json;
}
/** Validate a single form field
 * @param {string} name Field name to validate the value
 * @param {unknown} value Value to validate for given field name
 * @returns {boolean} */
function valid(name, value) {
	const helpers = FORM[name];

	const validOrError = helpers ? helpers.validation(value) : true;
	helpers.error = validOrError === true ? '' : validOrError;

	return validOrError === true;
}
/** Modal form validate process
 * @param {Record<string, unknown>} data 
 * @returns {boolean} */
function validate(data) {
	const keys = Object.keys(data);
	const valids = keys.map(key => valid(key, data[key]));

	const errors = valids.map((v, i) => v ? 'true' : i)
		.filter(v => v !== 'true')
		.map(idx => keys[idx]);

	return errors.length === 0;
}
/** Modal form submit process
 * @param {SubmitEvent | undefined} event */
function submit(event = undefined) {
	if (event) event.preventDefault();

	const data = getFormData();
	const validation = validate(data);

	if (validation) {
		modalBody.classList.add('thank-you');
	} else {
		Object.keys(FORM).forEach(key => {
			const helpers = FORM[key];
			let elem;
			const error = helpers.error;

			switch (key) {
				case 'location':
					elem = form.querySelectorAll(`input[name="${key}"]`);
					if (helpers.error !== '') {
						showError(elem[0].parentNode, { id: key });
					} else {
						hideError(elem[0].parentNode, { ...elem, id: key });
					}
					break;
				default:
					elem = form.querySelector(`#${key}`);
					if (error !== '') {
						console.log(key, helpers.error);
						showError(elem.parentNode, elem);
					}
					break;
			}
		});
		form.checkValidity();
	}
}

function showError(formData, input) {
	const helpers = FORM[input.id];

	if (helpers.error !== undefined)
		formData.dataset.errorVisible = 'true';
	formData.dataset.error = helpers.error || formData.dataset.error;
}
function hideError(formData, input, force = false) {
	const helpers = FORM[input.id];

	delete formData.dataset.errorVisible;
	delete formData.dataset.error;

	if (force !== true && !valid(input.id, helpers.formatValue(helpers.extractValue(input)))) {
		showError(formData, input);
	}
}



/***[ LOGIC ]***
 ***************/
form.addEventListener('submit', submit, false);
modalBtn.forEach((btn) => btn.addEventListener('click', launchModal));
modalCloseBtn.addEventListener('click', closeModal);
modalFinishBtn.addEventListener('click', closeModal);