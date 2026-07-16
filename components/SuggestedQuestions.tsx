import { View, Text, Pressable } from "react-native";
import { SUGGESTED_QUESTIONS } from "@/constants/suggested-questions";

interface Props {
  onSelectQuestion: (question: string) => void;
}

export default function SuggestedQuestions({ onSelectQuestion }: Props) {
  return (
    <View className="mb-6">
      <Text className="text-text-primary font-bold text-lg px-6 mb-4">
        Ask the Quran
      </Text>
      <View className="flex-row flex-wrap px-[18px]">
        {SUGGESTED_QUESTIONS.map((q) => (
          <View key={q.id} className="w-1/2 p-1.5">
            <Pressable
              onPress={() => onSelectQuestion(q.text)}
              className="bg-surface border border-surface-light rounded-2xl p-4 active:opacity-70 flex-1"
            >
              <Text className="text-2xl mb-2">{q.icon}</Text>
              <Text className="text-text-primary text-sm font-medium leading-5">
                {q.text}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}
