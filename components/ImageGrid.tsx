import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  PermissionsAndroid,
  Alert,
  View,
  Platform,
} from 'react-native';
import RNFS from 'react-native-fs';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width / 3 - 10;

interface Item {
  name: string;
  path: string;
  type: 'folder' | 'image';
}

interface ImageGridProps {
    onImagePress: (imageUri: string) => void;
  }

const ImageGrid: React.FC<ImageGridProps> = ({ onImagePress }) => {
  const [items, setItems] = useState<Item[]>([]);
  const [currentDir, setCurrentDir] = useState<string | null>(null); // Track current directory

  const requestStoragePermission = async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      const granted = await PermissionsAndroid.request(
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Permission to Access Media',
          message: 'This app needs access to your media to display images.',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const fetchItems = async (dirPath: string | null = null) => {
    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Cannot access storage without permission.');
      return;
    }
  
    const directory = dirPath ?? `${RNFS.ExternalStorageDirectoryPath}/DCIM`; // Default to DCIM folder
  
    try {
      const files = await RNFS.readDir(directory); // Read directory
      const folderItems: Item[] = [];
  
      for (const file of files) {
        if (file.isDirectory()) {
          // Add folder
          folderItems.push({ name: file.name, path: file.path, type: 'folder', mtime: file.mtime });
        } else if (file.isFile() && /\.(jpg|jpeg|png)$/i.test(file.name)) {
          // Add image
          folderItems.push({ name: file.name, path: `file://${file.path}`, type: 'image', mtime: file.mtime });
        }
      }
  
      // Sort items by modified time, latest first
      const sortedItems = folderItems.sort((a, b) => {
        if (!a.mtime || !b.mtime) return 0; // Handle missing mtime
        return b.mtime.getTime() - a.mtime.getTime();
      });
  
      setItems(sortedItems);
      setCurrentDir(dirPath); // Update current directory
    } catch (err) {
      console.error('Error reading directory:', err);
      Alert.alert('Error', 'Failed to access the directory.');
    }
  };
  

  const handleFolderPress = (folderPath: string) => {
    fetchItems(folderPath); // Fetch items inside the folder
  };

  const handleBackPress = () => {
    if (currentDir) {
      const parentDir = currentDir.substring(0, currentDir.lastIndexOf('/'));
      fetchItems(parentDir); // Navigate to parent directory
    }
  };

  useEffect(() => {
    fetchItems(); // Initial fetch
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {currentDir && (
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}
      <FlatList
        data={items}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item }) =>
          item.type === 'image' ? (
            <TouchableOpacity onPress={() => onImagePress(item.path)}>
                <Image source={{ uri: item.path }} style={styles.image} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.folder}
              onPress={() => handleFolderPress(item.path)}
            >
              <Text style={styles.folderText}>{item.name}</Text>
            </TouchableOpacity>
          )
        }
        contentContainerStyle={styles.grid}
      />
    </View>
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
  folder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    margin: 5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  folderText: {
    textAlign: 'center',
    color: '#333',
  },
  backButton: {
    padding: 10,
    backgroundColor: '#007AFF',
  },
  backText: {
    color: '#fff',
    textAlign: 'center',
  },
});

export default ImageGrid;
