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
];
let executionPhase = 'Fetch';
let currentMode = 'display';
let hasChanges = false;

const instructions = ['', 'LOAD', 'ADD', 'STORE', 'JUMP'];

function updateDisplay() {
    document.getElementById('pc').textContent = pc;
    document.getElementById('ir').textContent = ir;
    document.getElementById('accumulator').textContent = accumulator;

    const phases = document.getElementById('execution-phases').children;
    for (const element of phases) {
        element.classList.remove('active-phase');
        element.textContent = element.textContent.replace('► ', '');
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
            
            select.onchange = () => checkForChanges();
            input.oninput = () => checkForChanges();
            
            cell.appendChild(select);
            cell.appendChild(input);
        } else {
            row.insertCell(1).textContent = item.value || '0';
        }
    }
    
    // Add a single Save button for all changes
    if (currentMode === 'edit') {
        const saveButtonRow = ramTable.insertRow();
        const saveButtonCell = saveButtonRow.insertCell(0);
        saveButtonCell.colSpan = 2;
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save All Changes';
        saveButton.onclick = saveAllChanges;
        saveButton.id = 'saveAllButton';
        saveButton.style.display = hasChanges ? 'block' : 'none';
        saveButtonCell.appendChild(saveButton);
    }
}

function checkForChanges() {
    const ramTable = document.getElementById('ram-table').getElementsByTagName('tbody')[0];
    hasChanges = false;
    
    for (let i = 0; i < ram.length; i++) {
        const row = ramTable.rows[i];
        const select = row.cells[1].getElementsByTagName('select')[0];
        const input = row.cells[1].getElementsByTagName('input')[0];
        
        const newInstruction = select.value;
        const newOperand = input.value;
        const originalValue = ram[i].value;
        const [originalInstruction, originalOperand] = originalValue.split(' ');
        
        if (newInstruction !== (originalInstruction || '') || newOperand !== (originalOperand || '')) {
            hasChanges = true;
            break;
        }
    }
    
    const saveButton = document.getElementById('saveAllButton');
    if (saveButton) {
        saveButton.style.display = hasChanges ? 'block' : 'none';
    }
}

function saveAllChanges() {
    const ramTable = document.getElementById('ram-table').getElementsByTagName('tbody')[0];
    
    for (let i = 0; i < ram.length; i++) {
        const row = ramTable.rows[i];
        const select = row.cells[1].getElementsByTagName('select')[0];
        const input = row.cells[1].getElementsByTagName('input')[0];
        
        const newInstruction = select.value;
        const newOperand = input.value;
        
        if (newInstruction) {
            ram[i].value = `${newInstruction} ${newOperand}`.trim();
        } else {
            ram[i].value = newOperand.trim() || '0';
        }
    }
    
    hasChanges = false;
    updateDisplay();
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
                    pc = (parseInt(operand) - 1 + ram.length) % ram.length;
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
    hasChanges = false;
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

// Initialize the display
updateDisplay();