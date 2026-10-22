import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, orderBy, onSnapshot, serverTimestamp, updateDoc, getDocs, limit } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

/*
 * Bondhu Chat — premium black/blue starter.
 * Firebase project/config intentionally matches the user's existing project.
 * Do not delete/recreate the Firebase project or Authentication users.
 */
const firebaseConfig = {
  apiKey: "AIzaSyAm-_we8S2oKkmsbl_p_fAP95L6rkEaYjtE",
  authDomain: "bondhu-chat-b76d6.firebaseapp.com",
  projectId: "bondhu-chat-b76d6",
  storageBucket: "bondhu-chat-b76d6.firebasestorage.app",
  messagingSenderId: "247069315591",
  appId: "1:247069315591:web:53b1bbdf2e4ccd845750a2"
};
const fbApp = initializeApp(firebaseConfig);
const auth = getAuth(fbApp);
const db = getFirestore(fbApp);
const storage = getStorage(fbApp);

const $ = id => document.getElementById(id);
const state = { user:null, mode:"login", lang:"bn", peer:null, unsubMessages:null, unsubChats:null, recorder:null, stream:null, chunks:[], recording:false, activePage:"homePage", peerMessages:[] };
const words = {
  bn:{tagline:"বন্ধুত্বের কথোপকথন",authIntro:"নিরাপদে কথা বলুন, বন্ধুত্ব রাখুন কাছাকাছি।",login:"লগইন",signup:"নতুন অ্যাকাউন্ট",displayNameLabel:"আপনার নাম",email:"ইমেইল",password:"পাসওয়ার্ড",forgot:"পাসওয়ার্ড ভুলে গেছেন?",goodToSee:"আবার দেখা হয়ে ভালো লাগছে",yourSpace:"YOUR SPACE",stayConnected:"বন্ধুদের সঙ্গে যুক্ত থাকুন",homeDesc:"এক জায়গায় আপনার কথোপকথন, ভয়েস মেসেজ ও বন্ধুদের তালিকা।",openChats:"চ্যাট খুলুন",recentChats:"সাম্প্রতিক চ্যাট",seeAll:"সব দেখুন",noChats:"এখনো কোনো চ্যাট নেই।",comingSoon:"কল ফিচার আসছে",comingDesc:"অডিও ও ভিডিও কল পরবর্তী ধাপে যুক্ত হবে।",chats:"চ্যাট",searchPlaceholder:"ইমেইল দিয়ে বন্ধু খুঁজুন",search:"খুঁজুন",yourChats:"আপনার চ্যাট",directChat:"সরাসরি চ্যাট",startConversation:"কথোপকথন শুরু করুন।",recording:"রেকর্ড হচ্ছে…",messagePlaceholder:"মেসেজ লিখুন…",voiceHint:"ভয়েস রেকর্ড শুরু/শেষ করতে মাইক্রোফোন চাপুন।",calls:"কল",callsSoon:"অডিও ও ভিডিও কল শিগগিরই",callsSoonDesc:"এই সংস্করণে চ্যাট ও ভয়েস মেসেজ আগে চালু করা হয়েছে। বাস্তব কলের জন্য পরবর্তী ধাপে WebRTC signaling ও প্রয়োজনীয় নেটওয়ার্ক কনফিগারেশন যোগ করতে হবে।",callHistory:"কলের ইতিহাস",noCalls:"এখনো কোনো কল নেই।",profile:"প্রোফাইল",signedIn:"সাইন ইন করা আছে",language:"ভাষা",languageDesc:"বাংলা ও ইংরেজি",appearance:"থিম",appearanceDesc:"কালো-নীল প্রিমিয়াম",change:"পরিবর্তন",account:"অ্যাকাউন্ট",accountDesc:"আপনার অ্যাকাউন্ট থেকে বের হন",logout:"লগআউট",home:"Home",madeForFriends:"বন্ধুদের জন্য তৈরি",friend:"বন্ধু",online:"চ্যাটে আছেন",sent:"পাঠানো হয়েছে",seen:"দেখেছেন",voice:"ভয়েস মেসেজ",voiceUpload:"ভয়েস আপলোড হচ্ছে…",searching:"খোঁজা হচ্ছে…",noUser:"এই ইমেইলে কোনো ব্যবহারকারী পাওয়া যায়নি।",selfSearch:"নিজেকে বন্ধু হিসেবে যোগ করা যাবে না।",alreadyChat:"এই চ্যাটটি আপনার তালিকায় আছে।",chatCreated:"চ্যাট শুরু হয়েছে।",micDenied:"মাইক্রোফোন অনুমতি পাওয়া যায়নি। ব্রাউজারের অনুমতি ও HTTPS পরীক্ষা করুন।",recordStart:"রেকর্ডিং শুরু হয়েছে। শেষ করতে আবার মাইক্রোফোন চাপুন।",recordFailed:"এই ব্রাউজারে ভয়েস রেকর্ডিং সমর্থিত নয়।",sendFailed:"পাঠানো যায়নি। Firebase Rules ও ইন্টারনেট পরীক্ষা করুন।",loginFailed:"লগইন হয়নি। ইমেইল/পাসওয়ার্ড এবং Firebase Auth সেটিংস পরীক্ষা করুন।",signupFailed:"অ্যাকাউন্ট তৈরি হয়নি। ইমেইল ও পাসওয়ার্ড পরীক্ষা করুন।",profileMissing:"প্রোফাইলের নাম পাওয়া যায়নি",emptySearch:"বন্ধুর ইমেইল লিখুন।",resetSent:"পাসওয়ার্ড রিসেটের নির্দেশনা পাঠানো হয়েছে—ইনবক্স/স্প্যাম দেখুন।",resetFailed:"রিসেট ইমেইল পাঠানো যায়নি। ইমেইল ও Firebase সেটিংস পরীক্ষা করুন।",signedOut:"লগআউট হয়েছে।",languageChanged:"ভাষা পরিবর্তন হয়েছে।",themeChanged:"থিম পরিবর্তন হয়েছে।"},
  en:{tagline:"Conversations that connect",authIntro:"Talk freely. Keep your friends close.",login:"Log in",signup:"Create account",displayNameLabel:"Your name",email:"Email",password:"Password",forgot:"Forgot password?",goodToSee:"Good to see you again",yourSpace:"YOUR SPACE",stayConnected:"Stay close to your people",homeDesc:"Your conversations, voice messages and friends in one place.",openChats:"Open chats",recentChats:"Recent chats",seeAll:"See all",noChats:"No chats yet.",comingSoon:"Calls are coming",comingDesc:"Audio and video calls will be added in a later release.",chats:"Chats",searchPlaceholder:"Find a friend by email",search:"Search",yourChats:"Your chats",directChat:"Direct chat",startConversation:"Start the conversation.",recording:"Recording…",messagePlaceholder:"Write a message…",voiceHint:"Tap the microphone to start or stop recording.",calls:"Calls",callsSoon:"Audio and video calls are coming soon",callsSoonDesc:"This version prioritizes messaging and voice notes. Real calls need WebRTC signaling and network configuration in a later step.",callHistory:"Call history",noCalls:"No calls yet.",profile:"Profile",signedIn:"Signed in",language:"Language",languageDesc:"Bangla and English",appearance:"Theme",appearanceDesc:"Premium black and blue",change:"Change",account:"Account",accountDesc:"Sign out of your account",logout:"Log out",home:"Home",madeForFriends:"Made for friends",friend:"Friend",online:"In chat",sent:"Sent",seen:"Seen",voice:"Voice message",voiceUpload:"Uploading voice…",searching:"Searching…",noUser:"No user found for this email.",selfSearch:"You cannot add yourself.",alreadyChat:"This chat is already in your list.",chatCreated:"Chat started.",micDenied:"Microphone permission denied. Check browser permission and HTTPS.",recordStart:"Recording started. Tap the microphone again to finish.",recordFailed:"Voice recording is not supported by this browser.",sendFailed:"Could not send. Check Firebase Rules and your connection.",loginFailed:"Login failed. Check your email/password and Firebase Auth settings.",signupFailed:"Could not create account. Check your email and password.",profileMissing:"Profile name unavailable",emptySearch:"Enter a friend's email.",resetSent:"Password reset instructions sent. Check inbox and spam.",resetFailed:"Could not send reset email. Check email and Firebase settings.",signedOut:"Signed out.",languageChanged:"Language changed.",themeChanged:"Theme changed."}
};
const t = key => (words[state.lang] && words[state.lang][key]) || words.bn[key] || key;
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.remove("hidden");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.add("hidden"),3000);}
function status(el,msg,error=false){el.textContent=msg;el.classList.toggle("error",error);}
function initials(name){return (name||"B").trim().slice(0,1).toUpperCase();}
function escapeText(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
function applyLanguage(){
  document.documentElement.lang=state.lang==="bn"?"bn":"en";
  document.querySelectorAll("[data-i18n]").forEach(el=>{const k=el.dataset.i18n;if(words[state.lang][k])el.textContent=words[state.lang][k];});
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{const k=el.dataset.i18nPlaceholder;if(words[state.lang][k])el.placeholder=words[state.lang][k];});
  $("langToggle").textContent=state.lang==="bn"?"বাং":"EN";
  $("langToggle2").textContent=state.lang==="bn"?"বাংলা / EN":"EN / বাংলা";
  $("authSubmit").textContent=state.mode==="login"?t("login"):t("signup");
  $("loginMode").classList.toggle("active",state.mode==="login");$("signupMode").classList.toggle("active",state.mode==="signup");
  $("nameLabel").classList.toggle("hidden",state.mode==="login");$("displayName").classList.toggle("hidden",state.mode==="login");
}
function switchTheme(){document.body.classList.toggle("light");const light=document.body.classList.contains("light");localStorage.setItem("bondhuTheme",light?"light":"dark");toast(t("themeChanged"));}
function showPage(page){
  state.activePage=page;
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===page));
  document.querySelectorAll(".page").forEach(p=>p.classList.toggle("hidden",p.id!==page));
  document.querySelectorAll(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
}
function setupSignedIn(user){
  state.user=user;$("authView").classList.add("hidden");$("appView").classList.remove("hidden");$("bottomNav").classList.remove("hidden");
  const name=user.displayName||user.email?.split("@")[0]||t("friend");
  $("welcomeTitle").textContent=`${t("goodToSee")}, ${name}`;$("homeAvatar").textContent=initials(name);$("chatAvatar").textContent=initials(name);$("profileAvatar").textContent=initials(name);$("profileName").textContent=name;$("profileEmail").textContent=user.email||"";
  showPage("homePage");listenChats();
}
function teardown(){if(state.unsubChats)state.unsubChats();if(state.unsubMessages)state.unsubMessages();state.unsubChats=null;state.unsubMessages=null;state.peer=null;state.peerMessages=[];state.user=null;$("appView").classList.add("hidden");$("bottomNav").classList.add("hidden");$("authView").classList.remove("hidden");showPage("homePage");}
async function ensureUserProfile(user,name=""){
  const r=doc(db,"users",user.uid),snap=await getDoc(r);
  await setDoc(r,{uid:user.uid,email:(user.email||"").toLowerCase(),displayName:name||user.displayName||snap.data()?.displayName||user.email?.split("@")[0]||"Bondhu",updatedAt:serverTimestamp(),createdAt:snap.exists()?(snap.data().createdAt||serverTimestamp()):serverTimestamp()},{merge:true});
}
$("loginMode").addEventListener("click",()=>{state.mode="login";applyLanguage();status($("authMessage"),"");});
$("signupMode").addEventListener("click",()=>{state.mode="signup";applyLanguage();status($("authMessage"),"");});
$("authForm").addEventListener("submit",async e=>{
  e.preventDefault();const email=$("email").value.trim().toLowerCase(),password=$("password").value;
  $("authSubmit").disabled=true;status($("authMessage"),"");
  try{
    if(state.mode==="signup"){
      const name=$("displayName").value.trim();if(!name)throw new Error("NAME_REQUIRED");
      const cred=await createUserWithEmailAndPassword(auth,email,password);await updateProfile(cred.user,{displayName:name});await ensureUserProfile(cred.user,name);
    }else{const cred=await signInWithEmailAndPassword(auth,email,password);await ensureUserProfile(cred.user);}
  }catch(err){let msg=state.mode==="signup"?t("signupFailed"):t("loginFailed");if(err.message==="NAME_REQUIRED")msg=t("displayNameLabel");if(err.code==="auth/email-already-in-use")msg=state.lang==="bn"?"এই ইমেইলে আগে থেকেই অ্যাকাউন্ট আছে। লগইন করুন।":"An account already exists. Please log in.";if(err.code==="auth/too-many-requests"||err.code==="auth/quota-exceeded")msg=state.lang==="bn"?"অনেকবার চেষ্টা হয়েছে বা Firebase সীমা পূর্ণ। বারবার চেষ্টা না করে Firebase Console-এর Auth/Quota পরীক্ষা করুন।":"Too many attempts or Firebase quota reached. Check Firebase Auth/quotas before retrying.";status($("authMessage"),msg,true);
  }finally{$("authSubmit").disabled=false;}
});
$("resetPassword").addEventListener("click",async()=>{const email=$("email").value.trim();if(!email){status($("authMessage"),state.lang==="bn"?"আগে ইমেইল লিখুন।":"Enter your email first.",true);return;}try{await sendPasswordResetEmail(auth,email);status($("authMessage"),t("resetSent"));}catch(e){status($("authMessage"),t("resetFailed"),true);}});
$("logoutBtn").addEventListener("click",async()=>{try{await signOut(auth);toast(t("signedOut"));}catch(e){toast("Logout failed");}});
$("langToggle").addEventListener("click",toggleLanguage);$("langToggle2").addEventListener("click",toggleLanguage);
function toggleLanguage(){state.lang=state.lang==="bn"?"en":"bn";localStorage.setItem("bondhuLang",state.lang);applyLanguage();if(state.peer)renderMessages();toast(t("languageChanged"));}
$("themeToggle").addEventListener("click",switchTheme);$("themeToggle2").addEventListener("click",switchTheme);
document.querySelectorAll(".nav-item").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.page)));
document.querySelectorAll("[data-go]").forEach(b=>b.addEventListener("click",()=>showPage(b.dataset.go)));
$("backToChats").addEventListener("click",()=>{if(state.unsubMessages)state.unsubMessages();state.unsubMessages=null;state.peer=null;showPage("chatsPage");});
onAuthStateChanged(auth,async user=>{if(user){try{await ensureUserProfile(user);setupSignedIn(user);}catch(e){setupSignedIn(user);toast("Profile sync warning");}}else teardown();});
async function searchUser(){
  const email=$("userSearch").value.trim().toLowerCase();const out=$("searchResults");out.innerHTML="";
  if(!email){status($("searchMessage"),t("emptySearch"),true);return;}
  status($("searchMessage"),t("searching"));
  try{
    const q=query(collection(db,"users"),where("email","==",email),limit(1));const snap=await getDocs(q);
    if(snap.empty){status($("searchMessage"),t("noUser"));return;}
    const d=snap.docs[0].data();if(d.uid===state.user.uid){status($("searchMessage"),t("selfSearch"));return;}
    status($("searchMessage"),"");
    const b=document.createElement("button");b.className="chat-row";b.innerHTML=`<div class="avatar">${escapeText(initials(d.displayName))}</div><div class="chat-meta"><strong>${escapeText(d.displayName||t("friend"))}</strong><small>${escapeText(d.email||"")}</small></div><span class="unread">＋</span>`;
    b.addEventListener("click",()=>startChat({uid:d.uid,name:d.displayName||t("friend"),email:d.email||""}));out.appendChild(b);
  }catch(e){status($("searchMessage"),t("sendFailed"),true);}
}
$("searchBtn").addEventListener("click",searchUser);$("userSearch").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();searchUser();}});
async function startChat(peer){
  try{
    const chatId=[state.user.uid,peer.uid].sort().join("_");
    const r=doc(db,"chats",chatId),snap=await getDoc(r);
    if(!snap.exists())await setDoc(r,{members:[state.user.uid,peer.uid],memberInfo:{[state.user.uid]:{name:state.user.displayName||state.user.email,email:state.user.email},[peer.uid]:{name:peer.name,email:peer.email}},createdAt:serverTimestamp(),lastMessage:"",lastAt:serverTimestamp()});
    else await updateDoc(r,{[`memberInfo.${state.user.uid}`]:{name:state.user.displayName||state.user.email,email:state.user.email},[`memberInfo.${peer.uid}`]:{name:peer.name,email:peer.email}});
    openConversation({id:chatId,...peer});$("searchResults").innerHTML="";$("userSearch").value="";status($("searchMessage"),t("chatCreated"));
  }catch(e){toast(t("sendFailed"));}
}
function listenChats(){
  if(state.unsubChats)state.unsubChats();
  const q=query(collection(db,"chats"),where("members","array-contains",state.user.uid));
  state.unsubChats=onSnapshot(q,snap=>{
    const rows=[];snap.forEach(d=>{const x=d.data(),peerUid=(x.members||[]).find(id=>id!==state.user.uid),info=x.memberInfo?.[peerUid]||{};rows.push({id:d.id,peerUid,name:info.name||info.email||t("friend"),email:info.email||"",lastMessage:x.lastMessage||"",lastAt:x.lastAt});});
    rows.sort((a,b)=>(b.lastAt?.seconds||0)-(a.lastAt?.seconds||0));renderChatList(rows);
  },err=>toast("Could not load chats. Check Firestore Rules."));
}
function renderChatList(rows){
  const render=el=>{el.innerHTML="";if(!rows.length){el.innerHTML=`<div class="empty-state">${escapeText(t("noChats"))}</div>`;return;}
    rows.slice(0,20).forEach(c=>{const b=document.createElement("button");b.className="chat-row";b.innerHTML=`<div class="avatar">${escapeText(initials(c.name))}</div><div class="chat-meta"><strong>${escapeText(c.name)}</strong><small>${escapeText(c.lastMessage||"Bondhu Chat")}</small></div><span class="unread">›</span>`;b.addEventListener("click",()=>openConversation({id:c.id,uid:c.peerUid,name:c.name,email:c.email}));el.appendChild(b);});};
  render($("chatList"));render($("homeRecent"));
}
function openConversation(peer){
  if(state.unsubMessages)state.unsubMessages();state.peer=peer;state.peerMessages=[];
  $("peerName").textContent=peer.name;$("peerAvatar").textContent=initials(peer.name);$("peerStatus").textContent=t("directChat");showPage("conversationPage");
  const q=query(collection(db,"chats",peer.id,"messages"),orderBy("createdAt","asc"),limit(200));
  state.unsubMessages=onSnapshot(q,async snap=>{
    const arr=[];snap.forEach(d=>arr.push({id:d.id,...d.data()}));state.peerMessages=arr;renderMessages();
    // Read receipts: mark incoming messages as read by this signed-in user.
    for(const m of arr){if(m.senderId!==state.user.uid&&!(m.readBy||[]).includes(state.user.uid)){try{await updateDoc(doc(db,"chats",peer.id,"messages",m.id),{readBy:[...(m.readBy||[]),state.user.uid]});}catch(e){/* Rules may need to be updated. */}}}
  },err=>toast("Messages unavailable. Check Firestore Rules."));
}
function renderMessages(){
  const el=$("messages");el.innerHTML="";
  if(!state.peerMessages.length){el.innerHTML=`<div class="empty-state">${escapeText(t("startConversation"))}</div>`;return;}
  state.peerMessages.forEach(m=>{
    const mine=m.senderId===state.user.uid;const box=document.createElement("div");box.className="message"+(mine?" mine":"");
    if(m.type==="voice"&&m.audioUrl){box.innerHTML=`<audio controls preload="metadata" src="${escapeText(m.audioUrl)}"></audio><div class="msg-meta"><span>${escapeText(t("voice"))}</span><span>${mine&&((m.readBy||[]).includes(state.peer.uid))?escapeText(t("seen")):escapeText(mine?t("sent"):"")}</span></div>`;}
    else{box.innerHTML=`<div>${escapeText(m.text||"")}</div><div class="msg-meta"><span>${m.createdAt?.toDate?m.createdAt.toDate().toLocaleTimeString(state.lang==="bn"?"bn-BD":"en-US",{hour:"2-digit",minute:"2-digit"}):""}</span><span>${mine&&((m.readBy||[]).includes(state.peer.uid))?escapeText(t("seen")):escapeText(mine?t("sent"):"")}</span></div>`;}
    el.appendChild(box);
  });el.scrollTop=el.scrollHeight;
}
async function sendMessage(text){
  if(!state.peer||!text.trim())return;
  const chat=doc(db,"chats",state.peer.id);
  try{
    await addDoc(collection(db,"chats",state.peer.id,"messages"),{senderId:state.user.uid,text:text.trim(),type:"text",readBy:[state.user.uid],createdAt:serverTimestamp()});
    await updateDoc(chat,{lastMessage:text.trim().slice(0,100),lastAt:serverTimestamp(),lastSenderId:state.user.uid});
  }catch(e){toast(t("sendFailed"));}
}
$("messageForm").addEventListener("submit",e=>{e.preventDefault();const v=$("messageInput").value;$("messageInput").value="";sendMessage(v);});
async function toggleRecording(){
  if(state.recording){state.recorder?.stop();return;}
  if(!state.peer){toast(state.lang==="bn"?"আগে একটি চ্যাট খুলুন।":"Open a chat first.");return;}
  if(!navigator.mediaDevices?.getUserMedia||!window.MediaRecorder){toast(t("recordFailed"));return;}
  try{
    state.stream=await navigator.mediaDevices.getUserMedia({audio:true});
    const mime=["audio/webm;codecs=opus","audio/webm","audio/mp4"].find(x=>MediaRecorder.isTypeSupported(x));
    state.recorder=new MediaRecorder(state.stream,mime?{mimeType:mime}:undefined);state.chunks=[];
    state.recorder.ondataavailable=e=>{if(e.data.size)state.chunks.push(e.data);};
    state.recorder.onstop=async()=>{
      state.recording=false;$("voiceBtn").classList.remove("recording");$("recordingStatus").classList.add("hidden");
      state.stream?.getTracks().forEach(tr=>tr.stop());
      const blob=new Blob(state.chunks,{type:state.recorder.mimeType||"audio/webm"});state.chunks=[];
      if(blob.size){await uploadVoice(blob);}
    };
    state.recorder.start();state.recording=true;$("voiceBtn").classList.add("recording");$("recordingStatus").classList.remove("hidden");toast(t("recordStart"));
  }catch(e){toast(t("micDenied"));}
}
async function uploadVoice(blob){
  try{
    $("recordingStatus").classList.remove("hidden");$("recordingStatus").textContent=t("voiceUpload");
    const ext=blob.type.includes("mp4")?"m4a":"webm",path=`voice/${state.peer.id}/${state.user.uid}/${Date.now()}.${ext}`;
    const fileRef=storageRef(storage,path);await uploadBytes(fileRef,blob,{contentType:blob.type});const url=await getDownloadURL(fileRef);
    await addDoc(collection(db,"chats",state.peer.id,"messages"),{senderId:state.user.uid,type:"voice",text:"",audioUrl:url,storagePath:path,readBy:[state.user.uid],createdAt:serverTimestamp()});
    await updateDoc(doc(db,"chats",state.peer.id),{lastMessage:"🎙 Voice message",lastAt:serverTimestamp(),lastSenderId:state.user.uid});
  }catch(e){toast(t("sendFailed"));}finally{$("recordingStatus").classList.add("hidden");$("recordingStatus").innerHTML=`● <span>${escapeText(t("recording"))}</span>`;}
}
$("voiceBtn").addEventListener("click",toggleRecording);
if(localStorage.getItem("bondhuTheme")==="light")document.body.classList.add("light");
state.lang=localStorage.getItem("bondhuLang")||"bn";applyLanguage();
if("serviceWorker" in navigator && location.protocol!=="file:"){window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));}
