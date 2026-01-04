import React from 'react';
import { 
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Text, Badge, Button, Flex, Stack, Divider 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { where } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useMatches } from '../features/matches/useMatches';
import { formatDateTime, formatCurrency } from '../utils/format';

const DashboardPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // 自分のIDでフィルタリングした試合データを取得
  // ※ currentUserがまだロード中の場合は空配列などになるよう配慮が必要
  const conditions = currentUser ? [where('organizerId', '==', currentUser.uid)] : [];
  const { matches, loading } = useMatches(conditions);

  if (!currentUser) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" mb={4}>ログインしてください</Heading>
        <Text>試合を募集するにはログインが必要です。</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">マイダッシュボード</Heading>
        <Button colorScheme="teal" onClick={() => navigate('/create-match')}>
          + 新規募集を作成
        </Button>
      </Flex>

      <Heading size="md" mb={4} color="gray.600">あなたの募集一覧</Heading>
      
      {loading ? (
        <Text>読み込み中...</Text>
      ) : matches.length === 0 ? (
        <Text color="gray.500">現在、募集中の案件はありません。</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {matches.map((match) => (
            <Card key={match.id} borderTop="4px solid" borderColor="teal.400" shadow="md">
              <CardHeader pb={2}>
                <Flex justify="space-between">
                  <Badge colorScheme={match.status === 'recruiting' ? 'green' : 'gray'}>
                    {match.status === 'recruiting' ? '募集中' : match.status}
                  </Badge>
                  <Text fontSize="sm" color="gray.500">
                    {formatDateTime(match.createdAt)} 作成
                  </Text>
                </Flex>
                <Heading size="sm" mt={2}>{match.title}</Heading>
              </CardHeader>
              
              <CardBody py={2}>
                <Stack spacing={2}>
                  <Text>📅 <b>日時:</b> {formatDateTime(match.matchDate)}</Text>
                  <Text>📍 <b>場所:</b> {match.location?.name}</Text>
                  <Text>💰 <b>報酬:</b> {formatCurrency(match.reward)}</Text>
                  <Text>🚩 <b>役割:</b> {match.recruitRole}</Text>
                </Stack>
              </CardBody>

              <CardFooter pt={2}>
                <Button 
                  size="sm" 
                  colorScheme="blue" 
                  variant="outline" 
                  width="full"
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  詳細・応募管理へ
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default DashboardPage;