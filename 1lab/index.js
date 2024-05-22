///////////////////////////////////////////////////////////////////////////////////////////////////
// Лабораторная работа 1 по дисциплине МРЗвИС
// Выполнена студентами группы 121702 БГУИР Голушко Даниилом Сергеевичем и Нагла Никитой Юрьевичем
// Вариант 5: Алгоритм вычисления целочисленного частного пары 4-разрядных чисел
// делением с восстановлением частичного остатка

const addButton = document.getElementById('addValuesToQuery');
const oneTickButton = document.getElementById('oneTick')

let conveyor = {
    inputValues: [],
    queue: [null, null, null, null, null, null, null, null],
    outputValues: [],
    tick: 0,

    oneTick() {
        this.pushOutputValue()
        this.shiftValue()
        this.pushValue()
        this.calculateValues()
        this.increaseTick()
    },

    pushValue() {
        if (this.inputValues[0]) {
            this.queue[0] = generateDataStructure(this.inputValues[0])
            removeInputValueHTML()
            this.inputValues.pop()
        }
    },

    pushOutputValue() {
        if (this.queue[this.queue.length - 1]) {
            createOutputValueHTML(this.queue[this.queue.length - 1], this.tick)
            this.queue[this.queue.length - 1] = null
        }
    },

    shiftValue() {
        for (let i = this.queue.length - 1; i > 0; i--) {
            this.queue[i] = this.queue[i - 1]
        }
        this.queue[0] = null
    },

    calculateValues() {
        console.log('calc')
        for (let i = 0; i < this.queue.length; i++) {
            if (this.queue[i]) {
                console.log(this.queue[i])
                oneStage(this.queue[i])
            }
            changeElementContent(this.queue[i], i, this.tick)
        }
    },

    pushInputValue(value) {
        this.inputValues.push(value)
    },

    checkQueue() {
      for (let element of this.queue) {
          if (element !== null) {
              return true
          }
      }
      return false
    },

    increaseTick() {
        if (this.inputValues.length !== 0 || this.checkQueue()) {
            this.tick++
            changeTickContent(this.tick)
        }
    }

}

addButton.addEventListener('click', () => {

    let firstInput = document.querySelector('.dividend')
    let secondInput = document.querySelector('.divisor')

    let values = {
        firstValue: firstInput.value,
        secondValue: secondInput.value
    }

    if (checkValues(values)) {
        conveyor.pushInputValue(values)
        createInputValuesHTML(
            conveyor.inputValues[conveyor.inputValues.length - 1].firstValue,
            conveyor.inputValues[conveyor.inputValues.length - 1].secondValue
        )
    }
})

oneTickButton.addEventListener('click', () => {
    conveyor.oneTick()
})

const changeTickContent = (tick) => {
    const el = document.getElementById(`tick`)

    el.textContent = `Temp tick is: ${tick}`
}

const changeElementContent = (value, index) => {
    const el = document.getElementById(`${index + 1}Label`)

    if (value !== null) {
        el.textContent = `quotient(P): ${value.P.value.join('')},
                      dividend(A): ${value.A.join('')},
                      divisor(B): ${value.B.join('')},
                      result: ${value.result}`
    } else {
        console.log(el)
        el.textContent = `quotient(P): --------,
                      dividend(A): --------,
                      divisor(B): --------,
                      result: ----`
    }

}

const findLastElement = () => {
    let buttonElement = document.getElementById('oneTick');
    let ticksElement = document.getElementById('ticks');

    let lastElement = null
    let nextElement = buttonElement.nextElementSibling
    while (nextElement !== ticksElement) {
        lastElement = nextElement
        nextElement = nextElement.nextElementSibling
    }

    return lastElement
}

const removeInputValueHTML = () => {
    const el = findLastElement()
    el.remove()
}

