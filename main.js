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
    }
};

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
                            if (numberBlock) {
                                const steps = numberBlock.getFieldValue('NUM');
                                commandQueue.push({ command: 'move', steps: parseInt(steps, 10) });
                            }
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
        if (command.command === 'move') {
            // await the moveCharacter promise to ensure sequential execution
            await moveCharacter(command.steps);
            checkWinCondition();
        }
    }
}
// --- End Engine ---

function loadLevel(levelNumber) {
    currentLevel = levelNumber;
    const levelData = levels[currentLevel];

    // Update level title
    document.getElementById('level-title').textContent = levelData.title;

    // Update modal content
    const modal = document.getElementById('instructions-modal');
    modal.querySelector('.modal-title').textContent = levelData.instructions.title;
    modal.querySelector('p:nth-of-type(1)').textContent = levelData.instructions.p1;
    modal.querySelector('p:nth-of-type(2)').textContent = levelData.instructions.p2;
    modal.querySelector('.modal-button').textContent = levelData.instructions.button;

    // Update active button
    document.querySelectorAll('.level-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.level == currentLevel);
    });

    // Update toolbox
    if (workspace) {
        workspace.updateToolbox({ 'kind': 'flyoutToolbox', 'contents': levelData.toolbox });
    } else {
        // If workspace is not ready, we will update it in init
    }

    resetLevel();
    modal.style.display = 'flex';
}

function init() {
    // Add event listeners for level selection buttons
    document.querySelectorAll('.level-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const level = e.target.dataset.level;
            loadLevel(level);
        });
    });

    Blockly.Blocks['move_forward'] = {
      init: function() {
        this.appendValueInput("STEPS").setCheck("Number").appendField("צעד קדימה");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };

    // Define the new loop block
    Blockly.Blocks['controls_repeat_ext'] = {
      init: function() {
        this.jsonInit({
          "message0": "חזור על %1 פעמים",
          "args0": [
            {
              "type": "input_value",
              "name": "TIMES",
              "check": "Number"
            }
          ],
          "message1": "בצע %1",
          "args1": [
            {
              "type": "input_statement",
              "name": "DO"
            }
          ],
          "previousStatement": null,
          "nextStatement": null,
          "colour": 120,
          "tooltip": "בצע סדרת פעולות מספר פעמים."
        });
      }
    };

    // NOTE: No custom generator is needed in this simpler approach.

    const blocklyDiv = document.getElementById('blockly-div');
    workspace = Blockly.inject(blocklyDiv, {
        toolbox: {
            'kind': 'flyoutToolbox',
            'contents': levels[currentLevel].toolbox
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
    // Initialize the main game logic once
    init();

    // Load the first level by default
    loadLevel(1);

    // Set up the modal button to only ever hide the modal
    const modal = document.getElementById('instructions-modal');
    document.getElementById('start-button').onclick = () => {
        modal.style.display = 'none';
    }
});
