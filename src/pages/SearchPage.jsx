import React from 'react';
import { 
  Box, Heading, SimpleGrid, Card, CardHeader, CardBody, CardFooter, 
  Text, Badge, Button, Flex, Stack, Icon, Container 
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { where, orderBy } from 'firebase/firestore';
import { useMatches } from '../features/matches/useMatches';
import { formatDateTime, formatCurrency } from '../utils/format';
import { FaMapMarkerAlt, FaClock, FaYenSign } from 'react-icons/fa';

const SearchPage = () => {
  const navigate = useNavigate();

  // 検索条件: ステータスが「recruiting (募集中)」のものを取得
  // ※複合インデックス未作成のエラーが出る場合は orderBy を外してください
  const conditions = [
    where('status', '==', 'recruiting'),
    // orderBy('matchDate', 'asc') 
  ];
  
  const { matches, loading } = useMatches(conditions);

  return (
    <Container maxW="container.lg">
      <Heading mb={6} size="lg">案件を探す</Heading>
      
      {loading ? (
        <Text>案件を読み込んでいます...</Text>
      ) : matches.length === 0 ? (
        <Box textAlign="center" py={10} bg="gray.50" borderRadius="md">
          <Text fontSize="lg">現在、募集中の案件はありません。</Text>
        </Box>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {matches.map((match) => (
            <Card key={match.id} _hover={{ shadow: 'lg' }} transition="all 0.2s">
              <CardHeader pb={2}>
                <Flex justify="space-between" align="center">
                  <Badge colorScheme="green" px={2} py={1} borderRadius="full">
                    {match.recruitRole}募集
                  </Badge>
                  <Text fontSize="xs" color="gray.500">
                    {match.teamName}
                  </Text>
                </Flex>
                <Heading size="md" mt={3} noOfLines={2}>
                  {match.title}
                </Heading>
              </CardHeader>
              
              <CardBody py={2}>
                <Stack spacing={3}>
                  <Flex align="center">
                    <Icon as={FaClock} color="gray.400" mr={2} />
                    <Text fontSize="sm" fontWeight="bold">
                      {formatDateTime(match.matchDate)}
                    </Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaMapMarkerAlt} color="gray.400" mr={2} />
                    <Text fontSize="sm" noOfLines={1}>
                      {match.location?.name}
                    </Text>
                  </Flex>
                  <Flex align="center">
                    <Icon as={FaYenSign} color="yellow.500" mr={2} />
                    <Text fontSize="lg" fontWeight="bold" color="teal.600">
                      {formatCurrency(match.reward)}
                    </Text>
                  </Flex>
                </Stack>
              </CardBody>

              <CardFooter pt={4}>
                <Button 
                  colorScheme="teal" 
                  width="full" 
                  onClick={() => navigate(`/matches/${match.id}`)}
                >
                  詳細を見る
                </Button>
              </CardFooter>
            </Card>
          ))}
        </SimpleGrid>
      )}
    </Container>
  );
};

export default SearchPage;