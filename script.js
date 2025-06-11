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

document.getElementById("code-tweet").addEventListener("click", addCodeTweet);

// Store tweets in memory for search functionality
let allTweets = [];

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

// Function to Fetch and Display Tweets
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

        tweetBlock.onclick = () => copyCodeToClipboard(tweetData.code, tweetBlock);

        const tooltip = document.createElement("span");
        tooltip.className = "copy-tooltip";
        tooltip.textContent = "Copied!";
        tweetBlock.appendChild(tooltip);

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
        snapshot.forEach((childSnapshot) => {
            const tweetData = childSnapshot.val();
            allTweets.push(tweetData);
        });

        // Sort tweets by timestamp in descending order (newest first)
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

// Fetch on Load
window.onload = fetchTweets;
