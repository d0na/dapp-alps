/**
 * Generates smart license JSON configuration based on creation mode and input data
 * @param {string} mode - Creation mode ('manual' or 'ai')
 * @param {Object} manualData - Manual form data
 * @param {string} aiText - AI input text
 * @param {Object} existingLicenseData - Existing license data (for edit mode)
 * @returns {string} JSON string of the smart license configuration
 */
export const generateSmartLicenseJson = (mode, manualData, aiText, existingLicenseData = null) => {
  const timestamp = new Date().toISOString();
  
  // Determine if we're in edit mode
  const isEditMode = existingLicenseData && existingLicenseData.licenseId;
  
  // Use existing license ID or generate new one
  const licenseId = isEditMode ? existingLicenseData.licenseId : `LIC-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`;
  
  let versionData;
  
  if (mode === 'manual') {
    // Generate version data in the new format
    versionData = {
      duration: manualData.duration || "1Y 0M 0D",
      ips: manualData.ips || "Intellectual property description",
      rules: manualData.rules || []
    };
  } else {
    // AI mode - generate from AI text
    versionData = {
      duration: "1Y 0M 0D",
      ips: aiText || "AI generated intellectual property description",
      rules: [
        {
          id: Date.now(),
          name: "AI Generated Rule",
          validityStart: new Date().toISOString().split('T')[0],
          validityEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          evaluationInterval: {
            duration: "1Y 0M 0D"
          },
          royaltyBase: [
            {
              id: Date.now() + 1,
              oracleAddress: "0x0000000000000000000000000000000000000000",
              propertyName: "getCount",
              displayName: "RB01",
              intellectualProperty: ""
            }
          ],
          royaltyRate: {
            type: "lumpsum",
            lumpsumValue: "10.0",
            proportionalValue: "",
            proportionalRB: "",
            customFunc: "sum",
            customInputs: [],
            stepStructure: {
              xAxis: "",
              steps: [],
              infiniteValue: ""
            },
            min: "0",
            max: "100"
          }
        }
      ]
    };
  }

  // Generate JSON in the new versioned format
  let jsonData;
  
  if (isEditMode) {
    // Edit mode: create a new version with draft status
    const newVersionNumber = existingLicenseData.currentVersion + 1;
    
    // Mark previous versions as superseded
    const updatedVersions = existingLicenseData.versions.map(version => ({
      ...version,
      status: version.status === 'deployed' ? 'superseded' : version.status
    }));
    
    // Add new draft version
    const newVersion = {
      versionNumber: newVersionNumber,
      status: "draft",
      createdAt: timestamp,
      createdBy: "creator",
      comment: mode === 'manual' 
        ? (manualData.comment || `Editing license: ${manualData.name || existingLicenseData.name}`)
        : `AI-generated license based on provided text`,
      data: versionData,
      feedback: null
    };
    
    jsonData = {
      ...existingLicenseData,
      name: manualData.name || existingLicenseData.name,
      currentVersion: newVersionNumber,
      status: "draft",
      lastModified: timestamp,
      parties: {
        licensor: manualData.licensor || existingLicenseData.parties?.licensor || existingLicenseData.licensor,
        licensee: manualData.licensee || existingLicenseData.parties?.licensee || existingLicenseData.licensee,
        territory: manualData.territory || existingLicenseData.parties?.territory || existingLicenseData.territory
      },
      versions: [...updatedVersions, newVersion]
    };
  } else {
    // New license mode
    jsonData = {
      licenseId: licenseId,
      name: manualData.name || "Smart License",
      currentVersion: 1,
      status: "draft",
      createdAt: timestamp,
      lastModified: timestamp,
      parties: {
        licensor: manualData.licensor || "0x0000000000000000000000000000000000000000",
        licensee: manualData.licensee || "0x0000000000000000000000000000000000000000",
        territory: manualData.territory || "Worldwide"
      },
      versions: [
        {
          versionNumber: 1,
          status: "draft",
          createdAt: timestamp,
          createdBy: "creator",
          comment: mode === 'manual' 
            ? (manualData.comment || `Initial license configuration: ${manualData.name || 'Smart License'}`)
            : `AI-generated license based on provided text`,
          data: versionData,
          feedback: null
        }
      ]
    };
  }

  return JSON.stringify(jsonData, null, 2);
};

/**
 * Validates manual data completeness
 * @param {Object} manualData - Manual form data
 * @returns {boolean} True if data is valid for JSON generation
 */
export const validateManualData = (manualData) => {
  return Boolean(manualData.name && manualData.licensor);
};

/**
 * Validates AI text input
 * @param {string} aiText - AI input text
 * @returns {boolean} True if text is valid for AI processing
 */
export const validateAiText = (aiText) => {
  return Boolean(aiText && aiText.trim().length > 10);
};

/**
 * Changes license status from draft to proposed for approval
 * @param {string} jsonString - Current JSON string
 * @returns {string} Updated JSON string with proposed status
 */
export const sendForApproval = (jsonString) => {
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
    
    return JSON.stringify(jsonData, null, 2);
  } catch (error) {
    console.error('Error updating license status:', error);
    return jsonString; // Return original if error
  }
};