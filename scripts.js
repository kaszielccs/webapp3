function displayForm() {
    document.getElementById('form-section').classList.remove('hidden');
    document.getElementById('form-link').classList.remove('hidden');
}

function addRow() {
    const table = document.getElementById('server-form').getElementsByTagName('tbody')[0];
    const newRow = table.insertRow();

    newRow.innerHTML = `
        <td><input type="text" placeholder="Nombre del Servidor (Opcional)"></td>
        <td>
            <select>
                <option value="windows">Windows</option>
                <option value="linux">Linux</option>
                <option value="ubuntu">Ubuntu</option>
                <option value="redhat">RedHat</option>
            </select>
        </td>
        <td><input type="number" placeholder="Capacidad de Disco (GB)"></td>
        <td><input type="number" placeholder="Memoria (GB)"></td>
        <td><input type="number" placeholder="Número de Cores (Opcional)"></td>
        <td><button class="btn" onclick="removeRow(this)">Eliminar</button></td>
    `;
}

function removeRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
}

function generateScript() {
    const platform = document.getElementById('platform').value;
    const scriptType = document.getElementById('script-type').value;
    let scriptContent = '';

    if (platform === 'avs' && scriptType === 'powercli') {
        scriptContent = generatePowerCLIScript();
    } else if (platform === 'iaas') {
        if (scriptType === 'terraform') {
            scriptContent = generateTerraformScript();
        } else if (scriptType === 'arm') {
            scriptContent = generateARMScript();
        }
    }

    displayScriptOutput(scriptContent);
}

function generatePowerCLIScript() {
    return '# PowerCLI Script\n# Script content here...';
}

function generateTerraformScript() {
    return '# Terraform Script\n# Script content here...';
}

function generateARMScript() {
    return '# ARM Script\n# Script content here...';
}

function displayScriptOutput(script) {
    document.getElementById('script-output').textContent = script;
    document.getElementById('output-section').classList.remove('hidden');
    document.getElementById('output-link').classList.remove('hidden');
    document.getElementById('instructions-section').classList.remove('hidden');
    document.getElementById('instructions-link').classList.remove('hidden');
}

function downloadScript() {
    const scriptContent = document.getElementById('script-output').textContent;
    const blob = new Blob([scriptContent], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'script.txt';
    link.click();
}
