import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const useMatches = (conditions = []) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // クエリの構築: conditions配列（例: [where('organizerId', '==', uid)]）を展開
    // createAtの降順(新しい順)で取得したいが、複合インデックスが必要になる場合があるため
    // MVPでは一旦クライアントサイドでソートするか、単純なクエリにする。
    // ここでは単純に conditions だけ適用する。
    
    let q = query(collection(db, 'matches'), ...conditions);
    
    // Firestoreのリアルタイムリスナー
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const results = [];
      snapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() });
      });
      // 日付順などにソート（Firestoreのインデックスエラー回避のためJSで行う）
      results.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
      
      setMatches(results);
      setLoading(false);
    }, (err) => {
      console.error("Firestore Error:", err);
      setError(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [JSON.stringify(conditions)]); // 条件が変わったら再実行

  return { matches, loading, error };
};