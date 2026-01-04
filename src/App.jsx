import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';

// 作成したすべてのページコンポーネントをインポート
import DashboardPage from './pages/DashboardPage';
import MatchCreatePage from './pages/MatchCreatePage';
import SearchPage from './pages/SearchPage';
import MatchDetailPage from './pages/MatchDetailPage';

function App() {
  return (
    <ChakraProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Layoutコンポーネントでヘッダーなどを共通化 */}
            <Route path="/" element={<Layout />}>
              
              {/* トップページ: 自分の募集一覧 (ダッシュボード) */}
              <Route index element={<DashboardPage />} />
              
              {/* 試合の新規作成ページ (チーム向け) */}
              <Route path="create-match" element={<MatchCreatePage />} />
              
              {/* 案件検索ページ (審判向け) */}
              <Route path="search" element={<SearchPage />} />
              
              {/* 試合詳細・応募・承認管理ページ */}
              <Route path="matches/:matchId" element={<MatchDetailPage />} />
              
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ChakraProvider>
  );
}

export default App;