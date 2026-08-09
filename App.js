import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { REGIONS } from './regions';

const MAX_LENGTH = 3;
const KEYPAD_ROWS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['', '0', 'del'],
];

function getResultText(code) {
  if (code.length < 2) return 'Введите код';
  return REGIONS[code] ?? 'Не найдено';
}

export default function App() {
  const [code, setCode] = useState('');
  const { height: windowHeight } = useWindowDimensions();
  const keypadHeight = windowHeight * (3 / 6) * 0.7;
  const inputHeight = (windowHeight * (1 / 6)) / 2;

  const handleDigit = (digit) => {
    setCode((prev) => (prev.length >= MAX_LENGTH ? digit : prev + digit));
  };

  const handleDelete = () => {
    setCode('');
  };

  const resultText = getResultText(code);
  const isEmptyState = code.length < 2;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.resultBox}>
        <Text
          style={[styles.resultText, isEmptyState && styles.resultTextMuted]}
          numberOfLines={2}
          adjustsFontSizeToFit
        >
          {resultText}
        </Text>
      </View>

      <View style={[styles.inputBox, { height: inputHeight }]}>
        <Text style={styles.inputText}>{code}</Text>
      </View>

      <View style={[styles.keypad, { height: keypadHeight }]}>
        {KEYPAD_ROWS.map((row, rowIndex) => (
          <View style={styles.keypadRow} key={rowIndex}>
            {row.map((key, keyIndex) => {
              if (key === '') {
                return <View key={keyIndex} style={styles.key} />;
              }
              if (key === 'del') {
                return (
                  <Pressable
                    key={keyIndex}
                    style={({ pressed }) => [
                      styles.key,
                      styles.deleteKey,
                      pressed && styles.deleteKeyPressed,
                    ]}
                    onPress={handleDelete}
                  >
                    <Text style={styles.deleteKeyText}>⌫</Text>
                  </Pressable>
                );
              }
              return (
                <Pressable
                  key={keyIndex}
                  style={({ pressed }) => [
                    styles.key,
                    pressed && styles.keyPressed,
                  ]}
                  onPress={() => handleDigit(key)}
                >
                  <Text style={styles.keyText}>{key}</Text>
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  resultBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  resultText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#111',
  },
  resultTextMuted: {
    color: '#999',
    fontWeight: '400',
  },
  inputBox: {
    marginHorizontal: 24,
    marginVertical: 12,
    borderWidth: 2,
    borderColor: '#111',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputText: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: 10,
    color: '#111',
  },
  keypad: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  keypadRow: {
    flex: 1,
    flexDirection: 'row',
  },
  key: {
    flex: 1,
    margin: 6,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPressed: {
    backgroundColor: '#d8d8d8',
  },
  keyText: {
    fontSize: 28,
    fontWeight: '500',
    color: '#111',
  },
  deleteKey: {
    backgroundColor: '#ff3b30',
  },
  deleteKeyPressed: {
    backgroundColor: '#c9302c',
  },
  deleteKeyText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
  },
});
