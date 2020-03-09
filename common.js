function printText(text) {
    const output = document.querySelector('#outputText');
    output.value += text + '\n';
}

function clear() {
    const output = document.querySelector('#outputText');
    output.value = '';
}
