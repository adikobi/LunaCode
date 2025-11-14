// LunaCode Main JavaScript

let workspace;
let currentLevel = 1;

const levels = {
    1: {
        title: "שלב 1: סדר פעולות",
        instructions: {
            title: "שלב 1: סדר פעולות",
            p1: "המטרה: לעזור לארנב להגיע לגזר!",
            p2: "כדי להצליח, חברו את הבלוקים הנכונים בסדר הנכון.",
            button: "התחילו!"
        },
        toolbox: [
            { 'kind': 'block', 'type': 'move_forward' },
            { 'kind': 'block', 'type': 'math_number', 'fields': { 'NUM': 1 } }
        ]
    },
    2: {
        title: "שלב 2: לולאות",
        instructions: {
            title: "שלב 2: כוחה של הלולאה",
            p1: "במקום לחבר הרבה בלוקים, השתמשו בבלוק 'חזור על...' כדי לבצע את אותה פעולה מספר פעמים!",
            p2: "גררו את בלוק 'צעד קדימה' לתוך הלולאה.",
            button: "הבנתי!"
        },
        toolbox: [
            { 'kind': 'block', 'type': 'move_forward' },
            { 'kind': 'block', 'type': 'controls_repeat_ext' },
            { 'kind': 'block', 'type': 'math_number', 'fields': { 'NUM': 5 } }
        ]
    },
    3: {
        title: "שלב 3: תנאים",
        instructions: {
            title: "שלב 3: היזהרו מהשלולית!",
            p1: "השתמשו בבלוק 'אם...' כדי לבדוק אם יש שלולית לפני הארנב.",
            p2: "אם כן, תכננו לו מסלול עוקף כדי להגיע לגזר.",
            button: "קדימה!"
        },
        toolbox: [
            { 'kind': 'block', 'type': 'move_forward' },
            { 'kind': 'block', 'type': 'turn_right' },
            { 'kind': 'block', 'type': 'turn_left' },
            { 'kind': 'block', 'type': 'if_puddle_ahead' },
            { 'kind': 'block', 'type': 'math_number', 'fields': { 'NUM': 1 } }
        ]
    }
};

let rabbitDirection = 'east';

async function runCode() {
    resetCharacterPosition();
    let commandQueue = [];
    let block = workspace.getTopBlocks(true)[0];
    while (block) {
        if (block.type === 'move_forward') {
            const numberBlock = block.getInputTargetBlock('STEPS');
            if (numberBlock) commandQueue.push({ command: 'move', steps: parseInt(numberBlock.getFieldValue('NUM'), 10) });
        } else if (block.type === 'turn_right') {
            commandQueue.push({ command: 'turn', direction: 'right' });
        } else if (block.type === 'turn_left') {
            commandQueue.push({ command: 'turn', direction: 'left' });
        } else if (block.type === 'if_puddle_ahead') {
            if (isPuddleAhead()) {
                let innerBlock = block.getInputTargetBlock('DO');
                while (innerBlock) {
                    if (innerBlock.type === 'move_forward') {
                        const numberBlock = innerBlock.getInputTargetBlock('STEPS');
                        if (numberBlock) commandQueue.push({ command: 'move', steps: parseInt(numberBlock.getFieldValue('NUM'), 10) });
                    } else if (innerBlock.type === 'turn_right') {
                        commandQueue.push({ command: 'turn', direction: 'right' });
                    } else if (innerBlock.type === 'turn_left') {
                        commandQueue.push({ command: 'turn', direction: 'left' });
                    }
                    innerBlock = innerBlock.getNextBlock();
                }
            }
        } else if (block.type === 'controls_repeat_ext') {
            const timesBlock = block.getInputTargetBlock('TIMES');
            if (timesBlock) {
                const times = parseInt(timesBlock.getFieldValue('NUM'), 10);
                let loopBodyBlock = block.getInputTargetBlock('DO');
                for (let i = 0; i < times; i++) {
                    let currentBlockInLoop = loopBodyBlock;
                    while (currentBlockInLoop) {
                        if (currentBlockInLoop.type === 'move_forward') {
                            const numberBlock = currentBlockInLoop.getInputTargetBlock('STEPS');
                            if (numberBlock) commandQueue.push({ command: 'move', steps: parseInt(numberBlock.getFieldValue('NUM'), 10) });
                        }
                        currentBlockInLoop = currentBlockInLoop.getNextBlock();
                    }
                }
            }
        }
        block = block.getNextBlock();
    }
    await processCommandQueue(commandQueue);
}

async function processCommandQueue(queue) {
    for (const command of queue) {
        if (command.command === 'move') await moveCharacter(command.steps);
        else if (command.command === 'turn') await turnRabbit(command.direction);
        checkWinCondition();
    }
}

function loadLevel(levelNumber) {
    currentLevel = parseInt(levelNumber, 10);
    const levelData = levels[currentLevel];

    document.getElementById('level-title').textContent = levelData.title;

    const modal = document.getElementById('instructions-modal');
    modal.querySelector('.modal-title').textContent = levelData.instructions.title;
    modal.querySelector('p:nth-of-type(1)').textContent = levelData.instructions.p1;
    modal.querySelector('p:nth-of-type(2)').textContent = levelData.instructions.p2;
    modal.querySelector('.modal-button').textContent = levelData.instructions.button;

    document.querySelectorAll('.level-button').forEach(btn => btn.classList.remove('active'));
    const activeButton = document.querySelector(`.level-button[data-level='${currentLevel}']`);
    if (activeButton) {
        activeButton.classList.add('active');
    }

    const isFirstLoad = !workspace;

    if (isFirstLoad) {
        initWorkspace();
    } else {
        workspace.clear();
        workspace.updateToolbox({ 'kind': 'flyoutToolbox', 'contents': levelData.toolbox });
    }

    resetCharacterPosition();
    modal.style.display = 'flex';
}

