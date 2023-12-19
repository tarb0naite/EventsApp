import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AllEventsScreen from './AllEvents'; 
import AppNavigator from './AppNavigator';

const Stack = createNativeStackNavigator();

function Smth({navigation}) {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="AllEvents" component={AllEventsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default Smth;
