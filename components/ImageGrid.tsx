import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Alert,
    Platform,
} from 'react-native';
import RNFS from 'react-native-fs';

interface ImageGridProps {
  onImagePress: (imageUri: string) => void;
}

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3 - 10;

const ImageGrid: React.FC<ImageGridProps> = ({ onImagePress }) => {
  const [images, setImages] = useState<string[]>([]);

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true; // No permissions needed for iOS
  
    try {
      if (Platform.Version >= 33) {
        // Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          {
            title: 'Permission to Access Media',
            message: 'This app needs access to your media to display images.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Android < 13
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Permission to Access Storage',
            message: 'This app needs access to your storage to display images.',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const fetchImages = async () => {
    let hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot access storage without permission.');
      return;
    }

    const picturesDir = `${RNFS.ExternalStorageDirectoryPath}/Pictures`; // Directory path
    try {
      const files = await RNFS.readDir(picturesDir); // Read the directory
      const imageFiles = files
        .filter(file => file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name)) // Filter image files
        .map(file => `file://${file.path}`); // Convert to URI

      setImages(imageFiles);
    } catch (err) {
      console.error('Error reading images:', err);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <FlatList
      data={images}
      keyExtractor={(item, index) => index.toString()}
      numColumns={3}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onImagePress(item)}>
          <Image source={{ uri: item }} style={styles.image} />
        </TouchableOpacity>
      )}
      contentContainerStyle={styles.grid}
    />
  );
};

const styles = StyleSheet.create({
  grid: {
    padding: 5,
  },
  image: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 5,
    borderRadius: 10,
  },
});

export default ImageGrid;
