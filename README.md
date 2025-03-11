# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

- # 🚀 EAS (Expo Application Services) Setup on macOS

EAS is used for building, deploying, and managing Expo projects, especially for **production-ready apps**. Follow these steps to install and use EAS on macOS.

---

## ✅ 1. Install `eas-cli`
You need `eas-cli` to build and deploy Expo apps.

```sh
npm install -g eas-cli
```

Check if it's installed correctly:

```sh
eas --version
```

---

## ✅ 2. Login to Expo Account
Before using EAS, login to your Expo account:

```sh
eas login
```

If you don't have an account, sign up at [expo.dev](https://expo.dev/).

---

## ✅ 3. Configure Your Project for EAS
Inside your Expo project folder, run:

```sh
eas build:configure
```

This will generate an `eas.json` file for managing different build profiles.

---

## 🎯 Using EAS for Building and Deployment

### 📦 1. Build an App
#### **iOS (Requires Mac & Xcode)**
```sh
eas build -p ios
```
- If you **don't have an Apple Developer account**, use `--profile development` to test locally.
- If you have an **Apple Developer account**, it will guide you to sign in.

#### **Android**
```sh
eas build -p android
```
- It will generate an `.apk` or `.aab` file for Android.

---

### 🚀 2. Deploy Your App

#### ✅ **Internal Testing (EAS Submit)**
You can upload directly to the App Store or Google Play:

```sh
eas submit -p ios
```
```sh
eas submit -p android
```

#### ✅ **Share with QR Code**
To get a shareable link for testing:

```sh
eas build -p ios --profile preview
eas build -p android --profile preview
```
After the build finishes, you'll get a URL to share.

---

## 🔥 Summary of EAS Commands

| Command | Description |
|---------|------------|
| `eas build:configure` | Initialize EAS for your project |
| `eas build -p ios` | Build for iOS |
| `eas build -p android` | Build for Android |
| `eas submit -p ios` | Submit to the App Store |
| `eas submit -p android` | Submit to Google Play |
| `eas login` | Login to Expo account |

---

Now you're ready to **build and deploy your Expo app with EAS!** 🚀 Let me know if you need help. 😃


