import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { getDatabase, ref, set, get, update as dbUpdate } from 'firebase/database';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { View, Text } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
const router = useRouter();

// ✅ Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyARzaE-mGJkYl9aD4LffYo-FW7FYRpUXD4",
    authDomain: "classroom-9e811.firebaseapp.com",
    databaseURL: "https://classroom-9e811-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "classroom-9e811",
    storageBucket: "classroom-9e811.firebasestorage.app",
    messagingSenderId: "543633744426",
    appId: "1:543633744426:web:98c2cc2f2846dfc31dd953",
    measurementId: "G-GFC2LZF52Q"
  };

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);  // Initialization done once
const auth = getAuth(app);  // Use initialized app
const provider = new GoogleAuthProvider();
const database = getDatabase(app);  // Use initialized app
const storage = getStorage(app);  // Use initialized app

/**
 * ✅ ฟังก์ชันสำหรับบันทึกคอร์สไปยัง Firebase Realtime Database และอัปโหลดรูปภาพไปยัง Firebase Storage
 * @param {string} userId - UID ของผู้ใช้ที่สร้างคอร์ส
 * @param {string} courseId - ID ของคอร์ส
 * @param {string} courseName - ชื่อคอร์ส
 * @param {string} classroomName - ชื่อห้องเรียน
 * @param {File} imageFile - ไฟล์รูปภาพที่อัปโหลด (สามารถเป็น null)
 */
export async function saveCourse(userId, courseId, courseName, classroomName, imageFile) {
    try {
        let imageUrl = '';

        if (imageFile) {
            // ✅ อัปโหลดรูปเข้า Firebase Storage
            const imageStorageRef = storageRef(storage, `courses/${userId}/${courseId}`);
            await uploadBytes(imageStorageRef, imageFile);

            // ✅ รับ URL ของรูปที่อัปโหลด
            imageUrl = await getDownloadURL(imageStorageRef);
        }

        // ✅ บันทึกข้อมูลคอร์สลง Firebase Realtime Database
        const courseRef = ref(database, `users/${userId}/classroom/${courseId}`);
        await set(courseRef, {
            name: courseName,
            classroom: classroomName,
            imageUrl, // ✅ บันทึก URL ของรูปภาพ
            status: 'active'
        });

        return true; // ส่งสถานะสำเร็จ
    } catch (error) {
        console.error('Error saving course:', error);
        throw error;
    }
}

/**
 * ✅ ฟังก์ชันสำหรับดึงข้อมูลวิชาของผู้ใช้
 * @param {string} userId - UID ของผู้ใช้
 */
export const loadUserCourses = (userId) => {
    const coursesRef = ref(database, `users/${userId}/classroom`);
    return get(coursesRef)
        .then((snapshot) => {
            if (snapshot.exists()) {
                return snapshot.val();
            } else {
                console.log("No courses available");
                return null;
            }
        })
        .catch((error) => {
            console.error("Error fetching courses:", error);
        });
};

/**
 * ✅ ฟังก์ชันสำหรับอัปเดตโปรไฟล์โดยไม่ลบข้อมูลคอร์ส
 * @param {string} userId - UID ของผู้ใช้
 * @param {string} newName - ชื่อใหม่
 * @param {File} newPhotoFile - ไฟล์รูปใหม่ (สามารถเป็น null)
 */
export const updateUserProfile = async (userId, newName, newPhotoFile) => {
    try {
        const user = auth.currentUser;
        const userRef = ref(database, `users/${userId}`);
        
        // โหลดข้อมูลเดิมเพื่อไม่ให้ classroom หาย
        const snapshot = await get(userRef);
        const existingData = snapshot.exists() ? snapshot.val() : {};
        let photoURL = existingData.photo || '';

        if (newPhotoFile) {
            const storageReference = storageRef(storage, `profile-pictures/${userId}`);
            const uploadSnapshot = await uploadBytes(storageReference, newPhotoFile);
            photoURL = await getDownloadURL(uploadSnapshot.ref);
        }
        
        // ✅ อัปเดตเฉพาะข้อมูลที่เปลี่ยนแปลง
        await dbUpdate(userRef, {
            name: newName,
            photo: photoURL,
            email: existingData.email || user.email, // เก็บอีเมลเดิมไว้
            classroom: existingData.classroom || {} // เก็บข้อมูลคอร์สไว้
        });
        
        // ✅ อัปเดต Firebase Auth
        await updateProfile(user, { displayName: newName, photoURL });
        console.log('Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
    }
};

/**
 * ✅ ฟังก์ชันสำหรับการเข้าสู่ระบบด้วย Google
 */
export const googleSignIn = () => {
    signInWithPopup(auth, provider)
        .then((result) => {
            const user = resuดlt.user;
            console.log("User signed in: ", user);
            window.location.href = 'dashboard.html';
        })
        .catch((error) => {
            console.log("Error signing in: ", error);
        });
};

/**
 * ✅ ฟังก์ชัน Logout
 */
export const logout = () => {
    signOut(auth)
        .then(() => {
            console.log('User signed out');
            localStorage.removeItem('editCourseId');
            localStorage.removeItem('editCourseName');
            localStorage.removeItem('editClassroomName');
            // เพิ่มการลบข้อมูลอื่น ๆ ที่เกี่ยวข้อง
            router.replace('/');
        })
        .catch((error) => {
            console.error('Error during logout: ', error);
        });
};

// ✅ ตรวจสอบสถานะผู้ใช้
onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user);  // ตรวจสอบสถานะผู้ใช้
    if (user) {
        console.log('User is logged in:', user);
    } else {
        console.log('No user is logged in');
    }
});
