import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import ImageGrid from './components/ImageGrid';
import FullScreenImage from './components/FullScreenImage';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.Heading}>PicStash</Text>
      <ImageGrid onImagePress={setSelectedImage} />
      {selectedImage && (
        <FullScreenImage
          visible={!!selectedImage}
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eff',
  },
  Heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
  },
});

export default App;
