# Bondhu Chat — Premium Black & Blue

এই ZIP-এ রয়েছে Bondhu Chat-এর নতুন ওয়েব-অ্যাপ ফাইল: কালো-নীল প্রিমিয়াম UI, বাংলা/English switch, dark/light theme, নিচে Home/Chats/Calls/Profile navigation, email/password sign-in, ইমেইল দিয়ে ব্যবহারকারী খোঁজা, one-to-one text messaging, basic read receipts এবং voice message recording/upload/playback UI।

## খুব গুরুত্বপূর্ণ: আপনার Firebase অ্যাকাউন্ট সংরক্ষণ

- এই কোডটি আগের Firebase project `bondhu-chat-b76d6`-এর config ব্যবহার করে।
- **Firebase project মুছবেন না, নতুন project বানাবেন না, Authentication > Users থেকে কোনো user delete করবেন না।** এতে বিদ্যমান অ্যাকাউন্ট সংরক্ষিত থাকবে।
- এই ZIP আপলোড করলে GitHub-এর ওয়েব ফাইল বদলাবে; Firebase-এর Authentication Users মুছে ফেলা বা পুনরায় তৈরি করা হবে না।
- কোডে Firebase config আছে। Firebase web config সাধারণত client-side-এ থাকে; নিরাপত্তা আসবে Authentication, Firestore Rules, Storage Rules ও Firebase Console-এর সঠিক সেটিংস থেকে। API key-কে একা secret password মনে করবেন না।

## ZIP-এ কী আছে

- `index.html` — অ্যাপের পেজ ও নিচের navigation
- `app.js` — Firebase Authentication, chat, read receipt, voice-message logic
- `style.css` — premium black/blue styling ও light mode
- `manifest.json` / `sw.js` — basic PWA shell
- `firestore.rules` — Firestore security rules template
- `storage.rules` — voice files-এর Storage rules template
- `UPLOAD-NOTE.txt` — Android/GitHub upload নির্দেশনা

## Android ফোন থেকে GitHub Pages-এ আপলোড

1. ZIP-টি Extract করুন (Files app বা ZIP extractor দিয়ে)।
2. Chrome-এ এই repository খুলুন: https://github.com/israfiltanim52-ship-it/bondhu-chat
3. নিশ্চিত করুন আপনি সঠিক repository-তে লগইন করেছেন।
4. পুরোনো `index.html`, `app.js`, `style.css`, `manifest.json`, `sw.js`-এর backup ডাউনলোড/রাখুন।
5. GitHub repository-তে **Add file → Upload files** চাপুন।
6. Extract করা ফোল্ডারের ভেতরের ফাইলগুলো নির্বাচন করে upload করুন—ফোল্ডারটি নিজে নয়। Root-এ ফাইলগুলো যেন `index.html`, `app.js`, `style.css` ইত্যাদি থাকে।
7. Commit changes করুন। তারপর কয়েক মিনিট অপেক্ষা করে খুলুন: https://israfiltanim52-ship-it.github.io/bondhu-chat/
8. পুরোনো cache থাকলে Chrome site refresh করুন বা site data/cache clear করে আবার খুলুন।

## Firebase সেটআপ (ভয়েস মেসেজের জন্য দরকার)

1. Firebase Console-এ `bondhu-chat-b76d6` project খুলুন।
2. Firestore Database → Rules-এ `firestore.rules`-এর নিয়মগুলো পর্যালোচনা করে প্রয়োগ করুন।
3. Storage → Rules-এ `storage.rules`-এর নিয়মগুলো পর্যালোচনা করে প্রয়োগ করুন।
4. Storage bucket তৈরি/চালু না থাকলে Firebase Console-এর নির্দেশনা অনুসরণ করুন। কিছু Firebase project-এ Storage ব্যবহারে billing plan বা billing setup লাগতে পারে; Console যা দেখায় তা অনুসরণ করুন।
5. Authentication → Sign-in method-এ Email/Password enabled আছে কিনা দেখুন।
6. Authentication → Settings → Authorized domains-এ `israfiltanim52-ship-it.github.io` domain দরকার হলে যোগ করুন।
7. আগে থেকে ব্যবহারকারীর অ্যাকাউন্ট থাকলে তাদের পুরোনো email/password দিয়েই login করতে হবে। এই কোড কারও password reset বা quota সমস্যা নিজে থেকে ঠিক করতে পারে না।

## নিরাপত্তা ও সীমাবদ্ধতা

- `firestore.rules`-এ signed-in ব্যবহারকারীরা `users` collection পড়তে পারে, যাতে ইমেইল দিয়ে বন্ধু খোঁজা কাজ করে। এটি privacy-এর জন্য আদর্শ নয়। বড়/production অ্যাপে সার্ভার-সাইড search বা callable Cloud Function ব্যবহার করে আরও সীমিত করা উচিত।
- `storage.rules` Firebase Storage ও Firestore-এর rules cross-service access ব্যবহার করে; deploy করার আগে Firebase Rules Playground/Console-এ পরীক্ষা করুন।
- Read receipt basic `readBy` array হিসেবে রাখা হয়েছে; একাধিক ডিভাইস/বড় গ্রুপে আরও শক্তিশালী schema দরকার।
- Voice message কাজের জন্য browser-এ microphone permission, HTTPS, Storage এবং Storage Rules দরকার। iPhone/Safari/কিছু Android browser-এ MediaRecorder format আলাদা হতে পারে।
- **Audio/video calling এই release-এ চালু নয়।** Calls পেজে পরবর্তী ধাপের নোটিশ আছে। বাস্তব call-এর জন্য WebRTC, signaling, permission handling এবং কখনও TURN server দরকার।
- Push notifications, blocking/reporting, file/photo attachments, group chats ও end-to-end encryption এখনো অন্তর্ভুক্ত নয়।
- এই ZIP একটি কার্যকরী starter implementation; production-এ প্রকাশের আগে Firebase Rules, auth, voice upload এবং দুইটি test account দিয়ে messaging/read receipts পরীক্ষা করুন।

## সমস্যা হলে

- `auth/quota-exceeded` বা `auth/too-many-requests`: বারবার login চেষ্টা বন্ধ করে Firebase Console-এর Authentication usage/quota এবং project settings দেখুন।
- Login fail: সঠিক পুরোনো email/password ব্যবহার করুন; Firebase Authentication Users-এ account আছে কিনা দেখুন।
- Message/voice send fail: Console-এ Firestore Rules, Storage Rules, bucket, billing/setup এবং browser console error পরীক্ষা করুন।
