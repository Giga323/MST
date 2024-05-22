///////////////////////////////////////////////////////////////////////////////////////////////////
// Лабораторная работа 2 по дисциплине МРЗвИС
// Выполнена студентами группы 121702 БГУИР Голушко Даниилом Сергеевичем и Нагла Никитой Юрьевичем
// Вариант 13: получить С - матрицу значений соответствующей размерности pxq
// (~) - (2) - x /2\ y = x * y
// /~\ - (3) - x /3\ y = max({x + y - 1} U {0})

function matrixData(A, B, E, G, numRow, numCol, T, M) {
    this.A = A,
    this.B = B,
    this.E = E,
    this.G = G,
    this.T = T,
    this.C = [],
    this.numRow = numRow;
    this.numCol = numCol;
    this.isCalculated = false,
    this.M = M,

    this.generateFirstMatrixC = () => {
        for (let i = 0; i < this.numRow; i++) {
            let row = [];
            for (let j = 0; j < this.numCol; j++) {
                fillRow(row, 0);
            }
            this.C.push(row);
        }
    }
}

let SIMD = {

    data: {},
    quantityOfProcessors: 12,
    seqMetrics: {
        sum: 0,
        mult: 0,
        diff: 0
    },

    parallelMetrics: {
        sum: 0,
        mult: 0,
        diff: 0
    },

    LAVG: {
        firstSum: 0,
        secondSum: 0,
    },

    seqTick: 0,
    parallelTick: 0,

    calculate() {
        this.data.generateFirstMatrixC();
        for (let i = 0; i < this.data.numRow; i++) {
            for (let j = 0; j < this.data.numCol; j++) {
                this.calculateElementMatrixC(i, j);
            }
        }
        return this.data.C;
    },

    calculateElementMatrixC(i, j) {
        let tickBefore = 0 + this.seqTick;
        let kf = this.calculateKF(i, j);
        let d = this.calculateD(i, j);
        this.data.C[i][j] = this.calculateC(kf, this.data.G[i][j], d);

        let tickAfter = 0 + this.seqTick;
        this.parallelTick += Math.ceil((tickAfter - tickBefore) / this.quantityOfProcessors); 
    },

    /*Mult = 7, Sum = 2, Diff = 3*/ 
    calculateC (kf, g, d) {
        let first = this.multiplication(this.multiplication(kf, this.difference(this.multiplication(3, g), 2)), g);

        let second = this.multiplication(this.difference(1, g), this.multiplication(this.summa(d, this.difference(
            this.multiplication(4, this.function2(kf, d)), this.multiplication(3, d)
        )), g));

        return this.summa(first, second);
    },
    
    calculateKF (i, j) {
        let values = []
    
        for (let k = 0; k < this.data.M; k++) {
            values.push(this.calculateF(this.data.A[i][k], this.data.B[k][j], this.data.E[0][k]));
        }
        values = this.conjunctionK(values);
        return values;
    },
    
    /*Mult = 6, Sum = 2, Diff = 3 */
    calculateF (a, b, e) {
        let first = this.multiplication(
                this.multiplication(
                    this.implication(a, b),
                    this.difference(this.multiplication(2, e), 1)
                ), e
            )



        let second = this.multiplication(
            this.implication(b, a),
            this.multiplication(
                this.summa(1, this.multiplication(
                    this.difference(
                        this.multiplication(4, this.implication(a, b)),
                        2),
                    e)) , this.difference(1, e))
        )

        return this.summa(first, second);
    },
    
    calculateD (i, j) {
        let values = [];
    
        for (let k = 0; k < M; k++) {
            values.push(this.function3(this.data.A[i][k], this.data.B[k][j]));
        }

        return values;
    },

    /*Mult = M*/
    conjunctionK (values) {
        return values.reduce((value, accumulator) => {
            return this.multiplication(value, accumulator);
        }, 1)
    },
    
    /*Diff = 1*/
    disjunctionK (values) {
        return this.difference(1, this.conjunctionK(values));
    },
    
    /*Diff = 1, Sum = 1*/
    implication (x, y) {
        let res = this.summa(this.difference(1, x), y);
        return (res < 1) ? res : 1;
    },

    multiplication(x, y) {
        this.seqTick++;
        return x * y;
    },

    summa(x, y) {
        this.seqTick++;
        return x + y;
    },

    difference(x, y) {
        this.seqTick++;
        return x - y;
    },
    
    /*function 2 /~\*/
    /*Mult = 1*/
    function2 (x, y) {
        return this.multiplication(x, y);
    },
    
    /*function 3 /~\*/
    /*Sum = 1, Diff = 1 */
    function3 (x, y) {
        let res = this.difference(this.summa(x, y), 1);
        return (res > 0) ? res : 0;
    },

    sequentialTime() {
        return this.seqTick;
    },

    parallelTime() {
        return this.parallelTick;
    },

    calculateAcceleration() {
        return this.seqTick / this.parallelTick;
    },

    calculateEfficiency() {
        return this.calculateAcceleration() / (this.quantityOfProcessors);
    },

    caclulateDivergenceCoefficient() {
        return 2 * this.sequentialTime() / (this.data.A[0].length * this.data.B[0].length);
    },

    getMetrics() {
        return {
            T:  this.sequentialTime(),
            Tn: this.parallelTime(),
            a:  this.calculateAcceleration(),
            e:  this.calculateEfficiency(),
            d:  this.caclulateDivergenceCoefficient(),
        }
    }
    
}

