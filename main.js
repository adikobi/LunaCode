// LunaCode Main JavaScript

let workspace;

// --- Sequential Command Engine ---
async function runCode() {
    resetCharacterPosition();

    let commandQueue = [];
    let block = workspace.getTopBlocks(true)[0];

    while (block) {
        if (block.type === 'move_forward') {
            const numberBlock = block.getInputTargetBlock('STEPS');
            if (numberBlock) {
                const steps = numberBlock.getFieldValue('NUM');
                commandQueue.push({ command: 'move', steps: parseInt(steps, 10) });
            }
        }
        block = block.getNextBlock();
    }

    await processCommandQueue(commandQueue);
}

async function processCommandQueue(queue) {
    for (const command of queue) {
        if (command.command === 'move') {
            // await the moveCharacter promise to ensure sequential execution
            await moveCharacter(command.steps);
            checkWinCondition();
        }
    }
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
    return new Promise(resolve => {
        const rabbit = document.getElementById('rabbit');
        if (!rabbit) {
            return resolve();
        }

        const style = window.getComputedStyle(rabbit);
        const currentRight = parseFloat(style.right);
        const newRight = currentRight + (steps * 15);

        // Function to run after the transition ends
        const onTransitionEnd = () => {
            rabbit.removeEventListener('transitionend', onTransitionEnd);
            resolve();
        };
        rabbit.addEventListener('transitionend', onTransitionEnd);

        rabbit.style.right = `${newRight}px`;

        // Safety timeout in case transitionend doesn't fire
        setTimeout(() => {
            rabbit.removeEventListener('transitionend', onTransitionEnd);
            resolve();
        }, 600); // A bit longer than the transition duration
    });
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
