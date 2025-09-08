/**
 * Generates smart license JSON configuration based on creation mode and input data
 * @param {string} mode - Creation mode ('manual' or 'ai')
 * @param {Object} manualData - Manual form data
 * @param {string} aiText - AI input text
 * @returns {string} JSON string of the smart license configuration
 */
export const generateSmartLicenseJson = (mode, manualData, aiText) => {
  let jsonData;
  
  if (mode === 'manual') {
    // Generate JSON in the same format as the upload system
    jsonData = {
      name: manualData.name || "Smart License",
      licensor: manualData.licensor || "0x0000000000000000000000000000000000000000",
      licensee: manualData.licensee || "0x0000000000000000000000000000000000000000",
      territory: manualData.territory || "Worldwide",
      duration: manualData.duration || "1Y 0M 0D",
      ips: manualData.ips || "Intellectual property description",
      rules: manualData.rules || []
    };
  } else {
    // AI mode - generate from AI text
    jsonData = {
      name: "AI Generated Smart License",
      licensor: "0x0000000000000000000000000000000000000000",
      licensee: "0x0000000000000000000000000000000000000000",
      territory: "Worldwide",
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
              displayName: "RB01"
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