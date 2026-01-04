import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, Container, Heading, Text, Badge, Stack, Button, Flex, 
  Divider, Textarea, useToast, Avatar, Table, Thead, Tbody, Tr, Th, Td
} from '@chakra-ui/react';
import { doc, getDoc, collection, addDoc, query, where, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';
import { formatDateTime, formatCurrency } from '../utils/format';

const MatchDetailPage = () => {
  const { matchId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [match, setMatch] = useState(null);
  const [applications, setApplications] = useState([]); // 応募者リスト
  const [myApplication, setMyApplication] = useState(null); // 自分の応募状況
  const [applyMessage, setApplyMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // 1. 試合情報の取得
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        const docRef = doc(db, 'matches', matchId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setMatch({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast({ title: "案件が見つかりません", status: "error" });
          navigate('/');
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMatch();
  }, [matchId, navigate, toast]);

  // 2. 応募情報の監視 (主催者用リスト取得 & 自分の応募状況確認)
  useEffect(() => {
    if (!currentUser) return;

    // この試合(matchId)に対する応募をすべて取得
    const q = query(collection(db, 'applications'), where('matchId', '==', matchId));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setApplications(apps);
      
      // 自分が応募済みかチェック
      const myApp = apps.find(app => app.applicantId === currentUser.uid);
      setMyApplication(myApp || null);
    });

    return () => unsubscribe();
  }, [matchId, currentUser]);


  // アクション: 応募する
  const handleApply = async () => {
    if (!currentUser) return toast({ title: "ログインが必要です", status: "warning" });
    if (!match) return;

    try {
      await addDoc(collection(db, 'applications'), {
        matchId: match.id,
        organizerId: match.organizerId, // セキュリティルール用
        applicantId: currentUser.uid,
        applicantName: currentUser.displayName || "名無し",
        status: 'pending', // 承認待ち
        message: applyMessage,
        appliedAt: serverTimestamp()
      });
      
      toast({ title: "応募しました！", status: "success" });
      setApplyMessage('');
    } catch (error) {
      console.error(error);
      toast({ title: "応募に失敗しました", description: error.message, status: "error" });
    }
  };

  // アクション: 応募を承認する (主催者のみ)
  const handleApprove = async (applicationId, applicantId) => {
    try {
      // 1. 応募ステータスを承認に変更
      await updateDoc(doc(db, 'applications', applicationId), {
        status: 'approved'
      });
      // 2. 試合情報の確定者を更新 (statusもmatchedに変更)
      await updateDoc(doc(db, 'matches', matchId), {
        confirmedRefereeId: applicantId,
        status: 'matched'
      });
      
      toast({ title: "審判を承認しました！", status: "success" });
    } catch (error) {
      toast({ title: "エラーが発生しました", status: "error" });
    }
  };

  if (loading || !match) return <Box p={4}>読み込み中...</Box>;

  const isOrganizer = currentUser?.uid === match.organizerId;

  return (
    <Container maxW="container.md" py={6}>
      <Box mb={6}>
        <Badge colorScheme={match.status === 'recruiting' ? 'green' : 'red'} mb={2}>
          {match.status === 'recruiting' ? '募集中' : match.status === 'matched' ? 'マッチング成立' : '終了'}
        </Badge>
        <Heading size="xl" mb={2}>{match.title}</Heading>
        <Text fontSize="lg" color="gray.600">{match.teamName}</Text>
      </Box>

      <Box bg="white" p={6} borderRadius="md" shadow="sm" mb={8} border="1px solid" borderColor="gray.200">
        <Stack spacing={4}>
          <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
            <Text fontWeight="bold">日時</Text>
            <Text>{formatDateTime(match.matchDate)}</Text>
          </Flex>
          <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
            <Text fontWeight="bold">場所</Text>
            <Text>{match.location?.name}</Text>
          </Flex>
          <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
            <Text fontWeight="bold">募集役割</Text>
            <Text>{match.recruitRole}</Text>
          </Flex>
          <Flex justify="space-between" borderBottom="1px solid" borderColor="gray.100" pb={2}>
            <Text fontWeight="bold" color="teal.600">報酬</Text>
            <Text fontSize="xl" fontWeight="bold" color="teal.600">{formatCurrency(match.reward)}</Text>
          </Flex>
          <Box pt={2}>
            <Text fontWeight="bold" mb={1}>詳細・備考</Text>
            <Text whiteSpace="pre-wrap" fontSize="sm">{match.description || "特になし"}</Text>
          </Box>
        </Stack>
      </Box>

      {/* 条件分岐: 主催者用ビュー */}
      {isOrganizer ? (
        <Box>
          <Heading size="md" mb={4}>応募者リスト ({applications.length})</Heading>
          {applications.length === 0 ? (
            <Text color="gray.500">まだ応募はありません。</Text>
          ) : (
            <Box overflowX="auto">
              <Table variant="simple" bg="white">
                <Thead>
                  <Tr><Th>名前</Th><Th>メッセージ</Th><Th>状態</Th><Th>操作</Th></Tr>
                </Thead>
                <Tbody>
                  {applications.map((app) => (
                    <Tr key={app.id}>
                      <Td><Flex align="center"><Avatar size="xs" mr={2} />{app.applicantName}</Flex></Td>
                      <Td fontSize="sm">{app.message}</Td>
                      <Td>
                        <Badge colorScheme={app.status === 'approved' ? 'blue' : 'orange'}>{app.status}</Badge>
                      </Td>
                      <Td>
                        {app.status === 'pending' && match.status === 'recruiting' && (
                          <Button size="sm" colorScheme="teal" onClick={() => handleApprove(app.id, app.applicantId)}>
                            承認する
                          </Button>
                        )}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          )}
        </Box>
      ) : (
        /* 条件分岐: 審判(応募者)用ビュー */
        <Box>
          <Heading size="md" mb={4}>この案件に応募する</Heading>
          
          {!currentUser ? (
             <Text color="red.500">応募するにはログインしてください。</Text>
          ) : myApplication ? (
            <Box bg="blue.50" p={4} borderRadius="md">
              <Text fontWeight="bold" color="blue.700">既に応募済みです</Text>
              <Text fontSize="sm">ステータス: {myApplication.status}</Text>
            </Box>
          ) : match.status !== 'recruiting' ? (
            <Box bg="gray.100" p={4} borderRadius="md">
              <Text>この募集は終了しました。</Text>
            </Box>
          ) : (
            <Stack spacing={4}>
              <Textarea 
                placeholder="応募メッセージ (例: 3級審判員です。当日は30分前に到着可能です。)" 
                value={applyMessage}
                onChange={(e) => setApplyMessage(e.target.value)}
              />
              <Button colorScheme="teal" size="lg" onClick={handleApply}>
                応募する
              </Button>
            </Stack>
          )}
        </Box>
      )}
    </Container>
  );
};

export default MatchDetailPage;