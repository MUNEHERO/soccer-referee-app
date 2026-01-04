import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, db } from '../config/firebase'; // 先ほど作成したconfig
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ユーザーの追加情報（役割など）をFirestoreから取得
  const fetchUserProfile = async (user) => {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { ...user, ...docSnap.data() };
    } else {
      // 初回ログイン時はFirestoreにユーザーデータを作成（初期化）
      const initialData = {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        roles: { isTeamRep: false, isReferee: false }, // 初期値は役割なし
        createdAt: new Date()
      };
      await setDoc(docRef, initialData);
      return { ...user, ...initialData };
    }
  };

  // Googleログイン処理
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // ログイン成功後、必要ならここで遷移処理などを追加可能
      return result.user;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  // ログアウト処理
  const logout = () => {
    return signOut(auth);
  };

  useEffect(() => {
    // ログイン状態の監視
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Firestoreから詳細プロフィールを結合
          const userWithProfile = await fetchUserProfile(user);
          setCurrentUser(userWithProfile);
        } catch (error) {
          console.error("Profile fetch error:", error);
          setCurrentUser(user); // エラーでも最低限Auth情報は入れる
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loginWithGoogle,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};