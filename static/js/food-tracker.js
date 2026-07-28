/**
 * Mamta — Offline Food Tracking using TensorFlow.js (MobileNet)
 * Runs entirely in the browser to detect food items.
 */

const FoodTracker = (() => {
  let model = null;
  let isLoading = false;
  let isReady = false;

  async function loadModel(onProgress) {
    if (isReady || isLoading) return;
    isLoading = true;

    try {
      if (onProgress) onProgress('Loading TensorFlow.js...');
      
      // Dynamically load TF.js if not loaded
      if (!window.tf) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      if (onProgress) onProgress('Loading MobileNet vision model...');
      
      // Dynamically load MobileNet
      if (!window.mobilenet) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      // Load the model
      model = await mobilenet.load({ version: 2, alpha: 0.5 });
      isReady = true;
      isLoading = false;
      if (onProgress) onProgress('Vision model ready!');
      console.log('MobileNet model loaded successfully');
      
    } catch (error) {
      console.error('Failed to load vision model:', error);
      isLoading = false;
      if (onProgress) onProgress('Failed to load vision model.');
    }
  }

  // Simple dictionary to map some common mobilenet classes to Hindi/Friendly terms
  const FOOD_DICTIONARY = {
    'banana': { en: 'Banana', hi: 'केला' },
    'orange': { en: 'Orange', hi: 'संतरा' },
    'apple': { en: 'Apple', hi: 'सेब' },
    'lemon': { en: 'Lemon', hi: 'नींबू' },
    'strawberry': { en: 'Strawberry', hi: 'स्ट्रॉबेरी' },
    'pineapple': { en: 'Pineapple', hi: 'अनानास' },
    'pomegranate': { en: 'Pomegranate', hi: 'अनार' },
    'broccoli': { en: 'Broccoli', hi: 'ब्रोकोली' },
    'cauliflower': { en: 'Cauliflower', hi: 'फूलगोभी' },
    'bell pepper': { en: 'Capsicum', hi: 'शिमला मिर्च' },
    'cucumber': { en: 'Cucumber', hi: 'खीरा' },
    'pizza': { en: 'Pizza', hi: 'पिज्ज़ा' },
    'hamburger': { en: 'Burger', hi: 'बर्गर' },
    'hotdog': { en: 'Hot Dog', hi: 'हॉट डॉग' },
    'ice cream': { en: 'Ice Cream', hi: 'आइसक्रीम' },
    'cup': { en: 'Beverage/Milk', hi: 'दूध/पेय' },
    'plate': { en: 'Meal', hi: 'भोजन' },
    'bowl': { en: 'Dal/Soup', hi: 'दाल/सूप' },
    'bread': { en: 'Bread/Roti', hi: 'रोटी/ब्रेड' },
    'potpot': { en: 'Cooked Meal', hi: 'पका हुआ भोजन' }
  };

  function translateLabel(labelStr) {
    const lower = labelStr.toLowerCase();
    for (const [key, val] of Object.entries(FOOD_DICTIONARY)) {
      if (lower.includes(key)) {
        return val;
      }
    }
    // Fallback just uppercase first letter
    return { 
      en: labelStr.split(',')[0].charAt(0).toUpperCase() + labelStr.split(',')[0].slice(1), 
      hi: labelStr.split(',')[0]
    };
  }

  return {
    init: async (onProgress) => {
      await loadModel(onProgress);
    },
    
    isReady: () => isReady,
    
    /**
     * Predict the food in the image element
     * @param {HTMLImageElement} imageElement 
     * @returns {Promise<{en: string, hi: string}>}
     */
    classifyImage: async (imageElement) => {
      if (!isReady || !model) {
        throw new Error('Model not loaded yet');
      }
      
      const predictions = await model.classify(imageElement);
      if (predictions && predictions.length > 0) {
        // Return the top prediction mapped to friendly term
        return translateLabel(predictions[0].className);
      }
      return { en: 'Unknown Food', hi: 'अज्ञात भोजन' };
    }
  };
})();
