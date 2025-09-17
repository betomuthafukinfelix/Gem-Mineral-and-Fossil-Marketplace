import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisResult, AppraisalResult } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });


const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        scientificName: {
            type: Type.STRING,
            description: "The scientific name of the specimen (e.g., 'Genus species' like 'Elrathia kingii' for a fossil, or 'Quartz' for a mineral)."
        },
        commonName: {
            type: Type.STRING,
            description: "The common name of the specimen (e.g., 'Amethyst', 'Trilobite Fossil')."
        },
        specimenType: {
            type: Type.STRING,
            description: "Classify the specimen into one of the following categories: 'Fossil', 'Gemstone', 'Mineral', or 'Other'."
        },
        description: {
            type: Type.STRING,
            description: "A detailed paragraph describing the specimen's characteristics, potential origin, and interesting facts from a geologist's or paleontologist's perspective."
        },
        geologicalContext: {
            type: Type.STRING,
            description: "Describe the typical geological environment where this specimen is found (e.g., 'Sedimentary limestone deposits from the Silurian period', 'Pegmatite intrusions', 'Hydrothermal veins')."
        },
        geologicalPeriod: {
            type: Type.STRING,
            description: "If the specimen is a fossil, specify the geological period it belongs to (e.g., 'Cambrian Period', 'Late Cretaceous'). Must provide 'N/A' if not a fossil."
        },
        fossilizationType: {
            type: Type.STRING,
            description: "If the specimen is a fossil, describe the type of fossilization (e.g., 'Permineralization', 'Cast and Mold', 'Trace Fossil'). Must provide 'N/A' if not a fossil."
        },
        estimatedValue: {
            type: Type.STRING,
            description: "An estimated market value range in USD, for example, '$150 - $250 USD'. Be specific about factors influencing the value like rarity, condition, and size."
        },
        keyCharacteristics: {
            type: Type.ARRAY,
            description: "A list of key observable characteristics for identification, such as crystal structure, luster, cleavage, specific fossil features, or signs of authenticity.",
            items: { type: Type.STRING }
        }
    },
    required: ["scientificName", "commonName", "specimenType", "description", "geologicalContext", "geologicalPeriod", "fossilizationType", "estimatedValue", "keyCharacteristics"]
};

export const analyzeSpecimen = async (file: File, userPrompt: string): Promise<AnalysisResult> => {
    const imagePart = await fileToGenerativePart(file);
    
    const fullPrompt = `You are a world-class expert paleontologist and geologist, with decades of experience at a prestigious natural history museum. Your task is to analyze the provided image of a specimen with scientific rigor and precision. ${userPrompt ? `The user has provided this additional context: '${userPrompt}'. ` : ''}If you identify the specimen as a fossil, you MUST be highly specific. Provide its scientific name (Genus and species), the geological period it's from (e.g., Devonian, Jurassic), and the likely type of fossilization (e.g., permineralization, cast, mold). For all specimen types, provide a detailed identification, classify the specimen type, describe its geological context, offer a rich description, estimate its market value, and list its key identifying characteristics. For non-fossil specimens, you must return 'N/A' for the 'geologicalPeriod' and 'fossilizationType' fields. Respond ONLY with a valid JSON object that conforms to the specified schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { text: fullPrompt },
                imagePart
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        }
    });

    if (!response || !response.text) {
        console.warn("AI response was blocked or empty. Full response:", response);
        throw new Error("The AI analysis was blocked, likely due to safety settings or an invalid request. Please adjust your image or prompt and try again.");
    }

    try {
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);
        // Basic validation
        if (
            !parsedResult.scientificName ||
            !parsedResult.commonName ||
            !parsedResult.specimenType ||
            !parsedResult.description ||
            !parsedResult.geologicalContext ||
            !parsedResult.geologicalPeriod ||
            !parsedResult.fossilizationType ||
            !parsedResult.estimatedValue ||
            !Array.isArray(parsedResult.keyCharacteristics)
        ) {
            throw new Error("Received malformed JSON data from API.");
        }
        return parsedResult as AnalysisResult;
    } catch (e) {
        console.error("Failed to parse Gemini response:", response.text, e);
        throw new Error("The AI returned an unexpected format. Please try again.");
    }
};

const appraisalSchema = {
    type: Type.OBJECT,
    properties: {
        estimatedValueRange: {
            type: Type.STRING,
            description: "A specific market value range in USD, for example, '$450 - $600 USD'."
        },
        confidenceScore: {
            type: Type.NUMBER,
            description: "A score from 0 to 100 indicating your confidence in the appraisal, based on image quality and specimen visibility."
        },
        valuationMethodology: {
            type: Type.STRING,
            description: "A brief explanation of how the valuation was determined, citing factors like comparable sales, rarity, and quality markers."
        },
        positiveValueFactors: {
            type: Type.ARRAY,
            description: "A list of key characteristics that positively influence the specimen's value.",
            items: { type: Type.STRING }
        },
        negativeValueFactors: {
            type: Type.ARRAY,
            description: "A list of any visible flaws or characteristics that could negatively impact the value.",
            items: { type: Type.STRING }
        }
    },
    required: ["estimatedValueRange", "confidenceScore", "valuationMethodology", "positiveValueFactors", "negativeValueFactors"]
};

export const appraiseSpecimen = async (file: File, analysisData: AnalysisResult): Promise<AppraisalResult> => {
    const imagePart = await fileToGenerativePart(file);

    const fullPrompt = `You are a certified senior appraiser for a world-renowned auction house, specializing in gems, minerals, and fossils. You have been provided an image and the following initial identification data for a specimen:
    - Common Name: ${analysisData.commonName}
    - Scientific Name: ${analysisData.scientificName}
    - Type: ${analysisData.specimenType}
    - Description: ${analysisData.description}
    - Key Characteristics: ${analysisData.keyCharacteristics.join(', ')}

    Your task is to provide a detailed and accurate market appraisal based on the image. Scrutinize the image for quality indicators such as clarity, color saturation, condition (e.g., chips, fractures), size, and overall aesthetic appeal. Compare these observations against current market trends and comparable sales data for specimens of this type and quality. Provide a confident and realistic valuation. Respond ONLY with a valid JSON object that conforms to the specified schema.`;

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                { text: fullPrompt },
                imagePart
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: appraisalSchema,
        }
    });
    
    if (!response || !response.text) {
        console.warn("AI appraisal response was blocked or empty. Full response:", response);
        throw new Error("The AI appraisal was blocked, likely due to safety settings or an invalid request. Please try again.");
    }

    try {
        const jsonText = response.text.trim();
        const parsedResult = JSON.parse(jsonText);
        // Basic validation
        if (
            !parsedResult.estimatedValueRange ||
            typeof parsedResult.confidenceScore !== 'number' ||
            !parsedResult.valuationMethodology ||
            !Array.isArray(parsedResult.positiveValueFactors) ||
            !Array.isArray(parsedResult.negativeValueFactors)
        ) {
            throw new Error("Received malformed JSON data from API for appraisal.");
        }
        return parsedResult as AppraisalResult;
    } catch (e) {
        console.error("Failed to parse Gemini appraisal response:", response.text, e);
        throw new Error("The AI returned an unexpected format for the appraisal. Please try again.");
    }
};