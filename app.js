
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  onSnapshot,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

/* Firebase configuration */
const firebaseConfig = {
  apiKey: "AIzaSyAm-_we8S2oKkmsblp_fAP95L6rkEaYjtE",
  authDomain: "bondhu-chat-b76d6.firebaseapp.com",
  projectId: "bondhu-chat-b76d6",
  storageBucket: "bondhu-chat-b76d6.firebasestorage.app",
  messagingSenderId: "247069315591",
  appId: "1:247069315591:web:53b1bbdf2e4ccd845750a2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const $ = id => document.getElementById(id);

const state = {
  mode: "login",
  lang: localStorage.getItem("bc-lang") || "bn",
  theme: localStorage.getItem("bc-theme") || "dark",
  user: null,
  peer: null,
  unsubscribeMessages: null,
  unsubscribeChats: null
};

const translations = {
  bn: {
    tagline: "বন্ধুত্বের কথোপকথন",
    authIntro: "নিরাপদে কথা বলুন, বন্ধুত্ব রাখুন কাছাকাছি।",
    login: "লগইন",
    signup: "নতুন অ্যাকাউন্ট",
    displayNameLabel: "আপনার নাম",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    forgot: "পাসওয়ার্ড ভুলে গেছেন?",
    goodToSee: "আবার দেখা হয়ে ভালো লাগছে",
    yourSpace: "আপনার নিজস্ব জগৎ",
    stayConnected: "বন্ধুদের সঙ্গে যুক্ত থাকুন",
    homeDesc: "এক জায়গায় আপনার কথোপকথন ও বন্ধুদের তালিকা।",
    openChats: "চ্যাট খুলুন",
    recentChats: "সাম্প্রতিক চ্যাট",
    seeAll: "সব দেখুন",
    noChats: "এখনো কোনো চ্যাট নেই।",
    comingSoon: "কল ফিচার আসছে",
    comingDesc: "অডিও ও ভিডিও কল পরবর্তী ধাপে যুক্ত হবে।",
    chats: "চ্যাট",
    searchPlaceholder: "বন্ধুর ইমেইল লিখুন",
    search: "খুঁজুন",
    yourChats: "আপনার চ্যাট",
    directChat: "সরাসরি চ্যাট",
    startConversation: "কথোপকথন শুরু করুন।",
    recording: "ভয়েস রেকর্ডিং এখনো যুক্ত করা হয়নি।",
    messagePlaceholder: "মেসেজ লিখুন…",
    voiceHint: "এখানে টেক্সট মেসেজ পাঠাতে পারবেন।",
    calls: "কল",
    callsSoon: "অডিও ও ভিডিও কল শিগগিরই",
    callsSoonDesc: "এই সংস্করণে টেক্সট চ্যাট চালু করা হয়েছে।",
    callHistory: "কলের ইতিহাস",
    noCalls: "এখনো কোনো কল নেই।",
    profile: "প্রোফাইল",
    signedIn: "সাইন ইন করা আছে",
    language: "ভাষা",
    languageDesc: "বাংলা ও ইংরেজি",
    appearance: "থিম",
    appearanceDesc: "কালো-নীল প্রিমিয়াম",
    change: "পরিবর্তন",
    account: "অ্যাকাউন্ট",
    accountDesc: "আপনার অ্যাকাউন্ট থেকে বের হন",
    logout: "লগআউট",
    madeForFriends: "বন্ধুদের জন্য তৈরি",
    home: "হোম"
  },
  en: {
    tagline: "Conversations with friends",
    authIntro: "Talk privately and stay close to your friends.",
    login: "Log in",
    signup: "Create account",
    displayNameLabel: "Your name",
    email: "Email",
    password: "Password",
    forgot: "Forgot password?",
    goodToSee: "Good to see you again",
    yourSpace: "YOUR SPACE",
    stayConnected: "Stay connected with friends",
    homeDesc: "Your conversations and friends in one place.",
    openChats: "Open chats",
    recentChats: "Recent chats",
    seeAll: "See all",
    noChats: "No chats yet.",
    comingSoon: "Calling is coming",
    comingDesc: "Audio and video calls may be added later.",
    chats: "Chats",
    searchPlaceholder: "Enter your friend's email",
    search: "Search",
    yourChats: "Your chats",
    directChat: "Direct chat",
    startConversation: "Start a conversation.",
    recording: "Voice recording is not implemented yet.",
    messagePlaceholder: "Write a message…",
    voiceHint: "Text messaging is available.",
    calls: "Calls",
    callsSoon: "Audio and video calls coming soon",
    callsSoonDesc: "Text chat is available in this version.",
    callHistory: "Call history",
    noCalls: "No calls yet.",
    profile: "Profile",
    signedIn: "Signed in",
    language: "Language",
    languageDesc: "Bangla and English",
    appearance: "Theme",
    appearanceDesc: "Premium dark blue",
    change: "Change",
    account: "Account",
    accountDesc: "Sign out of your account",
    logout: "Log out",
    madeForFriends: "Made for friends",
    home: "Home"
  }
};

function t(key) {
  return translations[state.lang]?.[key] || translations.bn[key] || key;
}

function status(element, message, error = false) {
  if (!element) return;
  element.textContent = message;
  element.style.color = error ? "#ff7777" : "";
}

function showToast(message) {
  const toast = $("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  setTimeout(() => toast.classList.add("hidden"), 3500);
}

function readableError(error) {
  const messages = {
    "auth/api-key-not-valid": "Firebase API key অবৈধ বা অনুমোদিত নয়। Firebase Console-এ Web App config ও API key পরীক্ষা করুন।",
    "auth/invalid-api-key": "Firebase API key সঠিক নয়।",
    "auth/invalid-credential": "ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।",
    "auth/invalid-email": "সঠিক ইমেইল লিখুন।",
    "auth/email-already-in-use": "এই ইমেইলে অ্যাকাউন্ট আছে। লগইন করুন।",
    "auth/weak-password": "আরও শক্তিশালী পাসওয়ার্ড দিন।",
    "auth/user-not-found": "এই ইমেইলে অ্যাকাউন্ট পাওয়া যায়নি।",
    "auth/wrong-password": "পাসওয়ার্ড সঠিক নয়।",
    "auth/too-many-requests": "অনেকবার চেষ্টা হয়েছে। কিছুক্ষণ পরে চেষ্টা করুন।",
    "auth/network-request-failed": "ইন্টারনেট সংযোগ পরীক্ষা করুন।",
    "permission-denied": "Firebase Firestore Rules অনুমতি দিচ্ছে না।",
    "unavailable": "Firebase সার্ভারে সংযোগ হচ্ছে না। পরে চেষ্টা করুন।"
  };

  return messages[error.code] ||
    `${error.code || "error"}: ${error.message || "কাজটি সম্পন্ন হয়নি।"}`;
}

function applyLanguage() {
  document.documentElement.lang = state.lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[state.lang][key]) {
      el.textContent = translations[state.lang][key];
    }
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[state.lang][key]) {
      el.placeholder = translations[state.lang][key];
    }
  });

  if ($("langToggle")) {
    $("langToggle").textContent = state.lang === "bn" ? "বাং" : "EN";
  }

  if ($("langToggle2")) {
    $("langToggle2").textContent = state.lang === "bn" ? "বাংলা / EN" : "EN / বাংলা";
  }

  if ($("loginMode")) {
    $("loginMode").classList.toggle("active", state.mode === "login");
  }

  if ($("signupMode")) {
    $("signupMode").classList.toggle("active", state.mode === "signup");
  }

  if ($("authSubmit")) {
    $("authSubmit").textContent = t(state.mode);
  }

  if ($("nameLabel")) {
    $("nameLabel").classList.toggle("hidden", state.mode !== "signup");
  }

  if ($("displayName")) {
    $("displayName").classList.toggle("hidden", state.mode !== "signup");
    $("displayName").required = state.mode === "signup";
  }

  if ($("password")) {
    $("password").autocomplete =
      state.mode === "signup" ? "new-password" : "current-password";
  }
}