function initWorkspace() {
    Blockly.Blocks['move_forward'] = { init: function() { this.appendValueInput("STEPS").setCheck("Number").appendField("צעד קדימה"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(230); } };
    Blockly.Blocks['controls_repeat_ext'] = { init: function() { this.jsonInit({ "message0": "חזור על %1 פעמים", "args0": [{ "type": "input_value", "name": "TIMES", "check": "Number" }], "message1": "בצע %1", "args1": [{ "type": "input_statement", "name": "DO" }], "previousStatement": null, "nextStatement": null, "colour": 120 }); } };
    Blockly.Blocks['turn_right'] = { init: function() { this.appendDummyInput().appendField("פנה ימינה ➡️"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290); } };
    Blockly.Blocks['turn_left'] = { init: function() { this.appendDummyInput().appendField("פנה שמאלה ⬅️"); this.setPreviousStatement(true, null); this.setNextStatement(true, null); this.setColour(290); } };
    Blockly.Blocks['if_puddle_ahead'] = { init: function() { this.jsonInit({ "message0": "אם יש שלולית לפני", "message1": "בצע %1", "args1": [{ "type": "input_statement", "name": "DO" }], "previousStatement": null, "nextStatement": null, "colour": 210 }); } };

    workspace = Blockly.inject('blockly-div', {
        toolbox: { 'kind': 'flyoutToolbox', 'contents': levels[currentLevel].toolbox },
        rtl: true,
        renderer: 'zelos',
    });
}

function resetLevel() {
    if (workspace) workspace.clear();
    resetCharacterPosition();
}

function resetCharacterPosition() {
    const rabbit = document.getElementById('rabbit');
    if (rabbit) {
        rabbit.style.right = '20px';
        rabbit.style.top = '50%';
        rabbit.className = 'game-char face-east';
        rabbitDirection = 'east';
    }
}

function moveCharacter(steps) {
    return new Promise(resolve => {
        const rabbit = document.getElementById('rabbit');
        if (!rabbit) return resolve();
        const style = window.getComputedStyle(rabbit);
        const currentTop = parseFloat(style.top);
        const currentRight = parseFloat(style.right);
        const stepSize = steps * 15;
        switch (rabbitDirection) {
            case 'east': rabbit.style.right = `${currentRight + stepSize}px`; break;
            case 'west': rabbit.style.right = `${currentRight - stepSize}px`; break;
            case 'north': rabbit.style.top = `${currentTop - stepSize}px`; break;
            case 'south': rabbit.style.top = `${currentTop + stepSize}px`; break;
        }
        const onTransitionEnd = () => { rabbit.removeEventListener('transitionend', onTransitionEnd); resolve(); };
        rabbit.addEventListener('transitionend', onTransitionEnd);
        setTimeout(() => { rabbit.removeEventListener('transitionend', onTransitionEnd); resolve(); }, 600);
    });
}

function turnRabbit(turnDirection) {
    return new Promise(resolve => {
        const directions = ['east', 'south', 'west', 'north'];
        const currentDirectionIndex = directions.indexOf(rabbitDirection);
        const newDirectionIndex = (currentDirectionIndex + (turnDirection === 'right' ? 1 : 3)) % 4;
        rabbitDirection = directions[newDirectionIndex];
        const rabbit = document.getElementById('rabbit');
        rabbit.className = 'game-char';
        rabbit.classList.add(`face-${rabbitDirection}`);
        setTimeout(resolve, 200);
    });
}

function isPuddleAhead() {
    const rabbit = document.getElementById('rabbit');
    const puddle = document.getElementById('puddle');
    const rabbitRect = rabbit.getBoundingClientRect();
    const puddleRect = puddle.getBoundingClientRect();
    switch (rabbitDirection) {
        case 'east': return rabbitRect.right < puddleRect.left && Math.abs(rabbitRect.top - puddleRect.top) < 20;
        case 'west': return rabbitRect.left > puddleRect.right && Math.abs(rabbitRect.top - puddleRect.top) < 20;
        case 'north': return rabbitRect.top > puddleRect.bottom && Math.abs(rabbitRect.left - puddleRect.left) < 20;
        case 'south': return rabbitRect.bottom < puddleRect.top && Math.abs(rabbitRect.left - puddleRect.left) < 20;
    }
    return false;
}

function checkWinCondition() {
    const rabbit = document.getElementById('rabbit');
    const carrot = document.getElementById('carrot');
    const rabbitRect = rabbit.getBoundingClientRect();
    const carrotRect = carrot.getBoundingClientRect();
    const overlap = !(rabbitRect.right < carrotRect.left || rabbitRect.left > carrotRect.right);
    if (overlap) confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
}

window.addEventListener('load', () => {
    document.querySelectorAll('.level-button').forEach(button => {
        button.addEventListener('click', e => loadLevel(e.target.dataset.level));
    });

    document.getElementById('run-button').addEventListener('click', runCode);
    document.getElementById('reset-button').addEventListener('click', resetLevel);

    document.getElementById('start-button').onclick = () => {
        document.getElementById('instructions-modal').style.display = 'none';
    };

    loadLevel(1);
});
