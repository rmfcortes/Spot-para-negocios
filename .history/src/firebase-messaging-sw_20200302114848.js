importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.8.0/firebase-messaging.js');

firebase.initializeApp({
    'messagingSenderId': '666338399812'
});

const messaging = firebase.messaging();