function applyTheme() {
  document.documentElement.dataset.theme = state.theme;
  document.body.dataset.theme = state.theme;
  document.documentElement.classList.toggle("light-theme", state.theme === "light");
  document.body.classList.toggle("light-theme", state.theme === "light");
  localStorage.setItem("bc-theme", state.theme);
}

function showSignedInView(user) {
  $("authView")?.classList.add("hidden");
  $("appView")?.classList.remove("hidden");
  $("bottomNav")?.classList.remove("hidden");

  const name = user.displayName || user.email?.split("@")[0] || "বন্ধু";
  if ($("welcomeTitle")) $("welcomeTitle").textContent = `হ্যালো, ${name}!`;
  if ($("profileName")) $("profileName").textContent = name;
  if ($("profileEmail")) $("profileEmail").textContent = user.email || "";

  ["homeAvatar", "chatAvatar", "profileAvatar"].forEach(id => {
    if ($(id)) $(id).textContent = name.charAt(0).toUpperCase();
  });
}

function showSignedOutView() {
  $("authView")?.classList.remove("hidden");
  $("appView")?.classList.add("hidden");
  $("bottomNav")?.classList.add("hidden");
}

async function ensureUserProfile(user, displayName = "") {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  const name = displayName || user.displayName || user.email?.split("@")[0] || "বন্ধু";

  await setDoc(userRef, {
    uid: user.uid,
    name,
    email: user.email || "",
    updatedAt: serverTimestamp(),
    ...(snapshot.exists() ? {} : { createdAt: serverTimestamp() })
  }, { merge: true });
}

