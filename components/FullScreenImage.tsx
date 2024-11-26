import React from 'react';
import ImageViewing from 'react-native-image-viewing';

interface FullScreenImageProps {
  visible: boolean;
  image: string;
  onClose: () => void;
}

const FullScreenImage: React.FC<FullScreenImageProps> = ({
  visible,
  image,
  onClose,
}) => {
  return (
    <ImageViewing
      images={[{ uri: image }]}
      imageIndex={0}
      visible={visible}
      onRequestClose={onClose}
    />
  );
};

export default FullScreenImage;