const transformContent = (content) => {
    let htmlString = '';
    
    for (let row of content) {
        htmlString += '<div class="row">';
        for (let el of row) {
            htmlString += `<div class="el">${el}</div>`;
        }
        htmlString += '</div>';
    }

    return htmlString;
}

const insertAfter = (refNode, newNode) => {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}

const getTicks = () => {
    const Tsum = Number(document.getElementById('sum').value);
    const Tdiff = Number(document.getElementById('diff').value);
    const Tmult = Number(document.getElementById('mult').value);

    return {
        sum: Tsum,
        mult: Tmult,
        diff: Tdiff,
    };
}

const checkTicks = () => {
    let T = getTicks();

    if (Number(T.sum) < 1 || Number(T.diff) < 1 || Number(T.mult) < 1) {
        return false;
    } else {
        return true;
    }
}

const generateMatrices = () => {

    const P = document.getElementById('P').value;
    const M = document.getElementById('M').value;
    const Q = document.getElementById('Q').value;

    if (Number(P) <= 0 || Number(M) <= 0 || Number(Q) <= 0) {
        const error = document.getElementById('error');
        error.innerHTML = 'incorrect data';
    } else {
        error.innerHTML = '';
        let A = generateMatrix(P, M);
        let B = generateMatrix(M, Q);
        let E = generateMatrix(1, M);
        let G = generateMatrix(P, Q);
    
        return { A, B, E, G, P, M, Q };
    }
    
    return { };
}

const createNewNode = (content, key) => {
    return `<div class="name">Matrix ${key}</div>
                <div class="matrix">${transformContent(content)}</div>`
}

const printInputData = (matrixData) => {
    const valuesContainer = document.getElementById('valuesContainer');
    valuesContainer.innerHTML = '';
    let keys = ['A', 'B', 'E', 'G'];

    for (let key of keys) {
        valuesContainer.innerHTML += createNewNode(matrixData[key], key);
    }
}


const buttonGenerate = document.getElementById('buttonGenerate');
buttonGenerate.addEventListener('click', () => {
    let matrices = generateMatrices();

    if (!checkTicks()) {
        const error = document.getElementById('error');
        error.innerHTML = 'incorrect data';

        return;  

    } else {
        error.innerHTML = '';

        let T = getTicks();

        let matrix = new matrixData(
            matrices.A,
            matrices.B,
            matrices.E,
            matrices.G,
            Number(matrices.P),
            Number(matrices.Q),
            T,
            matrices.M
        );
        SIMD.data = matrix;
        SIMD.LAVG = 0;
        SIMD.seqTick = 0;
        SIMD.parallelTick = 0;
        
        printInputData(matrix)
    }

})

const printMetrics = (values) => {
    
    const metrics = document.getElementById('metrics');
    metrics.innerHTML = '';
    for (let value in values) {
        metrics.innerHTML += `${value}: ${values[value]}        `;
    }
}

const printResult = (value) => {

    const resultValuesContainer = document.getElementById('resultValuesContainer');
    resultValuesContainer.innerHTML = '';
    resultValuesContainer.innerHTML = createNewNode(value, 'C');
    
}

const buttonCalculate = document.getElementById('buttonCalculate');
buttonCalculate.addEventListener('click', () => {
    let C = SIMD.calculate();

    printResult(C);
    printMetrics(SIMD.getMetrics());
})

const addMatrixToHTML = (matrix, id) => {
    matrix.map((row) => {
        row = row.map((el) => {
            return `<div class="column">${el}</div>`;
        })
        id.innerHTML += `<div class="row">${row.join(' ')}</div>`;
    })
}

const clearInnerHTML = (matrixes) => {
    for (let matrix of matrixes) {
        matrix.innerHTML = `<div class="name">Matrix ${matrix.id}: </div>`;
    }
}

const fillRow = (row, value) => {
    return row.push(value)
}

const generateMatrix = (numRow, numCol) => {
    let matrix = [];
    for (let i = 0; i < numRow; i++) {
        let row = [];
        for (let j = 0; j < numCol; j++) {
            fillRow(row, generateNumber());
        }
        matrix.push(row);
    }
    return matrix;
}

const generateNumber = () => {
    return Math.random() * 2 - 1;
}