async function submitAuth(event) {
  event.preventDefault();

  const email = $("email")?.value.trim().toLowerCase();
  const password = $("password")?.value || "";
  const displayName = $("displayName")?.value.trim() || "";
  const submitButton = $("authSubmit");

  if (!email || !password) {
    status($("authMessage"), "ইমেইল ও পাসওয়ার্ড লিখুন।", true);
    return;
  }

  if (state.mode === "signup" && !displayName) {
    status($("authMessage"), "আপনার নাম লিখুন।", true);
    return;
  }

  submitButton.disabled = true;
  status($("authMessage"), "");

  try {
    if (state.mode === "signup") {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(credential.user, { displayName });
      await ensureUserProfile(credential.user, displayName);
    } else {
      const credential = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserProfile(credential.user);
    }
  } catch (error) {
    console.error("Authentication error:", error.code, error.message);
    status($("authMessage"), readableError(error), true);
  } finally {
    submitButton.disabled = false;
  }
}

async function resetPassword() {
  const email = $("email")?.value.trim().toLowerCase();

  if (!email) {
    status($("authMessage"), "আগে ইমেইল লিখুন।", true);
    $("email")?.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
    status($("authMessage"), "পাসওয়ার্ড রিসেটের নির্দেশনা ইমেইলে পাঠানো হয়েছে।");
  } catch (error) {
    console.error("Password reset error:", error);
    status($("authMessage"), readableError(error), true);
  }
}

function openPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle("active", page.id === pageId);
  });

  document.querySelectorAll(".nav-item").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });
}

function chatIdFor(uid1, uid2) {
  return [uid1, uid2].sort().join("_");
}

