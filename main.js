// LunaCode Main JavaScript

let workspace;

// --- Command Engine ---
const commandEngine = {
    'move': (args) => {
        const rabbit = document.getElementById('rabbit');
        if (rabbit) {
            const style = window.getComputedStyle(rabbit);
            const currentRight = parseFloat(style.right);
            const newRight = currentRight + (args.steps * 15);
            rabbit.style.right = `${newRight}px`;
        }
    }
};

function executeCommands(commandQueue) {
    for (const command of commandQueue) {
        if (commandEngine[command.command]) {
            commandEngine[command.command](command.args);
        }
    }
    setTimeout(checkWinCondition, 1000);
}
// --- End Command Engine ---

function init() {
    // Custom block definition (generates JSON, not JS)
    Blockly.Blocks['move_forward'] = {
      init: function() {
        this.appendValueInput("STEPS").setCheck("Number").appendField("צעד קדימה");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(230);
      }
    };

    // Custom generator stub
    const customGenerator = new Blockly.Generator('CUSTOM');
    customGenerator.scrub_ = function(block, code, thisOnly) {
        const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
        if (nextBlock) {
            return code + ',\n' + customGenerator.blockToCode(nextBlock);
        }
        return code;
    };

    customGenerator['move_forward'] = function(block) {
      const steps = Blockly.JavaScript.valueToCode(block, 'STEPS', Blockly.JavaScript.ORDER_ATOMIC) || 0;
      const command = { command: 'move', args: { steps: steps } };
      return JSON.stringify(command);
    };

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

    document.getElementById('run-button').addEventListener('click', () => {
        resetCharacterPosition();
        const code = customGenerator.workspaceToCode(workspace);
        try {
            const commandQueue = JSON.parse(`[${code}]`);
            executeCommands(commandQueue);
        } catch (e) {
            console.error("Error parsing command queue:", e);
        }
    });

    document.getElementById('reset-button').addEventListener('click', resetLevel);
}

function resetLevel() {
    resetCharacterPosition();
    workspace.clear();
}

function resetCharacterPosition() {
    document.getElementById('rabbit').style.right = '20px';
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
