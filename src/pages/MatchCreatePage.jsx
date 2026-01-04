import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { 
  Box, Button, FormControl, FormLabel, Input, Select, 
  Textarea, VStack, Heading, FormErrorMessage, useToast,
  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper
} from '@chakra-ui/react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

const MatchCreatePage = () => {
  const { currentUser } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const navigate = useNavigate();
  const toast = useToast();

  const onSubmit = async (data) => {
    if (!currentUser) {
      toast({ title: "ログインが必要です", status: "error" });
      return;
    }

    try {
      // Firestoreへ保存
      await addDoc(collection(db, 'matches'), {
        organizerId: currentUser.uid,
        teamName: currentUser.displayName || "未設定チーム", // 本来はプロフィールから取得
        title: data.title,
        matchDate: new Date(data.matchDate), // 文字列からDateオブジェクトへ
        location: {
          name: data.locationName,
          address: data.locationAddress || "" 
        },
        reward: parseInt(data.reward, 10),
        recruitRole: data.recruitRole,
        description: data.description,
        status: 'recruiting', // 募集中
        createdAt: serverTimestamp()
      });

      toast({ title: "募集を開始しました！", status: "success" });
      navigate('/'); // ダッシュボードへ戻る
    } catch (error) {
      console.error(error);
      toast({ title: "エラーが発生しました", description: error.message, status: "error" });
    }
  };

  return (
    <Box maxW="md" mx="auto">
      <Heading size="lg" mb={6}>試合の審判を募集する</Heading>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <VStack spacing={4} align="stretch">
          
          <FormControl isInvalid={errors.title}>
            <FormLabel>募集タイトル</FormLabel>
            <Input 
              placeholder="例: 都リーグ2部 第3節 副審募集" 
              {...register('title', { required: 'タイトルは必須です' })} 
            />
            <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.matchDate}>
            <FormLabel>試合日時</FormLabel>
            <Input 
              type="datetime-local" 
              {...register('matchDate', { required: '日時は必須です' })} 
            />
            <FormErrorMessage>{errors.matchDate?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.locationName}>
            <FormLabel>会場名</FormLabel>
            <Input 
              placeholder="例: 駒沢オリンピック公園 補助競技場" 
              {...register('locationName', { required: '会場名は必須です' })} 
            />
            <FormErrorMessage>{errors.locationName?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl>
            <FormLabel>住所 (任意: GoogleMap用)</FormLabel>
            <Input placeholder="東京都世田谷区..." {...register('locationAddress')} />
          </FormControl>

          <FormControl isInvalid={errors.recruitRole}>
            <FormLabel>募集する役割</FormLabel>
            <Select {...register('recruitRole', { required: '役割を選択してください' })}>
              <option value="AR">副審 (AR)</option>
              <option value="MR">主審 (MR)</option>
              <option value="4th">第4の審判</option>
            </Select>
            <FormErrorMessage>{errors.recruitRole?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={errors.reward}>
            <FormLabel>報酬金額 (円)</FormLabel>
            <NumberInput min={0} step={500}>
              <NumberInputField 
                {...register('reward', { required: '金額は必須です', min: 0 })} 
              />
              <NumberInputStepper>
                <NumberIncrementStepper />
                <NumberDecrementStepper />
              </NumberInputStepper>
            </NumberInput>
            <FormErrorMessage>{errors.reward?.message}</FormErrorMessage>
          </FormControl>

          <FormControl>
            <FormLabel>詳細・備考</FormLabel>
            <Textarea 
              placeholder="ユニフォームの色、集合場所の詳細など" 
              {...register('description')} 
            />
          </FormControl>

          <Button 
            type="submit" 
            colorScheme="teal" 
            size="lg" 
            isLoading={isSubmitting}
            mt={4}
          >
            募集を公開する
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default MatchCreatePage;