async function searchFriend() {
  const email = $("userSearch")?.value.trim().toLowerCase();
  status($("searchMessage"), "");
  $("searchResults").replaceChildren();

  if (!email) {
    status($("searchMessage"), "বন্ধুর ইমেইল লিখুন।", true);
    return;
  }

  if (email === state.user.email?.toLowerCase()) {
    status($("searchMessage"), "নিজেকে বন্ধু হিসেবে যোগ করা যাবে না.", true);
    return;
  }

  try {
    const usersQuery = query(
      collection(db, "users"),
      where("email", "==", email)
    );

    const results = await getDocs(usersQuery);
    const friend = results.docs.find(item => item.id !== state.user.uid);

    if (!friend) {
      status($("searchMessage"), "এই ইমেইলে কোনো ব্যবহারকারী পাওয়া যায়নি।", true);
      return;
    }

    const userData = friend.data();
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result";
    button.textContent = `${userData.name || "বন্ধু"} (${userData.email})`;
    button.addEventListener("click", () => openConversation({
      uid: friend.id,
      name: userData.name || "বন্ধু",
      email: userData.email || ""
    }));

    $("searchResults").append(button);
  } catch (error) {
    console.error("User search error:", error);
    status($("searchMessage"), readableError(error), true);
  }
}

async function openConversation(peer) {
  if (!state.user || !peer?.uid || peer.uid === state.user.uid) return;

  state.peer = peer;
  openPage("conversationPage");

  if ($("peerName")) $("peerName").textContent = peer.name;
  if ($("peerAvatar")) $("peerAvatar").textContent = peer.name.charAt(0).toUpperCase();
  if ($("messages")) $("messages").replaceChildren();

  const empty = document.createElement("div");
  empty.className = "empty-state";
  empty.textContent = t("startConversation");
  $("messages").append(empty);

  if (state.unsubscribeMessages) state.unsubscribeMessages();

  const id = chatIdFor(state.user.uid, peer.uid);
  const chatRef = doc(db, "chats", id);

  try {
    await setDoc(chatRef, {
      members: [state.user.uid, peer.uid].sort(),
      updatedAt: serverTimestamp()
    }, { merge: true });

    const messagesQuery = query(
      collection(db, "chats", id, "messages"),
      orderBy("createdAt", "asc")
    );

    state.unsubscribeMessages = onSnapshot(messagesQuery, snapshot => {
      const container = $("messages");
      container.replaceChildren();

      if (snapshot.empty) {
        const message = document.createElement("div");
        message.className = "empty-state";
        message.textContent = t("startConversation");
        container.append(message);
        return;
      }

      snapshot.forEach(item => {
        const data = item.data();
        const bubble = document.createElement("div");
        bubble.className = data.senderId === state.user.uid ? "message sent" : "message received";

        const text = document.createElement("div");
        text.textContent = data.text || "";
        bubble.append(text);

        const time = document.createElement("small");
        if (data.createdAt?.toDate) {
          time.textContent = data.createdAt.toDate().toLocaleTimeString(
            state.lang === "bn" ? "bn-BD" : "en-US",
            { hour: "2-digit", minute: "2-digit" }
          );
        }
        bubble.append(time);
        container.append(bubble);
      });

      container.scrollTop = container.scrollHeight;
    }, error => {
      console.error("Messages listener error:", error);
      showToast(readableError(error));
    });
  } catch (error) {
    console.error("Open conversation error:", error);
    showToast(readableError(error));
  }
}

async function sendMessage(event) {
  event.preventDefault();

  const input = $("messageInput");
  const text = input?.value.trim();

  if (!text || !state.user || !state.peer) {
    if (!state.peer) showToast("আগে একজন বন্ধুর চ্যাট খুলুন।");
    return;
  }

  const button = $("sendBtn");
  button.disabled = true;

  try {
    const id = chatIdFor(state.user.uid, state.peer.uid);
    await addDoc(collection(db, "chats", id, "messages"), {
      text,
      senderId: state.user.uid,
      senderName: state.user.displayName || state.user.email,
      createdAt: serverTimestamp()
    });

    await setDoc(doc(db, "chats", id), {
      members: [state.user.uid, state.peer.uid].sort(),
      lastMessage: text,
      updatedAt: serverTimestamp()
    }, { merge: true });

    input.value = "";
  } catch (error) {
    console.error("Send message error:", error);
    showToast(readableError(error));
  } finally {
    button.disabled = false;
  }
}

