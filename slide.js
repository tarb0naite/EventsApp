import React, { useState, useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, PanResponder } from 'react-native';

const Dot = ({ active }) => (
  <View
    style={{
      backgroundColor: active ? '#E67E22' : '#CDCDCD',
      width: 8,
      height: 8,
      borderRadius: 4,
      margin: 4,
    }}
  />
);

const ImageSlider = ({ images }) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const imageSlideAnimation = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dx: imageSlideAnimation }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx > 50) {
          // Swipe right
          setSlideIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
        } else if (gestureState.dx < -50) {
          // Swipe left
          setSlideIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
        }
        Animated.timing(imageSlideAnimation, {
          toValue: 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [slideIndex]);

  return (
    <View>
      <Animated.Image
        {...panResponder.panHandlers}
        source={{ uri: images[slideIndex] }}
        style={{
          width: 365,
          height: 190,
          transform: [{ translateX: imageSlideAnimation }],
        }}
      />
      <View style={styles.dotsContainer}>
        {images.map((_, index) => (
          <Dot key={index} active={index === slideIndex} />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
});

export default ImageSlider;
