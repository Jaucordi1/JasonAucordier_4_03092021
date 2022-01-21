/***[ DOM Elements ]***
 **********************/
const navbar = document.getElementById("myTopnav");
const navbarOpener = navbar.querySelector('.icon');
const modalBtn = document.querySelectorAll('.modal-btn');
const modalbg = document.querySelector('.bground');
const modalBody = modalbg.querySelector('.modal-body');
const modalCloseBtn = modalbg.querySelector('.close');
const modalFinishBtn = modalbg.querySelector('#thank-you .button');
const form = document.querySelector('#reserve-form');
/** @type {HTMLInputElement[]} */
const inputCheckboxes = Array.from(
	form.querySelectorAll(
		'input[type="text"], input[type="email"], input[type="date"], input[type="number"], input[type="checkbox"], input[type="radio"]'
	).values()
);
const inputs = inputCheckboxes.splice(0, 5);
const inputCities = inputCheckboxes.splice(0, 6);



/***[ FORM VALIDATION VARS ]***
 ******************************/
/**
 * @typedef {'first' | 'last' | 'email' | 'birthdate' | 'quantity' | 'location' | 'cgu' | 'next-events'} IField
 *
 * @typedef {(i: HTMLInputElement) => } ExtractHelper
 * @typedef {(v: any) => O} FormatHelper<O>
 * @typedef {(v: any) => true | string} ValidationHelper
 * @typedef {string | undefined} IError
 *
 * @typedef {{
 *	input?: HTMLInputElement,
 *	inputs?: NodeListOf<HTMLInputElement>,
 *	extractValue: ExtractHelper,
 *	formatValue: FormatHelper<IFormData<F>>,
 *	validation: ValidationHelper,
 *	error: IError
 * }} IFieldHelper<F extends IField>
 *
 * @type {{
 *	[K in IField]: IFieldHelper<K>
 * }} */
const FORM = {
	first: {
		input: form.querySelector('#first'),
		extractValue: (i) => i.value,
		formatValue: (v) => v.length > 0 ? v : null,
		validation: (v) => {
			if (v === null) return 'Veuillez entrer votre prénom.';
			if (v.length < 2) return 'Veuillez entrer 2 caractères ou plus pour le champ du prénom.';
			return true;
		},
		error: undefined,
	},
	last: {
		input: form.querySelector('#last'),
		extractValue: (i) => i.value,
		formatValue: (v) => v.length > 0 ? v : null,
		validation: (v) => {
			if (v === null) return 'Veuillez entrer votre nom.';
			if (v.length < 2) return 'Veuillez entrer 2 caractères ou plus pour le champ du nom.';
			return true;
		},
		error: undefined,
	},
	email: {
		input: form.querySelector('#email'),
		extractValue: (i) => i.value,
		formatValue: (v) => v.length > 0 ? v : null,
		validation: (v) => {
			if (v === null) return 'Veuillez entrer une adresse email.';
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

			const oneYear = 1000 * 60 * 60 * 24 * 365;
			if (v >= now - (oneYear * 3)) return 'Vous jouez avant vos 3 ans ?';

			const diff = now - v;
			if (diff > oneYear * 150) return 'Vous n\'avez pas plus de 150 ans. ;)';

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
	setTimeout(() => modalBody.classList.remove('thank-you'), 800);
}



/***[ FORM FUNCTIONS ]***
 ************************/
/** Retrieve form data and format them to a classic JavaScript object
 * @typedef {{
 *	first: string | null,
 *	last: string | null,
 *	email: string | null,
 *	birthdate: Date | null,
 *	quantity: number | null,
 *	location: string | null,
 *	cgu: boolean,
 *	'next-events': boolean
 * }} IFormData
 * @returns {IFormData} */
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
 * @template {keyof IFormData} K
 * @param {K} name Field name to validate the value
 * @param {IFormData[K]} value Value to validate for given field name
 * @returns {boolean} */
function valid(name, value) {
	const helpers = FORM[name];

	const validOrError = helpers ? helpers.validation(value) : true;
	helpers.error = validOrError === true ? '' : validOrError;

	return validOrError === true;
}
/** Validate retrieved form data
 * @param {IFormData} data 
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
		console.log('Data sent :', data);
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
						showError(elem.parentNode, elem);
					}
					break;
			}
		});
		form.checkValidity();
	}
}

/** Show error for given formData & input-like
 * @param {HTMLElement} formData
 * @param {HTMLInputElement | { id: string }} input
 */
function showError(formData, input) {
	const helpers = FORM[input.id];

	if (helpers.error !== undefined)
		formData.dataset.errorVisible = 'true';
	formData.dataset.error = helpers.error || formData.dataset.error;
}
/** Hide error (after doing a re-validate, or when forced) for given formData & input-like
 * @param {HTMLElement} formData
 * @param {HTMLInputElement | { id: string }} input
 * @param {boolean} force
 */
function hideError(formData, input, force = false) {
	const helpers = FORM[input.id];

	delete formData.dataset.errorVisible;
	delete formData.dataset.error;

	if (force !== true && !valid(input.id, helpers.formatValue(helpers.extractValue(input)))) {
		console.log('really on error');
		showError(formData, input);
	}
}



/***[ EVENTS BINDING ]***
 ************************/
form.addEventListener('submit', submit, false);
modalBtn.forEach((btn) => btn.addEventListener('click', launchModal));
modalCloseBtn.addEventListener('click', closeModal);
modalFinishBtn.addEventListener('click', closeModal);
navbarOpener.addEventListener('click', (ev) => {
	ev.preventDefault();
	editNav();
});

inputs.forEach((input) => {
	input.addEventListener('input', () => hideError(input.parentNode, input));
	input.addEventListener('blur', () => hideError(input.parentNode, input));
});
inputCities.forEach((input) => {
	input.addEventListener('input', () => hideError(input.parentNode, { id: input.name }, true));
	input.addEventListener('invalid', () => showError(input.parentNode, { id: input.name }));
});
inputCheckboxes.forEach((input) => {
	input.addEventListener('change', () => hideError(input.parentNode, input));
});