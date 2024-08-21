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
    let script = '# PowerCLI Script for Azure VMware Solution (AVS)\n\n';
    $('#server-form tbody tr').each(function() {
        const name = $(this).find('input').eq(0).val();
        const os = $(this).find('select').val();
        const capacity = $(this).find('input').eq(1).val();
        const memory = $(this).find('input').eq(2).val();
        const cores = $(this).find('input').eq(3).val();

        script += `# Create a new VM in AVS\n`;
        script += `New-VM -Name '${name}' -ResourcePool 'ResourcePoolName' -Datastore 'DatastoreName' -Template '${os}'\n`;
        script += `Set-VM -VM '${name}' -MemoryMB ${memory * 1024} -NumCpu ${cores}\n`;
        script += `New-HardDisk -VM '${name}' -CapacityGB ${capacity}\n\n`;
    });
    return script;
}


function generateTerraformScript() {
    let script = `# Terraform Script for Azure IaaS\n\nprovider "azurerm" {\n  features {}\n}\n\nresource "azurerm_resource_group" "rg" {\n  name     = "myResourceGroup"\n  location = "West Europe"\n}\n\n`;

    $('#server-form tbody tr').each(function(index) {
        const name = $(this).find('input').eq(0).val();
        const os = $(this).find('select').val();
        const capacity = $(this).find('input').eq(1).val();
        const memory = $(this).find('input').eq(2).val();
        const cores = $(this).find('input').eq(3).val();

        script += `resource "azurerm_virtual_machine" "vm_${index}" {\n`;
        script += `  name                  = "${name}"\n`;
        script += `  location              = azurerm_resource_group.rg.location\n`;
        script += `  resource_group_name   = azurerm_resource_group.rg.name\n`;
        script += `  network_interface_ids = ["\${azurerm_network_interface.nic_${index}.id}"]\n`;
        script += `  vm_size               = "Standard_DS1_v2"\n\n`;

        script += `  storage_os_disk {\n`;
        script += `    name              = "${name}_osdisk"\n`;
        script += `    caching           = "ReadWrite"\n`;
        script += `    create_option     = "FromImage"\n`;
        script += `    managed_disk_type = "Standard_LRS"\n`;
        script += `    disk_size_gb      = ${capacity}\n`;
        script += `  }\n\n`;

        script += `  storage_image_reference {\n`;
        script += `    publisher = "${os === 'windows' ? 'MicrosoftWindowsServer' : 'Canonical'}"\n`;
        script += `    offer     = "${os === 'windows' ? 'WindowsServer' : 'UbuntuServer'}"\n`;
        script += `    sku       = "${os === 'windows' ? '2019-Datacenter' : '18.04-LTS'}"\n`;
        script += `    version   = "latest"\n`;
        script += `  }\n\n`;

        script += `  os_profile {\n`;
        script += `    computer_name  = "${name}"\n`;
        script += `    admin_username = "azureuser"\n`;
        script += `    admin_password = "P@ssw0rd1234"\n`;
        script += `  }\n\n`;

        script += `  os_profile_linux_config {\n`;
        script += `    disable_password_authentication = false\n`;
        script += `  }\n\n`;

        script += `  os_profile_windows_config {}\n\n`;

        script += `  tags = {\n`;
        script += `    environment = "dev"\n`;
        script += `  }\n}\n\n`;
    });

    return script;
}

function generateARMScript() {
    let script = `{\n  "$schema": "https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#"\n  "contentVersion": "1.0.0.0",\n  "resources": [\n`;

    $('#server-form tbody tr').each(function(index) {
        const name = $(this).find('input').eq(0).val();
        const os = $(this).find('select').val();
        const capacity = $(this).find('input').eq(1).val();
        const memory = $(this).find('input').eq(2).val();
        const cores = $(this).find('input').eq(3).val();

        script += `    {\n`;
        script += `      "type": "Microsoft.Compute/virtualMachines",\n`;
        script += `      "apiVersion": "2020-06-01",\n`;
        script += `      "name": "${name}",\n`;
        script += `      "location": "[resourceGroup().location]",\n`;
        script += `      "properties": {\n`;
        script += `        "hardwareProfile": {\n`;
        script += `          "vmSize": "Standard_DS1_v2"\n`;
        script += `        },\n`;
        script += `        "storageProfile": {\n`;
        script += `          "osDisk": {\n`;
        script += `            "createOption": "FromImage",\n`;
        script += `            "managedDisk": {\n`;
        script += `              "storageAccountType": "Standard_LRS"\n`;
        script += `            },\n`;
        script += `            "diskSizeGB": ${capacity}\n`;
        script += `          },\n`;
        script += `          "imageReference": {\n`;
        script += `            "publisher": "${os === 'windows' ? 'MicrosoftWindowsServer' : 'Canonical'}",\n`;
        script += `            "offer": "${os === 'windows' ? 'WindowsServer' : 'UbuntuServer'}",\n`;
        script += `            "sku": "${os === 'windows' ? '2019-Datacenter' : '18.04-LTS'}",\n`;
        script += `            "version": "latest"\n`;
        script += `          }\n`;
        script += `        },\n`;
        script += `        "osProfile": {\n`;
        script += `          "computerName": "${name}",\n`;
        script += `          "adminUsername": "azureuser",\n`;
        script += `          "adminPassword": "P@ssw0rd1234"\n`;
        script += `        },\n`;
        script += `        "networkProfile": {\n`;
        script += `          "networkInterfaces": [\n`;
        script += `            {\n`;
        script += `              "id": "[resourceId('Microsoft.Network/networkInterfaces', '${name}-nic')]"\n`;
        script += `            }\n`;
        script += `          ]\n`;
        script += `        }\n`;
        script += `      }\n`;
        script += `    }${index < $('#server-form tbody tr').length - 1 ? ',' : ''}\n`;
    });

    script += `  ]\n}\n`;

    return script;
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
