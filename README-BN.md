# বন্ধু চ্যাট (Bondhu Chat) — Starter

এটি একটি প্রাথমিক web-chat/PWA starter, সরাসরি তৈরি Android APK নয়। Firebase config না বসালে লগইন ও চ্যাট কাজ করবে না। প্রকাশের আগে নিরাপত্তা ও বাস্তব ফোনে পরীক্ষা আবশ্যক।

## Android ফোনে সেটআপ

1. Firebase Console খুলুন: https://console.firebase.google.com/
2. নতুন project তৈরি করুন, নাম দিন `bondhu-chat` (বা পছন্দমতো)।
3. Project settings → Your apps → Web app যোগ করুন। দেখানো `firebaseConfig` কপি করে `app.js`-এর `PASTE_...` মানগুলো বদলান।
4. Authentication → Sign-in method → Phone চালু করুন। Firebase-এর নির্দেশনা অনুযায়ী SMS অঞ্চল/বাজেট সেটিং যাচাই করুন। পরীক্ষার জন্য test phone numbers ব্যবহার করতে পারেন।
5. Firestore Database তৈরি করুন। Production নয়, প্রথমে test নয়—Rules tab-এ `firestore.rules`-এর নিয়ম বসান।
6. Storage চালু করলে `storage.rules`-এর নিয়ম বসান। Storage ব্যবহারের আগে আপনার project-এর বর্তমান plan/কোটা দেখুন।
7. Netlify-তে লগইন করে Add new site → Deploy manually-তে এই ZIP-এর ফাইলগুলো (unzip করে) আপলোড করুন। অথবা Git repository দিয়ে deploy করুন।
8. Netlify-তে HTTPS সাইট খোলার পর Firebase Authentication-এর Authorized domains-এ আপনার `....netlify.app` domain যোগ করুন।
9. Firebase Phone Auth-এর reCAPTCHA ও SMS বাস্তব ফোনে পরীক্ষা করুন। OTP খরচ/কোটা প্রযোজ্য হতে পারে।
10. Android APK পেতে HTTPS-এ প্রকাশিত PWA URL PWABuilder-এ দিন: https://www.pwabuilder.com/ । Android package তৈরি করে সাইনিং/বিল্ড নির্দেশনা অনুসরণ করুন। কিছু ধাপ কম্পিউটার বা ক্লাউড বিল্ডে সহজ হতে পারে। APK ইনস্টল করার আগে নিজে পরীক্ষা করুন।

## অফলাইন আচরণ

Service worker অ্যাপের shell cache করে। Firestore local persistence চালু করার চেষ্টা করে। অফলাইনে আগের cache হওয়া মেসেজ দেখা যেতে পারে, তবে প্রথমবার না-খোলা চ্যাটের সব ইতিহাস অফলাইনে থাকবে না। এই starter-এ offline অবস্থায় নতুন মেসেজের জন্য আলাদা local outbox queue নেই; পাঠাতে ব্যর্থ হলে সংযোগ ফিরলে আবার Send চাপতে হবে। সম্পূর্ণ queued sending যোগ করতে IndexedDB outbox ও retry logic দরকার।

## জরুরি নিরাপত্তা সীমাবদ্ধতা

- এই starter production-ready নয়। `users` collection-এর read rule signed-in ব্যবহারকারীদের ফোন নম্বর-সহ সব profile পড়তে দেয়, যাতে exact phone search কাজ করে। এটি ফোন নম্বরের গোপনীয়তার জন্য আদর্শ নয়। Public launch-এর আগে phone search-কে server-side callable function-এ সরান বা privacy-preserving contact discovery তৈরি করুন।
- Firestore rules-এ chat participant checks আছে, তবু বাস্তব পরীক্ষায় rules simulator ব্যবহার করুন।
- ক্লায়েন্টে Firebase config থাকা স্বাভাবিক; এটি secret নয়। নিরাপত্তা আসে Authentication, Rules, App Check এবং অপব্যবহার প্রতিরোধ থেকে।
- এটি end-to-end encrypted নয়। ব্যক্তিগত/সংবেদনশীল কথোপকথনের জন্য E2E encryption যোগ না করে নিরাপত্তার দাবি করবেন না।
- Firebase-এর free quota ও Storage/SMS billing বদলাতে পারে। Console-এ billing, quota ও region দেখে নিন।
- Offline-এ দূরের বন্ধুর কাছে মেসেজ পৌঁছাতে পারে না; সংযোগ ফিরলে পাঠাতে হবে।

## Included files
- `index.html`, `style.css`: UI
- `app.js`: Phone OTP, profile, search, chat
- `firestore.rules`, `storage.rules`: starter rules
- `manifest.json`, `sw.js`: PWA shell
- `netlify.toml`: basic Netlify settings
