
let pc = 0;
let ir = '';
let accumulator = 0;
let ram = [
    { address: 0, value: 'LOAD 6' },
    { address: 1, value: 'ADD 7' },
    { address: 2, value: 'STORE 6' },
    { address: 3, value: 'JUMP 1' },
    { address: 4, value: '0' },
    { address: 5, value: '0' },
    { address: 6, value: '1' },
    { address: 7, value: '1' },
    { address: 8, value: '0' },
    { address: 9, value: '0' },
    { address: 10, value: '0' },
    { address: 11, value: '0' },
    { address: 12, value: '0' },
    { address: 13, value: '0' },
    { address: 14, value: '0' },
    { address: 15, value: '0' },
];
let executionPhase = 'Fetch';
let currentMode = 'display';

const instructions = ['', 'LOAD', 'ADD', 'STORE', 'JUMP'];

function updateDisplay() {
    document.getElementById('pc').textContent = pc;
    document.getElementById('ir').textContent = ir;
    document.getElementById('accumulator').textContent = accumulator;

    const phases = document.getElementById('execution-phases').children;
    for (let i = 0; i < phases.length; i++) {
        phases[i].classList.remove('active-phase');
        phases[i].textContent = phases[i].textContent.replace('► ', '');
    }
    const activePhase = Array.from(phases).find(phase => phase.textContent.includes(executionPhase));
    activePhase.classList.add('active-phase');
    activePhase.textContent = '► ' + activePhase.textContent;

    updateRAMTable();
}

function updateRAMTable() {
    const ramTable = document.getElementById('ram-table').getElementsByTagName('tbody')[0];
    ramTable.innerHTML = '';
    for (const item of ram) {
        const row = ramTable.insertRow();
        row.insertCell(0).textContent = item.address;
        
        if (currentMode === 'edit') {
            const cell = row.insertCell(1);
            const [instruction, operand] = item.value.split(' ');
            
            const select = document.createElement('select');
            instructions.forEach(instr => {
                const option = document.createElement('option');
                option.value = instr;
                option.textContent = instr || '(empty)';
                option.selected = instr === instruction;
                select.appendChild(option);
            });
            
            const input = document.createElement('input');
            input.type = 'text';
            input.value = operand || '';
            
            cell.appendChild(select);
            cell.appendChild(input);
            
            const editCell = row.insertCell(2);
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.onclick = () => saveInstruction(item.address, select.value, input.value);
            editCell.appendChild(saveButton);
        } else {
            row.insertCell(1).textContent = item.value || '0';
        }
    }
}

function executeInstruction() {
    switch (executionPhase) {
        case 'Fetch':
            ir = ram[pc].value;
            executionPhase = 'Decode';
            break;
        case 'Decode':
            executionPhase = 'Execute';
            break;
        case 'Execute':
            const [operation, operand] = ir.split(' ');
            switch (operation) {
                case 'LOAD':
                    accumulator = parseInt(ram[parseInt(operand)].value) || 0;
                    break;
                case 'ADD':
                    accumulator += parseInt(ram[parseInt(operand)].value) || 0;
                    break;
                case 'STORE':
                    ram[parseInt(operand)].value = accumulator.toString();
                    break;
                case 'JUMP':
                    pc = (parseInt(operand) - 1 + ram.length) % ram.length;  // Ensure PC stays within bounds
                    break;
            }
            pc = (pc + 1) % ram.length;
            executionPhase = 'Fetch';
            break;
    }
    updateDisplay();
}

function clockTick() {
    if (currentMode === 'edit') {
        toggleMode();
    }
    executeInstruction();
}

function toggleMode() {
    currentMode = currentMode === 'display' ? 'edit' : 'display';
    const editColumns = document.getElementsByClassName('edit-column');
    for (let col of editColumns) {
        col.classList.toggle('hidden', currentMode === 'display');
    }
    document.getElementById('editIcon').classList.toggle('hidden', currentMode === 'edit');
    document.getElementById('viewIcon').classList.toggle('hidden', currentMode === 'display');
    updateDisplay();
}

function saveInstruction(address, instruction, operand) {
    if (instruction) {
        ram[address].value = `${instruction} ${operand}`.trim();
    } else {
        ram[address].value = operand.trim() || '0';
    }
    updateDisplay();
}

function toggleExplanation() {
    const explanation = document.getElementById('explanation');
    const button = document.getElementById('explanationToggle');
    if (explanation.classList.contains('visible')) {
        explanation.classList.remove('visible');
        button.textContent = 'Show Explanation';
    } else {
        explanation.classList.add('visible');
        button.textContent = 'Hide Explanation';
    }
}

function updateRAMTable() {
    const ramTable = document.getElementById('ram-table').getElementsByTagName('tbody')[0];
    ramTable.innerHTML = '';
    for (const item of ram) {
        const row = ramTable.insertRow();
        row.insertCell(0).textContent = item.address;

        if (currentMode === 'edit') {
            const cell = row.insertCell(1);
            const [instruction, operand] = item.value.split(' ');

            const inputGroup = document.createElement('div');
            inputGroup.className = 'input-group';

            const select = document.createElement('select');
            instructions.forEach(instr => {
                const option = document.createElement('option');
                option.value = instr;
                option.textContent = instr || '(empty)';
                option.selected = instr === instruction;
                select.appendChild(option);
            });

            const input = document.createElement('input');
            input.type = 'text';
            input.value = operand || '';

            inputGroup.appendChild(select);
            inputGroup.appendChild(input);
            cell.appendChild(inputGroup);

            const editCell = row.insertCell(2);
            const saveButton = document.createElement('button');
            saveButton.textContent = 'Save';
            saveButton.onclick = () => saveInstruction(item.address, select.value, input.value);
            editCell.appendChild(saveButton);
        } else {
            row.insertCell(1).textContent = item.value || '0';
        }
    }
}

// Initialize the display
updateDisplay();