function listenToChats(user) {
  if (state.unsubscribeChats) state.unsubscribeChats();

  const chatsQuery = query(
    collection(db, "chats"),
    where("members", "array-contains", user.uid)
  );

  state.unsubscribeChats = onSnapshot(chatsQuery, async snapshot => {
    const lists = [$("chatList"), $("homeRecent")].filter(Boolean);

    for (const list of lists) list.replaceChildren();

    if (snapshot.empty) {
      lists.forEach(list => {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = t("noChats");
        list.append(empty);
      });
      return;
    }

    const rows = await Promise.all(snapshot.docs.map(async item => {
      const data = item.data();
      const peerUid = (data.members || []).find(uid => uid !== user.uid);
      if (!peerUid) return null;

      const peerSnapshot = await getDoc(doc(db, "users", peerUid));
      const peerData = peerSnapshot.exists() ? peerSnapshot.data() : {};

      return {
        uid: peerUid,
        name: peerData.name || peerData.email || "বন্ধু",
        email: peerData.email || "",
        lastMessage: data.lastMessage || ""
      };
    }));

    rows.filter(Boolean).forEach(peer => {
      lists.forEach(list => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat-item";

        const name = document.createElement("strong");
        name.textContent = peer.name;

        const last = document.createElement("small");
        last.textContent = peer.lastMessage || peer.email;

        button.append(name, last);
        button.addEventListener("click", () => openConversation(peer));
        list.append(button);
      });
    });
  }, error => {
    console.error("Chat list error:", error);
    showToast(readableError(error));
  });
}

/* Buttons and forms */
$("authForm")?.addEventListener("submit", submitAuth);
$("resetPassword")?.addEventListener("click", resetPassword);

$("loginMode")?.addEventListener("click", () => {
  state.mode = "login";
  applyLanguage();
  status($("authMessage"), "");
});

$("signupMode")?.addEventListener("click", () => {
  state.mode = "signup";
  applyLanguage();
  status($("authMessage"), "");
});

$("langToggle")?.addEventListener("click", toggleLanguage);
$("langToggle2")?.addEventListener("click", toggleLanguage);
$("themeToggle")?.addEventListener("click", toggleTheme);
$("themeToggle2")?.addEventListener("click", toggleTheme);

function toggleLanguage() {
  state.lang = state.lang === "bn" ? "en" : "bn";
  localStorage.setItem("bc-lang", state.lang);
  applyLanguage();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  applyTheme();
}

$("searchBtn")?.addEventListener("click", searchFriend);
$("userSearch")?.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    searchFriend();
  }
});

$("messageForm")?.addEventListener("submit", sendMessage);

$("backToChats")?.addEventListener("click", () => openPage("chatsPage"));

$("voiceBtn")?.addEventListener("click", () => {
  showToast(state.lang === "bn"
    ? "ভয়েস মেসেজ ফিচার পরবর্তী সংস্করণে যোগ করতে হবে।"
    : "Voice messaging is not implemented yet.");
});

$("logoutBtn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("লগআউট হয়েছে।");
  } catch (error) {
    showToast(readableError(error));
  }
});

document.querySelectorAll("[data-go]").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.go));
});

document.querySelectorAll("[data-page]").forEach(button => {
  button.addEventListener("click", () => openPage(button.dataset.page));
});

/* Restore settings */
applyLanguage();
applyTheme();

/* Keep the UI in sync with Firebase Authentication */
onAuthStateChanged(auth, async user => {
  state.user = user;

  if (!user) {
    if (state.unsubscribeMessages) state.unsubscribeMessages();
    if (state.unsubscribeChats) state.unsubscribeChats();

    state.unsubscribeMessages = null;
    state.unsubscribeChats = null;
    state.peer = null;

    showSignedOutView();
    return;
  }

  try {
    await ensureUserProfile(user);
    showSignedInView(user);
    listenToChats(user);
    openPage("homePage");
  } catch (error) {
    console.error("User profile initialization error:", error);
    showSignedInView(user);
    showToast(readableError(error));
  }
});
    
