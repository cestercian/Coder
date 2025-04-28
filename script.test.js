// script.test.js

/**
 * @jest-environment jsdom
 */

// --- Mock Firebase Modules ---
// Mock the specific URLs imported in script.js *before* anything else
jest.mock('https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js', () => ({
    initializeApp: jest.fn().mockReturnValue({}), // Returns a dummy app object
}), { virtual: true }); // virtual: true is needed for non-package path mocks

jest.mock('https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js', () => ({
    getDatabase: jest.fn().mockReturnValue({}), // Returns a dummy database object
    ref: jest.fn((db, path) => `mockRef(${path})`), // Return a string representation for debugging if needed
    push: jest.fn((ref) => `${ref}/mockPushId`), // Return a string representation
    set: jest.fn().mockResolvedValue(undefined), // Mock 'set' to return a resolved Promise
    onValue: jest.fn((ref, callback) => {
        // You could simulate data loading here if needed for fetchTweets tests later
        // Example: setTimeout(() => callback({ val: () => ({ /* mock data */ }) }), 0);
        return jest.fn(); // Return a dummy unsubscribe function
    }),
}), { virtual: true });
// --- End Mock Firebase Modules ---


// --- Mock DOM Elements and Browser APIs needed by script.js ---
// Mock navigator.clipboard (as before)
Object.assign(navigator, {
    clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
    },
});

// Set up basic HTML structure needed by script.js BEFORE importing/requiring it
document.body.innerHTML = `
  <button id="code-tweet"></button>
  <input id="codeInput" value="initial code" />
  <div id="tweetsContainer"></div>
  <input id="searchBar" value="" />
  <!-- Test element specifically for copy test -->
  <div id="testElement">
    <span class="copy-tooltip" style="display: none;">Copied!</span>
  </div>
`;
// --- End Mock DOM Elements ---


// --- Import/Require the script *after* all mocks are set up ---
// Use require here as import statements are hoisted and might run before mocks
const { copyCodeToClipboard, handleTweetClick, deleteTweet } = require('./script');


// --- Your Tests ---
describe('Clipboard Functionality', () => {
    // Clear mocks before each test in this suite if needed
    beforeEach(() => {
        navigator.clipboard.writeText.mockClear();
        // Clear other mocks if necessary, e.g., firebaseSetMock.mockClear();
        // Reset DOM state if tests modify it significantly
        const tooltip = document.querySelector('#testElement .copy-tooltip');
        if (tooltip) tooltip.style.display = 'none';
    });

    test('copies code to clipboard and shows tooltip', async () => {
        const element = document.getElementById('testElement');
        const testCode = 'sample code';

        // Use fake timers to control setTimeout
        jest.useFakeTimers();

        await copyCodeToClipboard(testCode, element);

        // Assertions
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testCode);
        const tooltip = element.querySelector('.copy-tooltip');
        expect(tooltip.style.display).toBe('block'); // Check if tooltip is shown

        // Fast-forward time past the setTimeout duration (1500ms)
        jest.advanceTimersByTime(1500);
        expect(tooltip.style.display).toBe('none'); // Check if tooltip is hidden again

        // Restore real timers
        jest.useRealTimers();
    });
});

// --- Add More Tests ---
// Example structure for testing addCodeTweet (needs Firebase mocks)
// describe('Add Tweet Functionality', () => {
//   const { set: firebaseSetMock } = require('https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js');
//   const { addCodeTweet } = require('./script');

//   beforeEach(() => {
//     firebaseSetMock.mockClear();
//     document.getElementById('codeInput').value = ''; // Reset input
//   });

//   test('should call Firebase set with code and timestamp', () => {
//     const codeInput = document.getElementById('codeInput');
//     const testCode = 'function hello() {}';
//     codeInput.value = testCode;

//     addCodeTweet();

//     expect(firebaseSetMock).toHaveBeenCalledTimes(1);
//     // Check the structure of the data sent to Firebase set
//     expect(firebaseSetMock).toHaveBeenCalledWith(
//       expect.stringContaining('mockRef(tweets/)/mockPushId'), // Check if the correct ref was used
//       expect.objectContaining({ // Check the object structure
//         code: testCode,
//         timestamp: expect.any(Number), // Timestamp should be a number
//       })
//     );
//     expect(codeInput.value).toBe(''); // Input should be cleared
//   });

//   test('should not call Firebase set if input is empty', () => {
//      document.getElementById('codeInput').value = '   '; // Whitespace only
//      addCodeTweet();
//      expect(firebaseSetMock).not.toHaveBeenCalled();
//   });
// });