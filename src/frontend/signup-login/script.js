const form = document.getElementById('form')
const username_input = document.getElementById('usernameInput')
const email_input = document.getElementById('emailInput')
const password_input = document.getElementById('passwordInput')
const confirm_password_input = document.getElementById('confirmPasswordInput')
const error_message = document.getElementById('errorMessage')

form.addEventListener('submit', (e) => {
  let errors = []

  if(username_input){
    errors = isSignupValid(username_input.value, email_input.value, password_input.value, confirm_password_input.value)
  }
  else{
    errors = isLoginValid(email_input.value, password_input.value)
  }

  if(errors.length > 0){
    // If there are any errors
    e.preventDefault()
    error_message.innerText  = errors.join(". ")
  }
})

function isSignupValid(username, email, password, confirmPassword){
  let errors = []

  if(username === '' || username == null){
    errors.push('Username is required')
    username_input.parentElement.classList.add('incorrect')
  } else if(username.length < 3){
    errors.push('Username must be at least 3 characters')
    username_input.parentElement.classList.add('incorrect')
  } else if(username.length > 20){
    errors.push('Username must at less than 20 characters')
    username_input.parentElement.classList.add('incorrect')
  }
  if(email === '' || email == null){
    errors.push('Email is required')
    email_input.parentElement.classList.add('incorrect')
  }
  if(password === '' || password == null){
    errors.push('Password is required')
    password_input.parentElement.classList.add('incorrect')
  } else if(password.length < 6){
    errors.push('Password must be at least 6 characters')
    password_input.parentElement.classList.add('incorrect')
  } else if(password.length > 30){
    errors.push('Password must at less than 30 characters')
    password_input.parentElement.classList.add('incorrect')
  }
  if(confirmPassword === '' || confirmPassword == null){
    errors.push('Confirm Password is required')
    confirm_password_input.parentElement.classList.add('incorrect')
  } else if(password !== confirmPassword){
    errors.push('Passwords do not match')
    password_input.parentElement.classList.add('incorrect')
    confirm_password_input.parentElement.classList.add('incorrect')
  }
  return errors;
}

function isLoginValid(email, password){
  let errors = []

  if(email === '' || email == null){
    errors.push('Email is required')
    email_input.parentElement.classList.add('incorrect')
  }
  if(password === '' || password == null){
    errors.push('Password is required')
    password_input.parentElement.classList.add('incorrect')
  }
  
  return errors;
}

const allInputs = [username_input, email_input, password_input, confirm_password_input].filter(input => input != null)

allInputs.forEach(input => {
  input.addEventListener('input', () => {
    if(input.parentElement.classList.contains('incorrect')){
      input.parentElement.classList.remove('incorrect')
      error_message.innerText = ''
    }
  })
})