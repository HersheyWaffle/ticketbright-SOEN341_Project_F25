const form = document.getElementById('form')
const username_input = document.getElementById('usernameInput')
const email_input = document.getElementById('emailInput')
const password_input = document.getElementById('passwordInput')
const confirm_password_input = document.getElementById('confirmPasswordInput')
const error_message = document.getElementById('errorMessage')
const role_select = document.getElementById("roleSelect");
const org_name_group = document.getElementById("organizationNameGroup");
const org_type_group = document.getElementById("organizationTypeGroup");
const org_name_input = document.getElementById("organizationNameInput");
const org_type_select = document.getElementById("organizationTypeSelect");

function updateOrganizerFields() {
  const role = role_select.value;

  if (role === "organizer") {
    org_name_group.style.display = "flex";
    org_type_group.style.display = "flex";
  } else {
    org_name_group.style.display = "none";
    org_type_group.style.display = "none";
    org_name_input.value = "";
    org_type_select.value = "";
  }
}

role_select.addEventListener("change", updateOrganizerFields);
updateOrganizerFields();

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const errors = isSignupValid(
    username_input.value,
    email_input.value,
    password_input.value,
    confirm_password_input.value
  );

  if (errors.length > 0) {
    error_message.innerText = errors.join(". ");
    return;
  }

  const role = document.getElementById("roleSelect").value;

  const organizationName = org_name_input.value.trim();
  const organizationType = org_type_select.value;

  if (role === "organizer") {
    if (!organizationName) {
      error_message.innerText = "Organization name is required for organizers.";
      org_name_input.parentElement.classList.add("incorrect");
      return;
    }
    if (!organizationType) {
      error_message.innerText = "Organization type is required for organizers.";
      org_type_select.parentElement.classList.add("incorrect");
      return;
    }
  }

  const userData = {
    username: username_input.value,
    email: email_input.value,
    password: password_input.value,
    role,
    organizationName: role === "organizer" ? organizationName : null,
    organizationType: role === "organizer" ? organizationType : null,
  };

  try {
    const res = await fetch("/api/users/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || "Signup failed");
    alert(data.message);
    window.location.href = "login.html";
  } catch (err) {
    error_message.innerText = err.message;
  }
});

function isSignupValid(username, email, password, confirmPassword) {
  let errors = []

  if (username === '' || username == null) {
    errors.push('Username is required')
    username_input.parentElement.classList.add('incorrect')
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters')
    username_input.parentElement.classList.add('incorrect')
  } else if (username.length > 20) {
    errors.push('Username must at less than 20 characters')
    username_input.parentElement.classList.add('incorrect')
  }
  if (email === '' || email == null) {
    errors.push('Email is required')
    email_input.parentElement.classList.add('incorrect')
  }
  if (password === '' || password == null) {
    errors.push('Password is required')
    password_input.parentElement.classList.add('incorrect')
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters')
    password_input.parentElement.classList.add('incorrect')
  } else if (password.length > 30) {
    errors.push('Password must at less than 30 characters')
    password_input.parentElement.classList.add('incorrect')
  }
  if (confirmPassword === '' || confirmPassword == null) {
    errors.push('Confirm Password is required')
    confirm_password_input.parentElement.classList.add('incorrect')
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match')
    password_input.parentElement.classList.add('incorrect')
    confirm_password_input.parentElement.classList.add('incorrect')
  }
  return errors;
}

function isLoginValid(email, password) {
  let errors = []

  if (email === '' || email == null) {
    errors.push('Email is required')
    email_input.parentElement.classList.add('incorrect')
  }
  if (password === '' || password == null) {
    errors.push('Password is required')
    password_input.parentElement.classList.add('incorrect')
  }

  return errors;
}

const allInputs = [
  username_input, email_input, password_input, confirm_password_input,
  org_name_input, org_type_select
].filter(x => x != null)

allInputs.forEach(input => {
  input.addEventListener('input', clearIncorrect);
  input.addEventListener('change', clearIncorrect);
});

function clearIncorrect(e) {
  const el = e.target;
  if (el.parentElement.classList.contains('incorrect')) {
    el.parentElement.classList.remove('incorrect');
    error_message.innerText = '';
  }
}