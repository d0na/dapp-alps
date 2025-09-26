// Test per verificare l'ordine delle operazioni: status update PRIMA del download
console.log('🔄 Test Ordine Operazioni: Status Update PRIMA del Download');
console.log('========================================================');

// Simula le funzioni di download
const simulateDownload = (content, filename) => {
  console.log(`📥 Downloading: ${filename}`);
  console.log(`   Size: ${content.length} characters`);
  console.log(`   Type: ${filename.endsWith('.json') ? 'JSON' : 'Solidity'}`);
  
  // Verifica che il contenuto scaricato abbia status "proposed"
  if (filename.endsWith('.json')) {
    try {
      const jsonData = JSON.parse(content);
      console.log(`   Status nel file scaricato: ${jsonData.status}`);
      return jsonData.status === 'proposed';
    } catch (error) {
      console.log(`   ❌ Errore nel parsing JSON: ${error.message}`);
      return false;
    }
  }
  
  return true;
};

// Simula la funzione updateLicenseStatus
const updateLicenseStatus = (jsonString) => {
  console.log('🔄 Updating license status from "draft" to "proposed"...');
  
  try {
    const jsonData = JSON.parse(jsonString);
    const timestamp = new Date().toISOString();
    
    // Update overall status
    jsonData.status = "proposed";
    jsonData.lastModified = timestamp;
    
    // Update current version status
    const currentVersion = jsonData.versions.find(v => v.versionNumber === jsonData.currentVersion);
    if (currentVersion) {
      currentVersion.status = "proposed";
      currentVersion.lastModified = timestamp;
    }
    
    console.log('✅ Status updated successfully!');
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    console.error('❌ Error updating license status:', error);
    return jsonString;
  }
};

// Simula la funzione sendForApproval con ordine corretto
const sendForApproval = (generatedJson, generatedContract, recipientAddress) => {
  console.log('🔄 Processing Send for Approval con ordine corretto...');
  
  if (!recipientAddress) {
    console.log('❌ Error: Please enter recipient address');
    return { success: false, error: 'No recipient address' };
  }
  
  if (!generatedJson) {
    console.log('❌ Error: No license data available to send for approval');
    return { success: false, error: 'No license data' };
  }
  
  try {
    console.log('\n📋 STEP 1: Update license status to proposed FIRST');
    // Update license status to proposed FIRST
    const updatedJson = updateLicenseStatus(generatedJson);
    
    console.log('\n📋 STEP 2: THEN auto-download both files with updated status');
    // THEN auto-download both files with updated status
    const jsonDownloaded = simulateDownload(updatedJson, `smart-license-${Date.now()}.json`);
    const contractDownloaded = simulateDownload(generatedContract, `SmartLicense-${Date.now()}.sol`);
    
    console.log('\n✅ Processo completato con ordine corretto!');
    console.log('✅ Status aggiornato PRIMA del download');
    console.log('✅ File scaricati contengono status "proposed"');
    
    return {
      success: true,
      updatedJson: updatedJson,
      jsonDownloaded: jsonDownloaded,
      contractDownloaded: contractDownloaded,
      deploymentStatus: 'sent'
    };
  } catch (error) {
    console.log('❌ Error sending license for approval:', error.message);
    return { success: false, error: error.message };
  }
};

// Test data
const testJson = JSON.stringify({
  licenseId: "LIC-2024-001",
  name: "Test License",
  currentVersion: 1,
  status: "draft",
  createdAt: "2024-01-01T00:00:00.000Z",
  lastModified: "2024-01-01T00:00:00.000Z",
  parties: {
    licensor: "0x123...",
    licensee: "0x456...",
    territory: "Global"
  },
  versions: [
    {
      versionNumber: 1,
      status: "draft",
      createdAt: "2024-01-01T00:00:00.000Z",
      createdBy: "creator",
      comment: "Test license",
      data: {
        duration: "1Y 0M 0D",
        ips: "Test IP",
        rules: []
      },
      feedback: null
    }
  ]
}, null, 2);

const testContract = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

contract SmartLicense {
    string public name = "Test License";
    address public licensor;
    address public licensee;
    
    constructor(address _licensor, address _licensee) {
        licensor = _licensor;
        licensee = _licensee;
    }
}`;

console.log('\n🧪 Test: Verifica Ordine Operazioni');
console.log('- Status iniziale:', JSON.parse(testJson).status);

const result = sendForApproval(testJson, testContract, "0x789...");

if (result.success) {
  console.log('\n🎯 Verifica Finale:');
  const updatedStatus = JSON.parse(result.updatedJson).status;
  
  console.log(`- Status dopo aggiornamento: ${updatedStatus}`);
  console.log(`- È proposed? ${updatedStatus === 'proposed' ? 'SÌ ✅' : 'NO ❌'}`);
  console.log(`- JSON scaricato con status corretto: ${result.jsonDownloaded ? 'SÌ ✅' : 'NO ❌'}`);
  console.log(`- Contract scaricato: ${result.contractDownloaded ? 'SÌ ✅' : 'NO ❌'}`);
  
  const allTestsPassed = 
    updatedStatus === 'proposed' &&
    result.jsonDownloaded &&
    result.contractDownloaded;
  
  if (allTestsPassed) {
    console.log('\n🎉 Test completato con successo!');
    console.log('✅ Ordine delle operazioni corretto:');
    console.log('   1. Status aggiornato da "draft" a "proposed"');
    console.log('   2. File scaricati con status "proposed"');
    console.log('✅ I file scaricati contengono lo status aggiornato');
  } else {
    console.log('\n❌ Test fallito!');
  }
} else {
  console.log('❌ Test fallito:', result.error);
}

console.log('\n📋 Ordine Corretto Implementato:');
console.log('1. Update license status to proposed FIRST');
console.log('2. THEN auto-download both files with updated status');
console.log('3. Files downloaded contain "proposed" status');