const createOutputValueHTML = (value, tick) => {
    const newElement = document.createElement("div")
    newElement.setAttribute('id', 'outputValue')
    let beforeElement = document.getElementById('outputValue')
    const newContent = document.createTextNode(
        `Result: ${value.A.join('')},
              remainder: ${value.P.value.join('')},
              quantity of ticks: ${tick}`
    )
    newElement.append(newContent)

    if (beforeElement) {
        beforeElement.parentNode.insertBefore(newElement, beforeElement)
    } else {
        document.body.append(newElement)
    }
}

const createInputValuesHTML = (firstInput, secondInput) => {
    const newElement = document.createElement("div")
    let id = "inputValue" + (conveyor.inputValues.length - 1)
    let beforeElement = document.getElementById(id)
    if (!beforeElement) {
        beforeElement = document.getElementById("ticks")
    }
    newElement.setAttribute("id", `inputValue${conveyor.inputValues.length}`)

    const newContent = document.createTextNode(
        `${conveyor.inputValues.length}. Value 
             divisor: ${firstInput},
             dividend: ${secondInput},`
    )

    newElement.append(newContent)

    beforeElement.parentNode.insertBefore(newElement, beforeElement)

}

const generateDataStructure = (pairValues) => {
    let A = pairValues.firstValue.split('').map(Number)
    let B = pairValues.secondValue.split('').map(Number)
    let isNegative = false

    return {
        P: {
            isNegative: false,
            value: [0, 0, 0, 0],
        },
        A: A,
        B: B,
        isNegative: isNegative
    }
}

const oneStage = (tempData) => {
    shiftValues(tempData)
    subtract(tempData)
    if (tempData.P.isNegative === true) {
        tempData.A.push(0)
        tempData['result'] = '-' + tempData.P.value.join('')
        subtract(tempData)
        tempData.P.isNegative = false
    } else {
        tempData.A.push(1)
        tempData['result'] = '+' + tempData.P.value.join('')
    }
}

const shiftValues = (dataStructure) => {

    let shiftedValue = dataStructure.A.shift()
    dataStructure.P.value.push(shiftedValue)
    dataStructure.P.value.shift()
}

const transform = (copy, tempIndex) => {
    let index = 0
    for (let i = tempIndex; i >= 0; i--) {
        if (copy[i] === 1) {
            copy[i] = 0
            index = i
        }
    }
    for (let i = index + 1; i <= tempIndex; i++) {
        copy[i] = 1
    }
}

const compareBitNumbers = (dataStructure) => {
    for (let i = 0; i < dataStructure.P.value.length; i++) {
        if (dataStructure.P.value[i] < dataStructure.B[i]) {
            dataStructure.P.isNegative = true
            return
        } else if (dataStructure.P.value[i] > dataStructure.B[i]) {
            dataStructure.P.isNegative = false
            return
        }
    }
    dataStructure.P.isNegative = false
}

const calculate = (subtrahend, minuend) => {
    for (let i = minuend.length - 1; i >= 0; i--) {
        if (minuend[i] > subtrahend[i]) {
            minuend[i] = 1
        } else if (minuend[i] === subtrahend[i]) {
            minuend[i] = 0
        } else {
            transform(minuend, i)
            minuend[i] = 1
        }
    }
    return minuend
}

const subtract = (dataStructure) => {
    compareBitNumbers(dataStructure)
    if (dataStructure.P.isNegative === true) {
        let copyB = [...dataStructure.B]
        dataStructure.P.value = calculate(dataStructure.P.value, copyB)
    } else {
        dataStructure.P.value = calculate(dataStructure.B, dataStructure.P.value)
    }
}

const checkContentFirstValue = (value) => {
    return (/^[10]{8}$/.test(value))
}

const checkContentSecondValue = (secondValue) => {
    if (/^0{4}$/.test(secondValue)) {
        return false
    }
    return (/^[10]{4}$/.test(secondValue))
}

const checkValues = (values) => {
    return (checkContentFirstValue(values.firstValue) && checkContentSecondValue(values.secondValue));
}