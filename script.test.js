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
const { copyCodeToClipboard, handleTweetClick, deleteTweet, addCodeTweet, displayTweets, fetchTweets, tweetClickTracker } = require('./script');


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
const { set: firebaseSetMock, ref: firebaseRefMock, push: firebasePushMock, onValue: firebaseOnValueMock } = require('https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js');

describe('Add Tweet Functionality', () => {
    beforeEach(() => {
        firebaseSetMock.mockClear();
        firebasePushMock.mockClear();
        document.getElementById('codeInput').value = '';
    });

    test('should call Firebase set with code and timestamp', () => {
        const codeInput = document.getElementById('codeInput');
        const testCode = 'function hello() {}';
        codeInput.value = testCode;

        addCodeTweet();

        expect(firebaseSetMock).toHaveBeenCalledTimes(1);
        expect(firebaseSetMock.mock.calls[0][1]).toMatchObject({
            code: testCode,
            timestamp: expect.any(Number),
        });
        expect(codeInput.value).toBe('');
    });

    test('should not call Firebase set if input is empty', () => {
        document.getElementById('codeInput').value = '   ';
        addCodeTweet();
        expect(firebaseSetMock).not.toHaveBeenCalled();
    });
});

describe('Display Tweets', () => {
    beforeEach(() => {
        document.getElementById('tweetsContainer').innerHTML = '';
    });
    test('shows no tweets found if empty', () => {
        displayTweets([]);
        expect(document.getElementById('tweetsContainer').innerHTML).toContain('No tweets found!');
    });
    test('renders tweets and attaches click handler', () => {
        const tweets = [{ code: 'abc', key: 'k1', timestamp: 1 }];
        displayTweets(tweets);
        const tweetBlock = document.querySelector('.tweet-like-block');
        expect(tweetBlock).not.toBeNull();
        expect(tweetBlock.textContent).toContain('abc');
        // Simulate click
        tweetBlock.click();
        // Should call handleTweetClick (covered indirectly)
    });
});

describe('handleTweetClick', () => {
    let tweetData, element, tweetKey;
    beforeEach(() => {
        tweetData = { code: 'test', key: 'key1' };
        element = document.createElement('div');
        const tooltip = document.createElement('span');
        tooltip.className = 'copy-tooltip';
        tooltip.style.display = 'none';
        element.appendChild(tooltip);
        tweetKey = 'key1';
        // Reset tracker
        const tracker = require('./script').tweetClickTracker;
        if (tracker) tracker.delete(tweetKey);
    });
    test('increments count and triggers delete after 10 clicks in 5s', () => {
        for (let i = 0; i < 10; i++) {
            handleTweetClick(tweetData, element, tweetKey);
        }
        expect(firebaseSetMock).toHaveBeenCalled(); // deleteTweet called
    });
    test('resets count if more than 5s passed', () => {
        handleTweetClick(tweetData, element, tweetKey);
        // Simulate time passing
        const tracker = require('./script').tweetClickTracker;
        const obj = tracker.get(tweetKey);
        obj.firstClickTime -= 6000;
        tracker.set(tweetKey, obj);
        handleTweetClick(tweetData, element, tweetKey);
        expect(tracker.get(tweetKey).count).toBe(1);
    });
    test('calls copyCodeToClipboard on every click', () => {
        // Save original
        const mod = require('./script');
        const origCopy = mod.copyCodeToClipboard;
        const mockCopy = jest.fn();
        mod.copyCodeToClipboard = mockCopy;
        handleTweetClick(tweetData, element, tweetKey);
        expect(mockCopy).toHaveBeenCalledWith('test', element);
        // Restore
        mod.copyCodeToClipboard = origCopy;
    });
});

describe('deleteTweet', () => {
    test('calls set with null to delete', () => {
        deleteTweet('delKey');
        expect(firebaseSetMock).toHaveBeenCalledWith(expect.stringContaining('mockRef(tweets/delKey)'), null);
    });
});

describe('fetchTweets', () => {
    test('calls onValue and sorts/updates allTweets', () => {
        // Setup snapshot mock
        const childSnapshotMock = { val: () => ({ code: 'c', timestamp: 2 }), key: 'k' };
        const forEachMock = jest.fn(cb => { cb(childSnapshotMock); });
        const snapshotMock = { forEach: forEachMock };
        firebaseOnValueMock.mockImplementationOnce((ref, cb) => {
            cb(snapshotMock);
            return jest.fn();
        });
        fetchTweets();
        // allTweets should be updated and displayTweets called
        expect(forEachMock).toHaveBeenCalled();
    });
});