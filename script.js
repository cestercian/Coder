// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDaCViiww_eq9HewkSa5_Xx6DAl9N0c75c",
    authDomain: "code-copier.firebaseapp.com",
    databaseURL: "https://code-copier-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "code-copier",
    storageBucket: "code-copier.appspot.com",
    messagingSenderId: "626621100036",
    appId: "1:626621100036:web:710b29eeb150cab8280551"
};

// Initialize Firebase and Database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Event Listener for Add Button
document.getElementById("code-tweet").addEventListener("click", addCodeTweet);

// Store tweets in memory for search
let allTweets = [];

// Map to track clicks for hidden delete
const tweetClickTracker = new Map();

// Add Code Tweet Function
function addCodeTweet() {
    const codeInput = document.getElementById("codeInput").value;
    if (codeInput.trim() === "") return;

    const codeRef = ref(database, "tweets/");
    const newCodeRef = push(codeRef);
    set(newCodeRef, {
        code: codeInput,
        timestamp: Date.now(),
    });

    document.getElementById("codeInput").value = "";
}

// Display Tweets
function displayTweets(tweets = allTweets) {
    const tweetsContainer = document.getElementById("tweetsContainer");
    tweetsContainer.innerHTML = "";

    if (tweets.length === 0) {
        tweetsContainer.innerHTML = "<p>No tweets found!</p>";
        return;
    }

    tweets.forEach((tweetData) => {
        const tweetBlock = document.createElement("div");
        tweetBlock.className = "tweet-like-block";
        tweetBlock.textContent = tweetData.code;

        tweetBlock.onclick = () => handleTweetClick(tweetData, tweetBlock, tweetData.key);

        const tooltip = document.createElement("span");
        tooltip.className = "copy-tooltip";
        tooltip.textContent = "Copied!";
        tweetBlock.appendChild(tooltip);

        tweetsContainer.appendChild(tweetBlock);
    });
}

// Copy Code Function
function copyCodeToClipboard(code, element) {
    navigator.clipboard.writeText(code).then(() => {
        const tooltip = element.querySelector(".copy-tooltip");
        tooltip.style.display = "block";
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 1500);
    });
}

// Hidden Delete Handler
function handleTweetClick(tweetData, element, tweetKey) {
    const now = Date.now();
    const tracker = tweetClickTracker.get(tweetKey) || {
        count: 0,
        firstClickTime: now,
    };

    if (now - tracker.firstClickTime > 5000) {
        tracker.count = 0;
        tracker.firstClickTime = now;
    }

    tracker.count += 1;

    // Trigger delete if clicked 10 times within 5 seconds
    if (tracker.count >= 10) {
        deleteTweet(tweetKey);
        tweetClickTracker.delete(tweetKey);
        return;
    }

    tweetClickTracker.set(tweetKey, tracker);

    // Still allow copy on every click
    copyCodeToClipboard(tweetData.code, element);
}

// Delete Tweet Function
function deleteTweet(tweetKey) {
    const codeRef = ref(database, `tweets/${tweetKey}`);
    set(codeRef, null); // Delete by setting to null
}

// Fetch Tweets
function fetchTweets() {
    const codeRef = ref(database, "tweets/");
    onValue(codeRef, (snapshot) => {
        allTweets = [];
        snapshot.forEach((childSnapshot) => {
            const tweetData = childSnapshot.val();
            allTweets.push({ ...tweetData, key: childSnapshot.key });
        });

        allTweets.sort((a, b) => b.timestamp - a.timestamp);
        displayTweets(allTweets);
    });
}

// Search Functionality
document.getElementById("searchBar").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filteredTweets = allTweets.filter((tweet) =>
        tweet.code.toLowerCase().includes(query)
    );
    displayTweets(filteredTweets);
});

// Fetch on Page Load
window.onload = fetchTweets;