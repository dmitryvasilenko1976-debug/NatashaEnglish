import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { parsePDFToSentences } from './anthropicService';

export async function pickAndParsePDF() {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/pdf',
    copyToCacheDirectory: true,
  });

  if (result.canceled) return null;

  const file = result.assets[0];

  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const parsed = await parsePDFToSentences(base64);

  return {
    id: Date.now().toString(),
    title: parsed.title || file.name.replace('.pdf', ''),
    tag: parsed.tag || 'Медицина',
    sentences: parsed.sentences,
    addedAt: Date.now(),
  };
}
