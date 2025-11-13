// LunaCode Main JavaScript

let workspace;

// --- Simple Block Reader Engine ---
function runCode() {
    resetCharacterPosition();

    // Get all the top-level blocks in order
    const topBlocks = workspace.getTopBlocks(true);
    let commands = [];

    for (const block of topBlocks) {
        if (block.type === 'move_forward') {
            // Get the number value from the connected block
            const numberBlock = block.getInputTargetBlock('STEPS');
            if (numberBlock) {
                const steps = numberBlock.getFieldValue('NUM');
                moveCharacter(steps);
            }
        }
    }

    setTimeout(checkWinCondition, 1000);
}
// --- End Engine ---

function init() {
    Blockly.Blocks['move_forward'] = {
      init: function() {
        this.appendValueInput("STEPS").setCheck("Number").appendField("צעד קדימה");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };

    // NOTE: No custom generator is needed in this simpler approach.

    const blocklyDiv = document.getElementById('blockly-div');
    workspace = Blockly.inject(blocklyDiv, {
        toolbox: {
            'kind': 'flyoutToolbox',
            'contents': [
                { 'kind': 'block', 'type': 'move_forward' },
                { 'kind': 'block', 'type': 'math_number', 'fields': { 'NUM': 1 } }
            ]
        },
        rtl: true,
        renderer: 'zelos',
    });

    document.getElementById('run-button').addEventListener('click', runCode);
    document.getElementById('reset-button').addEventListener('click', resetLevel);
}

function resetLevel() {
    resetCharacterPosition();
    workspace.clear();
}

function resetCharacterPosition() {
    document.getElementById('rabbit').style.right = '20px';
}

function moveCharacter(steps) {
    const rabbit = document.getElementById('rabbit');
    if (rabbit) {
        const style = window.getComputedStyle(rabbit);
        const currentRight = parseFloat(style.right);
        const newRight = currentRight + (steps * 15);
        rabbit.style.right = `${newRight}px`;
    }
}

function checkWinCondition() {
    const rabbit = document.getElementById('rabbit');
    const carrot = document.getElementById('carrot');
    const rabbitRect = rabbit.getBoundingClientRect();
    const carrotRect = carrot.getBoundingClientRect();
    const overlap = !(rabbitRect.right < carrotRect.left || rabbitRect.left > carrotRect.right);
    if (overlap) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
    }
}

window.addEventListener('load', () => {
    const modal = document.getElementById('instructions-modal');
    document.getElementById('start-button').onclick = () => {
        modal.style.display = 'none';
        init();
    }
    modal.style.display = 'flex';
});
