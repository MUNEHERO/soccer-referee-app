import React from 'react';
import { 
  Box, Flex, Spacer, Heading, Button, Avatar, 
  Menu, MenuButton, MenuList, MenuItem, Container 
} from '@chakra-ui/react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Outlet } from 'react-router-dom';

const Layout = () => {
  const { currentUser, loginWithGoogle, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      // ログイン後はダッシュボードへ（後で作ります）
      navigate('/');
    } catch (error) {
      alert("ログインに失敗しました");
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <Box minH="100vh" bg="gray.50">
      {/* ヘッダー */}
      <Box bg="white" px={4} shadow="sm">
        <Flex h={16} alignItems="center" maxW="container.lg" mx="auto">
          <Heading 
            size="md" 
            cursor="pointer" 
            color="teal.500" 
            onClick={() => navigate('/')}
          >
            RefMatch (MVP)
          </Heading>
          
          <Spacer />

          <Flex alignItems="center" gap={4}>
            {currentUser ? (
              // ログイン済みの場合
              <Menu>
                <MenuButton as={Button} rounded="full" variant="link" cursor="pointer" minW={0}>
                  <Avatar size="sm" src={currentUser.photoURL} name={currentUser.displayName} />
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => navigate('/create-match')}>試合を作る</MenuItem>
                  <MenuItem onClick={() => navigate('/search')}>案件を探す</MenuItem>
                  <MenuItem onClick={handleLogout}>ログアウト</MenuItem>
                </MenuList>
              </Menu>
            ) : (
              // 未ログインの場合
              <Button colorScheme="teal" size="sm" onClick={handleLogin}>
                Googleログイン
              </Button>
            )}
          </Flex>
        </Flex>
      </Box>

      {/* メインコンテンツ (ページの中身がここに入る) */}
      <Container maxW="container.lg" py={8}>
        <Outlet />
      </Container>
    </Box>
  );
};

export default Layout;