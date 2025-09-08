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
    jsonData = {
      smartLicense: {
        id: `SL_${Date.now()}`,
        title: manualData.name || manualData.title,
        licensor: manualData.licensor,
        licensee: manualData.licensee || "TBD", // To be determined when license is executed
        intellectualProperty: {
          description: manualData.ips || manualData.ipDescription,
          type: "Patent/Copyright/Trademark", // Could be expanded
        },
        terms: {
          licenseType: manualData.type || "Standard",
          duration: {
            months: parseInt(manualData.duration) || 0,
            startDate: "TBD",
            endDate: "TBD"
          },
          territory: manualData.territory,
          royaltyRate: parseFloat(manualData.royaltyRate) || 0,
          restrictions: manualData.restrictions || "Standard restrictions apply"
        },
        status: "draft",
        createdAt: new Date().toISOString(),
        blockchain: {
          network: "ethereum",
          contractAddress: "TBD",
          deploymentTx: "TBD"
        },
        metadata: {
          creationMode: "manual",
          version: "1.0.0"
        }
      }
    };
  } else {
    // AI mode - simulate AI processing
    jsonData = {
      smartLicense: {
        id: `SL_AI_${Date.now()}`,
        title: "AI Generated License",
        licensor: "Extracted from text",
        licensee: "TBD",
        intellectualProperty: {
          description: "AI analyzed intellectual property from provided text",
          type: "AI Determined",
        },
        terms: {
          licenseType: "AI Analyzed",
          duration: {
            months: 12, // Default AI suggestion
            startDate: "TBD",
            endDate: "TBD"
          },
          territory: "AI Determined Territory",
          royaltyRate: 5.0, // Default AI suggestion
          restrictions: "AI extracted restrictions from text"
        },
        aiAnalysis: {
          inputText: aiText.substring(0, 200) + "...", // Truncated for display
          confidence: 0.85,
          extractedEntities: ["Licensor", "Territory", "Duration", "Royalty"],
          suggestedImprovements: ["Clarify payment terms", "Define territory boundaries"],
          processingTimestamp: new Date().toISOString()
        },
        status: "draft",
        createdAt: new Date().toISOString(),
        blockchain: {
          network: "ethereum",
          contractAddress: "TBD",
          deploymentTx: "TBD"
        },
        metadata: {
          creationMode: "ai",
          version: "1.0.0"
        }
      }
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