const getAmountByPhone = (phone) => {
  if (phone.match(/[0-9]/g)) {
    return phone.match(/[0-9]/g).reduce((a, b) => +a + +b)
  }

  return 0
}

const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const getRandomResponse = () => {
  return responses[getRandomInt(0, responses.length - 1)]
}

const responses = [ 'error.json', 'progress.json', 'success.json' ]

const { email, phone } = {
  email: /[a-zA-Z-0-9-а-яА-Я-ёЁ]{1,}@(ya.ru|yandex.ru|yandex.ua|yandex.by|yandex.kz|yandex.com)/i,
  phone: /\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}/i
}

const inputName = document.querySelector('.app__input[name=fio]')
const inputEmail = document.querySelector('.app__input[name=email]')
const inputPhone = document.querySelector('.app__input[name=phone]')

const submitButton = document.getElementById('submitButton')
const resultContainer = document.getElementById('resultContainer')

const MyForm = {
  validate: function() {
    const inputs = {
      fio: inputName.value.split(' ').length === 3,
      email: email.test(inputEmail.value),
      phone: phone.test(inputPhone.value) && getAmountByPhone(inputPhone.value) <= 30
    }

    return {
      isValid: Object.keys(inputs).every(item => inputs[item]),
      errorFields: Object.entries(inputs)
        .filter((item) => {
          if (!item[1]) {
            return item[0]
          }
        })
        .map((item) => {
          return item[0]
        })
    }
  },
  getData: function() {
    return {
      fio: inputName.value,
      email: inputEmail.value,
      phone: inputPhone.value
    }
  },
  setData: function(object) {
    if (object.fio) inputName.value = object.fio
    if (object.email) inputEmail.value = object.email
    if (object.phone) inputPhone.value = object.phone
  },
  submit: function() {
    const result = this.validate()

    if (!result.isValid) {
      result.errorFields.forEach((name) => {
        const item = document.querySelector(`.app__input[name=${name}]`)

        if (!item.classList.contains('error')) {
          item.classList.add('error')
        }
      })

      return false
    }

    submitButton.disabled = true
    submitButton.className += ' app__button--disabled'

    Array.from(document.querySelectorAll('.app__input.error')).forEach((item) => {
      item.classList.remove('error')
    })

    const xhr = new XMLHttpRequest()

    xhr.onload = function() {
      if (this.status === 200) {
        const json = JSON.parse(this.responseText)

        if (json.status === 'success') {
          resultContainer.className = 'success'
          resultContainer.textContent = 'Success'
        } else if (json.status === 'error') {
          resultContainer.className = 'error'
          resultContainer.textContent = json.reason
        } else if (json.status === 'progress') {
          setTimeout(() => {
            xhr.open('GET', `responses/${getRandomResponse()}`)
            xhr.send(null)
          }, json.timeout)
        }
      }
    }

    xhr.open('GET', `responses/${getRandomResponse()}`)
    xhr.send(null)
  }
}

submitButton.addEventListener('click', () => MyForm.submit())
