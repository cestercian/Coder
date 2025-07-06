// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

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

document.getElementById("code-tweet").addEventListener("click", addCodeTweet);

// Store tweets and their keys in memory for search and deletion
let allTweets = [];
let allTweetKeys = [];

// Function to Add Code Tweet
function addCodeTweet() {
    const codeInput = document.getElementById("codeInput").value;

    if (codeInput.trim() === "") return;

    const codeRef = ref(database, "tweets/");
    const newCodeRef = push(codeRef); // Generate unique ID
    set(newCodeRef, {
        code: codeInput,
        timestamp: Date.now(),
    });

    document.getElementById("codeInput").value = "";
}

// Function to Delete Code Tweet
function deleteCodeTweet(key) {
    const codeRef = ref(database, `tweets/${key}`);
    remove(codeRef);
}

// Function to Fetch and Display Tweets
function displayTweets(tweets = allTweets, keys = allTweetKeys) {
    const tweetsContainer = document.getElementById("tweetsContainer");
    tweetsContainer.innerHTML = "";

    if (tweets.length === 0) {
        tweetsContainer.innerHTML = "<p>No tweets found!</p>";
        return;
    }

    tweets.forEach((tweetData, idx) => {
        const tweetBlock = document.createElement("div");
        tweetBlock.className = "tweet-like-block";
        tweetBlock.textContent = tweetData.code;

        // Tooltip for copy
        const tooltip = document.createElement("span");
        tooltip.className = "copy-tooltip";
        tooltip.textContent = "Copied!";
        tweetBlock.appendChild(tooltip);

        // --- Deletion by 8 clicks on code block (not delete button) ---
        let clickCount = 0;
        tweetBlock.addEventListener("click", (e) => {
            // Ignore clicks on the delete button
            if (e.target === deleteBtn) return;
            clickCount++;
            if (clickCount === 8) {
                e.stopPropagation();
                const confirmDelete = confirm("Are you sure you want to delete this code tweet? This action cannot be undone.");
                if (confirmDelete) {
                    deleteCodeTweet(keys[idx]);
                }
                clickCount = 0;
            } else {
                // Copy to clipboard on other clicks
                copyCodeToClipboard(tweetData.code, tweetBlock);
            }
        });

        tweetsContainer.appendChild(tweetBlock);
    });
}

// Function to Copy Code
function copyCodeToClipboard(code, element) {
    navigator.clipboard.writeText(code).then(() => {
        const tooltip = element.querySelector(".copy-tooltip");
        tooltip.style.display = "block";
        setTimeout(() => {
            tooltip.style.display = "none";
        }, 1500);
    });
}

// Fetch Tweets and Enable Search
function fetchTweets() {
    const codeRef = ref(database, "tweets/");
    onValue(codeRef, (snapshot) => {
        allTweets = [];
        allTweetKeys = [];
        snapshot.forEach((childSnapshot) => {
            const tweetData = childSnapshot.val();
            allTweets.push(tweetData);
            allTweetKeys.push(childSnapshot.key);
        });
        // Sort tweets by timestamp in descending order (newest first)
        const zipped = allTweets.map((tweet, i) => ({tweet, key: allTweetKeys[i]}));
        zipped.sort((a, b) => b.tweet.timestamp - a.tweet.timestamp);
        allTweets = zipped.map(z => z.tweet);
        allTweetKeys = zipped.map(z => z.key);
        displayTweets(allTweets, allTweetKeys);
    });
}

// Search Functionality
document.getElementById("searchBar").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allTweets
        .map((tweet, i) => ({tweet, key: allTweetKeys[i]}))
        .filter(obj => obj.tweet.code.toLowerCase().includes(query));
    displayTweets(filtered.map(obj => obj.tweet), filtered.map(obj => obj.key));
});

// Fetch on Load
window.onload = fetchTweets;
