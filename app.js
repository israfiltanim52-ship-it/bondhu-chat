// Bondhu Chat — Firebase configuration is set below.
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, where, getDocs, limit, enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyAm-_we8S2oKkmsblp_fAP95L6rkEaYjtE",
  authDomain: "bondhu-chat-b76d6.firebaseapp.com",
  projectId: "bondhu-chat-b76d6",
  storageBucket: "bondhu-chat-b76d6.firebasestorage.app",
  messagingSenderId: "247069315591",
  appId: "1:247069315591:web:53b1bbdf2e4ccd845750a2"
};
const configured = !Object.values(firebaseConfig).some(v => String(v).startsWith("PASTE_"));
const $ = id => document.getElementById(id);
const authView=$("authView"), appView=$("appView"), authMsg=$("authMsg");
let app,auth,db,storage,confirmation,recaptcha,me=null,activeFriend=null,stopMessages=null,stopChats=null;
let photoURL="";
const fallbackPhoto = "data:image/svg+xml,"+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="100%" height="100%" rx="48" fill="#dceaff"/><circle cx="48" cy="35" r="17" fill="#7ca9e8"/><path d="M15 88c3-22 17-32 33-32s30 10 33 32" fill="#7ca9e8"/></svg>');
$("myPhoto").src=fallbackPhoto;$("friendPhoto").src=fallbackPhoto;
if(!configured){$("setupNotice").classList.remove("hidden");$("sendOtpBtn").disabled=true;authMsg.textContent="Firebase কনফিগারেশন বসানোর পর SMS লগইন চালু হবে।";}
else{
  $("setupNotice").classList.add("hidden");
  app=initializeApp(firebaseConfig);auth=getAuth(app);db=getFirestore(app);storage=getStorage(app);
  enableIndexedDbPersistence(db).catch(()=>{}); // Offline cache may be unavailable in some browsers/devices.
  onAuthStateChanged(auth,async user=>{if(user){me=user;await loadProfile();showApp();}else{me=null;showAuth();}});
}
function showAuth(){authView.classList.remove("hidden");appView.classList.add("hidden");$("logoutBtn").classList.add("hidden");}
function showApp(){authView.classList.add("hidden");appView.classList.remove("hidden");$("logoutBtn").classList.remove("hidden");}
function normalizePhone(v){return v.trim().replace(/[()\s-]/g,"");}
function validPhone(v){return /^\+[1-9]\d{7,14}$/.test(v);}
$("sendOtpBtn").addEventListener("click",async()=>{
  if(!configured)return;
  const name=$("nameInput").value.trim(),phone=normalizePhone($("phoneInput").value);
  if(!name){authMsg.textContent="আপনার নাম লিখুন।";return;}
  if(!validPhone(phone)){authMsg.textContent="দেশের কোডসহ নম্বর লিখুন, যেমন +8801XXXXXXXXX।";return;}
  try{
    $("sendOtpBtn").disabled=true;
    if(!recaptcha)recaptcha=new RecaptchaVerifier(auth,"recaptcha-container",{size:"normal"});
    confirmation=await signInWithPhoneNumber(auth,phone,recaptcha);
    $("otpArea").classList.remove("hidden");authMsg.textContent="SMS কোড পাঠানো হয়েছে।";
  }catch(e){authMsg.textContent="কোড পাঠানো যায়নি: "+friendly(e);try{recaptcha?.clear();}catch{}recaptcha=null;}
  finally{$("sendOtpBtn").disabled=false;}
});
$("verifyOtpBtn").addEventListener("click",async()=>{
  try{
    const result=await confirmation.confirm($("otpInput").value.trim());
    me=result.user;
    const name=$("nameInput").value.trim()||"বন্ধু";
    let url=me.photoURL||fallbackPhoto;
    const file=$("photoInput").files?.[0];
    if(file){if(file.size>3*1024*1024)throw new Error("ছবির আকার ৩ MB-এর কম রাখুন।");const r=ref(storage,`profilePhotos/${me.uid}`);await uploadBytes(r,file);url=await getDownloadURL(r);}
    await setDoc(doc(db,"users",me.uid),{uid:me.uid,name,phone:me.phoneNumber,photoURL:url,updatedAt:serverTimestamp()},{merge:true});
    await loadProfile();showApp();
  }catch(e){authMsg.textContent="লগইন হয়নি: "+friendly(e);}
});
async function loadProfile(){
  const snap=await getDoc(doc(db,"users",me.uid));
  if(!snap.exists()){showAuth();authMsg.textContent="আপনার নাম লিখে প্রোফাইল সম্পূর্ণ করুন।";return;}
  const p=snap.data();$("myName").textContent=p.name||"বন্ধু";$("myPhone").textContent=p.phone||me.phoneNumber||"";$("myPhoto").src=p.photoURL||fallbackPhoto;photoURL=p.photoURL||fallbackPhoto;
  listenChats();
}
$("logoutBtn").addEventListener("click",async()=>{if(auth)await signOut(auth);if(stopChats)stopChats();if(stopMessages)stopMessages();});
$("findBtn").addEventListener("click",async()=>{
  $("findMsg").textContent="";$("foundFriend").replaceChildren();
  if(!me)return;
  const phone=normalizePhone($("friendPhone").value);
  if(!validPhone(phone)){$("findMsg").textContent="দেশের কোডসহ সঠিক ফোন নম্বর লিখুন।";return;}
  try{
    const q=query(collection(db,"users"),where("phone","==",phone),limit(1));const res=await getDocs(q);
    const found=res.docs.find(d=>d.id!==me.uid);
    if(!found){$("findMsg").textContent="এই নম্বরে কোনো অ্যাকাউন্ট পাওয়া যায়নি।";return;}
    const p=found.data(),row=document.createElement("div");row.className="friendResult";
    const img=document.createElement("img");img.className="avatar";img.src=p.photoURL||fallbackPhoto;
    const info=document.createElement("div");info.className="grow";const strong=document.createElement("strong");strong.textContent=p.name||"বন্ধু";const small=document.createElement("small");small.textContent=p.phone||"";info.append(strong,small);
    const btn=document.createElement("button");btn.className="primary";btn.textContent="মেসেজ";btn.onclick=()=>openChat({...p,uid:found.id});
    row.append(img,info,btn);$("foundFriend").append(row);
  }catch(e){$("findMsg").textContent="খুঁজতে সমস্যা হয়েছে: "+friendly(e);}
});
function chatId(a,b){return [a,b].sort().join("_");}
async function openChat(friend){
  if(!me||friend.uid===me.uid)return;
  activeFriend=friend;const id=chatId(me.uid,friend.uid);
  await setDoc(doc(db,"chats",id),{participants:[me.uid,friend.uid],updatedAt:serverTimestamp()},{merge:true});
  $("chatPanel").classList.remove("hidden");$("friendName").textContent=friend.name||"বন্ধু";$("friendPhoto").src=friend.photoURL||fallbackPhoto;$("sendMsg").textContent="";
  if(stopMessages)stopMessages();
  $("messages").replaceChildren();
  const q=query(collection(db,"chats",id,"messages"),orderBy("createdAt","asc"),limit(300));
  stopMessages=onSnapshot(q,snap=>{const box=$("messages");box.replaceChildren();snap.forEach(d=>{const m=d.data(),b=document.createElement("div");b.className="bubble"+(m.senderId===me.uid?" mine":"");const body=document.createElement("div");body.textContent=m.text||"";const time=document.createElement("time");time.textContent=m.createdAt?.toDate?m.createdAt.toDate().toLocaleString():"";b.append(body,time);box.append(b);});box.scrollTop=box.scrollHeight;},e=>$("sendMsg").textContent="মেসেজ পড়তে সমস্যা: "+friendly(e));
  $("chatPanel").scrollIntoView({behavior:"smooth",block:"start"});
}
$("backBtn").addEventListener("click",()=>{$("chatPanel").classList.add("hidden");activeFriend=null;if(stopMessages)stopMessages();});
$("sendForm").addEventListener("submit",async e=>{
  e.preventDefault();const text=$("messageInput").value.trim();if(!text||!me||!activeFriend)return;
  const input=$("messageInput");input.disabled=true;
  try{const id=chatId(me.uid,activeFriend.uid);await addDoc(collection(db,"chats",id,"messages"),{text,senderId:me.uid,createdAt:serverTimestamp()});await setDoc(doc(db,"chats",id),{participants:[me.uid,activeFriend.uid],lastMessage:text,updatedAt:serverTimestamp()},{merge:true});input.value="";$("sendMsg").textContent="";}
  catch(e){$("sendMsg").textContent="পাঠানো যায়নি। ইন্টারনেট ফিরে এলে আবার চেষ্টা করুন। "+friendly(e);}
  finally{input.disabled=false;input.focus();}
});
function listenChats(){
  if(stopChats)stopChats();
  const q=query(collection(db,"chats"),where("participants","array-contains",me.uid),orderBy("updatedAt","desc"),limit(50));
  stopChats=onSnapshot(q,async snap=>{
    const list=$("chatList");list.replaceChildren();
    if(snap.empty){list.innerHTML='<p class="muted">এখনো কোনো চ্যাট নেই। উপরে বন্ধুর নম্বর খুঁজুন।</p>';return;}
    for(const d of snap.docs){
      const c=d.data(),other=(c.participants||[]).find(id=>id!==me.uid);if(!other)continue;
      const ps=await getDoc(doc(db,"users",other));if(!ps.exists())continue;const p=ps.data();
      const btn=document.createElement("button");btn.className="chatItem";
      const img=document.createElement("img");img.className="avatar";img.src=p.photoURL||fallbackPhoto;
      const info=document.createElement("div");info.className="grow";const strong=document.createElement("strong");strong.textContent=p.name||"বন্ধু";const preview=document.createElement("span");preview.className="preview";preview.textContent=c.lastMessage||"চ্যাট খুলুন";info.append(strong,preview);btn.append(img,info);btn.onclick=()=>openChat({...p,uid:other});list.append(btn);
    }
  },e=>{$("chatList").textContent="চ্যাট তালিকা লোড হয়নি: "+friendly(e);});
}
function friendly(e){const code=e?.code||"";if(code.includes("invalid-phone-number"))return"ফোন নম্বর সঠিক নয়।";if(code.includes("too-many-requests"))return"অনেকবার চেষ্টা হয়েছে। পরে আবার চেষ্টা করুন।";if(code.includes("permission-denied"))return"Firebase Rules অনুমতি দিচ্ছে না। নির্দেশিকার Rules ধাপ দেখুন।";return e?.message||"আবার চেষ্টা করুন।";}
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}
