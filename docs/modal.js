function editNav() {
	const x = document.getElementById("myTopnav")
	if (x.className === "topnav") x.className += " responsive"
	else x.className = "topnav"
}

// DOM Elements
const form = document.querySelector('#reserve-form')
const modalbg = document.querySelector(".bground")
modalbg.addEventListener("click", ev => ev.target === modalbg ? closeModal() : null)
const modalBtn = document.querySelectorAll(".modal-btn")
const modalCloseBtn = modalbg.querySelector(".close")

// modal form submit
form.addEventListener("submit", (event) => {
	event.preventDefault()
	submit()
})

// launch modal event
modalBtn.forEach((btn) => btn.addEventListener("click", launchModal))

// close modal event
modalCloseBtn.addEventListener("click", ev => {
	ev.preventDefault();
	closeModal();
})

const FORM_VALIDATIONS = {
	first: (v) => v.length >= 3,
	last: (v) => v.length >= 3,
	quantity: (v) => v !== NaN && v >= 0,
	birthdate: (v) => v !== null ? v < Date.now() : false,
	cgu: (v) => v === true
}
const FORM_TYPES = {
	quantity: (v) => (Number(v) || 0),
	birthdate: (v) => {
		if (v === "") return null
		console.log(v)
		return new Date(v)
	},
	cgu: (v) => v === "on",
	next_events: (v) => v === "on"
}

function valid(name, value) {
	if (!FORM_VALIDATIONS.hasOwnProperty(name)) return true
	return FORM_VALIDATIONS[name](value)
}

function getFormData() {
	console.log("GetFormData");
	const data = new FormData(form)
	console.log(data);

	const json = {}
	for (const key of data.keys()) {
		let value = data.get(key)
		if (FORM_TYPES.hasOwnProperty(key)) value = FORM_TYPES[key](value)
		json[key] = value
	}

	return json
}

/**
 * Launch modal form
 */
function launchModal() {
	if (modalbg.classList.contains('closed'))
		modalbg.classList.remove('closed');
	modalbg.classList.add('open');
}

/**
 * Close modal form
 */
function closeModal() {
	if (modalbg.classList.contains('open'))
		modalbg.classList.remove('open');
	modalbg.classList.add('closed');
	resetModal();
}

/**
 * Reset modal form values
 */
function resetModal() {
	form.reset();
}

function validate(data) {
	console.log("Validate");
	const keys = Object.keys(data)
	const valids = keys.map(key => valid(key, data[key]))

	if (!valids.includes(false)) return true

	const errors = valids
		.map((v, i) => v || i)
		.filter(v => v !== true)
		.map(idx => keys[idx])

	console.log("ERRORS :", errors)

	return false
}

function submit() {
	console.log("Submit");
	const data = getFormData()
	console.log(data)
	if (validate(data)) {
		alert(`Hello ${data.first} ${data.last} !`)
	}
}
