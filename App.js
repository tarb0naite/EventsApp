import React, {useState,  useEffect, createContext, useContext, useRef} from 'react';
import { View, Text, Image, TouchableOpacity, Button, ScrollView,StyleSheet, TextInput, ToastAndroid, Animated,   KeyboardAvoidingView, } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Calendar } from 'react-native-calendars';
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { useNavigation, useRoute } from '@react-navigation/native';
import moment from 'moment';
import { FloatingAction } from "react-native-floating-action";
import ImageSlider from './slide';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RegisterScreen from './RegisterScreen'
import AllEvents from './AllEvents'
import * as SQLite from 'expo-sqlite';


const db = SQLite.openDatabase('eventData.db');

const AuthContext = createContext();


const useAuth = () => {
  return useContext(AuthContext);
  
};

function DetailsScreen({ navigation, route }) {
  const { eventId } = route.params;
  console.log('Details Screen - Event ID:', eventId);


  const [eventData, setEventData] = useState(null);

  const actions = [
    {
      text: 'Pridėti prie megstamu',
      icon: require('./assets/star.png'),
      name: 'Like',
      position: 1,
      color: '#FFBF00',
    },
    {
      text: 'Dalivausiu',
      icon: require('./assets/heart.png'),
      name: 'Will be',
      position: 2,
      color: '#FF4500',
    }
  ];

  const handleFloatingActionPress = (name) => {
    if (name === 'Like') {
      Alert.alert('Pridėta prie megstamų renginių');
    } else if (name === 'Will be') {
      Alert.alert('Smagaus dalivavimo');
    }
  };

  const [dataLoaded, setDataLoaded] = useState(false);

useEffect(() => {
  fetchEventDataFromDatabase(eventId);
}, [eventId]);

const fetchEventDataFromDatabase = (eventId) => {
  db.transaction((tx) => {
    tx.executeSql(
      'SELECT * FROM events WHERE event_id = ?',
      [eventId],
      (_, result) => {
        console.log('Fetched data:', result);
        const { rows } = result;
        if (rows.length > 0) {
          setEventData(rows.item(0));
          setDataLoaded(true); 
        }
      },
      (_, error) => {
        console.error('Error fetching data:', error);
      }
      );
    });
  };
  
  
  

  console.log('Event Data:', eventData); 

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      {eventData ? (
        <>
          <View style={{ marginBottom: 20 }}>
            <Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Event Name: </Text>
              {eventData.event_name}
            </Text>
          </View>
          <View style={{ marginBottom: 20 }}>
            <Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Event Time: </Text>
              {eventData.event_time}
            </Text>
          </View>
          <View>
            <Image
              source={{ uri: eventData.event_image }}
              style={{ width: 340, height: 170, marginBottom: 10 }}
            />
          </View>
          <View style={{ padding: 10 }}>
            <Text style={{ fontSize: 16 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold' }}>Event Description: </Text>
              {eventData.event_description}
            </Text>
          </View>
          <FloatingAction
            actions={actions}
            onPressItem={handleFloatingActionPress}
            color='#E67E22'
          />
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}


function LogInScreen() {
  const navigation = useNavigation();
  const { login, isLoggedIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [toggleCheckBox, setToggleCheckBox] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister = () => {
    navigation.navigate('Register');
  };
  

  const handleLogin = async () => {
   
      const userDataString = await AsyncStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);

        if (userData.email === email && userData.password === password) {
          login();
          navigation.navigate('Profilis');
          ToastAndroid.show('Prisijungta sėkmingai', ToastAndroid.SHORT);
        } else {
          ToastAndroid.show('Neteisingas el. paštas arba slaptažodis', ToastAndroid.SHORT);
        }
      } else {
        ToastAndroid.show('Vartotojas nerastas', ToastAndroid.SHORT);
      }
    
  };
 

  return (
    <KeyboardAvoidingView
    style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
  >
      <TextInput
  placeholder='Email'
  value={email}
  onChangeText={(text) => setEmail(text)}
  style={styles.input}
/>

<View style={styles.inputContainer}>
    <TextInput
  placeholder='Password'
  value={password}
  onChangeText={(text) => setPassword(text)}
  secureTextEntry={!showPassword}
  style={styles.passwordInput}
       
      />
      <TouchableOpacity onPress={togglePasswordVisibility} style={{ padding: 10 }}>
        <Image
          source={showPassword ? require('./assets/eye.png') : require('./assets/eye-crossed.png')}
          style={{ width: 20, height: 20, tintColor: showPassword ? '#F08300' : '#FFE5B4' }}
        />
      </TouchableOpacity>
    </View>

    <View style={{ position: 'absolute', top: 50, alignItems: 'center' }}>
        <Text style={styles.labelText}>Prisijungti</Text>
      </View>

      <View style={{ position: 'absolute', top: 100, alignItems: 'center' }}>
        <Text style={styles.smallText}>Norėdami tęsti prisijunkite</Text>
      </View>

      <View style={{ position: 'absolute', top: 350, right: 40 }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Details')}
          style={styles.touchableTextContainer}
        >
          <Text style={styles.touchableText}>Pamiršote slaptažodi?</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', bottom: 90, alignItems: 'center' }}>
        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.loginButton, { width: 200, height: 40, borderRadius: 10 }]}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontSize: 24 }}>Prisijungti</Text>
        </TouchableOpacity>
      </View>

      <View style={{ position: 'absolute', bottom: 60, alignItems: 'center' }}>
        <Text style={styles.smallText}>Neturite paskyros?</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 40, alignItems: 'center' }}>
        <TouchableOpacity onPress={handleRegister} style={styles.touchableTextContainer}>
          <Text style={styles.touchableText}>Sukūrti</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}





const ImageCard = ({ event, onPress }) => {
  const { name, img, time, description } = event; 
  console.log('ImageCard - Received Data:', event);
  return (
    <TouchableOpacity onPress={() => onPress(event)}>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{name}</Text>
        <Text style={styles.cardContent}>{time}</Text>
        {img && (
          <Image
            source={{ uri: img }}
            style={{ width: 250, height: 130, marginTop: 10 }}
          />
        )}
        <Text style={styles.cardContent}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};




const HomeScreen = ({ navigation }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [eventDetails, setEventDetails] = useState([]);

  useEffect(() => {
    initializeDatabase();
    readEventDataFromDatabase();
  }, []);

  const initializeDatabase = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS events (event_id INTEGER PRIMARY KEY AUTOINCREMENT, event_name TEXT, event_image TEXT, event_description TEXT, event_time TEXT, event_date TEXT)'
      );
    });
  };

  const saveEventDataToDatabase = (data) => {
    db.transaction((tx) => {
      tx.executeSql('DELETE FROM events');
      data.forEach((event) => {
        tx.executeSql(
          'INSERT INTO events (event_name, event_image, event_description, event_time, event_date) VALUES (?, ?, ?, ?, ?)',
          [
            event.event_name,
            event.event_image,
            event.event_description,
            event.event_time,
            event.event_date,
          ]
        );
      });
    });
  };

  const readEventDataFromDatabase = () => {
    db.transaction((tx) => {
      tx.executeSql('SELECT * FROM events', [], (_, { rows }) => {
        const data = [];
        for (let i = 0; i < rows.length; i++) {
          data.push(rows.item(i));
        }
        console.log('Read Data from Database:', data);
        markDates(data);
      });
    });
  };

  const markDates = (events) => {
    const marked = events.reduce((accumulator, event) => {
      if (event && event.date) {
        accumulator[event.date] = { marked: true, dotColor: '#CD5700' };
      }
      
      return accumulator;
    }, {});
  
    console.log('Marked Dates:', marked);
    setMarkedDates(marked);
  };
  
  
  

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM events WHERE date = ?',
        [day.dateString],
        (_, { rows }) => {
          const selectedEvents = [];
          for (let i = 0; i < rows.length; i++) {
            selectedEvents.push(rows.item(i));
          }
          console.log('Selected Events:', selectedEvents);
          setEventDetails(selectedEvents);
        }
      );
    });
  };
  
  

  const handleEventPress = (eventId) => {
    console.log('Event Pressed ID:', eventId);
  
    const eventIdPrimitive = eventId?.event_id;
  
    navigation.navigate('Details', { eventId: eventIdPrimitive });
  };
  
  
  
  

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <View style={{ justifyContent: 'center', alignItems: 'center', paddingTop: 35 }}>
        <Button
          onPress={() => navigation.navigate('Details')}
          title='Verti demesio renginiai'
          color="#E67E22"
        />
      </View>
      <View
        style={{
          borderBottomWidth: 3,
          borderBottomColor: '#E67E22',
          width: 400,
        }}
      />

      <View style={{ top: 5 }}>
        <ImageSlider
          images={[
            'https://autorenginiai.lt/wp-content/uploads/2023/10/nightride-panevezys-2023-autorenginiai-lt-scaled.jpg',
            'https://autorenginiai.lt/wp-content/uploads/2020/10/driftink-pats-vilniuje-10-10-autorenginiai-lt.jpg',
            'https://autorenginiai.lt/wp-content/uploads/2023/11/igudziu-tobulinimas-2023-klaipedos-volvo-klubas-autorenginiai-lt-scaled.jpg',
          ]}
        />
      </View>

      <View>
        <Calendar
          onDayPress={onDayPress}
  markedDates={markedDates}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#EE7600',
            selectedDayBackgroundColor: '#E67E22',
            selectedDayTextColor: '#EE7600',
            todayTextColor: '#EE7600',
            dayTextColor: 'black',
            textDisabledColor: '#d9e1e8',
            dotColor: '#CD5700',
            selectedDotColor: '#CD5700',
            arrowColor: '#EE7600',
            monthTextColor: 'black',
          }}
        />
         
      {eventDetails.map((event) => (
        <TouchableOpacity
  key={event.event_id}
  onPress={() => handleEventPress(event)}
>
  <Text>{event.event_name}</Text>
</TouchableOpacity>


      ))}
        {selectedDate && (
  <View style={{ alignItems: 'center' }}>
    {eventDetails.map((event) => (
      <ImageCard event={event} onPress={handleEventPress} 
  title={event.event_name}
  content={event.event_description}
  imageUri={event.event_image}
  time={event.event_time}

/>

    ))}
  </View>
)}

      </View>
    </ScrollView>
  );
};


function ProfileScreen() {
  const { logout } = useAuth();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
  };

  const handleAllEvents = () => {
    
    navigation.navigate('AllEvents');
  };

  

  return (
    <View style={{  alignItems: 'center' }}>
      
      <View style={{marginBottom:40, width: '80%', top: 150}}>
      <Button onPress={handleAllEvents} title='Skelbimai' color='#E67E22' />
      </View>

      <View style={{marginBottom:10, width: '80%', top: 150}}>
      <Button onPress={handleLogout} title='Pasiulimai' color='#E67E22' />
      </View>

<View style={{marginBottom:10, width: '80%', top: 400}}>
      <Button onPress={handleLogout} title='Atsijungti' color='#E67E22' />
      </View>
     
     
      
    </View>
  );
}



const HomeStack = createNativeStackNavigator();


function HomeStackScreen({ navigation }) {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Renginiai"
        component={HomeScreen}
        options={{
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerBackground: () => (
            <Image
              source={require('./assets/mine_cars.jpg')}
              style={{
                ...StyleSheet.absoluteFillObject,
                width: '100%',
                height: '90%',
                backgroundColor: 'transparent',
                opacity: 0.5,
              }}
              resizeMode="cover"
            />
          ),
          headerTitleStyle: {
            color: 'black',
          },
        }}
      />

      <HomeStack.Screen
        name="Details"
        component={DetailsScreen}
        options={{
          headerTitle: 'Details',
        }}
      />
      <HomeStack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerTitle: 'Register',
        }}
      />

      
    </HomeStack.Navigator>
  );
}

const ProfileStack = createNativeStackNavigator();

const ProfileStackScreen = ({ navigation }) => {
  const { isLoggedIn } = useAuth();

  const ProfileComponent = () => <ProfileScreen />;
  const LogInComponent = () => <LogInScreen />;
  const RegisterComponent = () => <RegisterScreen />;

  return (
    <ProfileStack.Navigator>
      {isLoggedIn ? (
        <>
          <ProfileStack.Screen
            name='Profile'
            component={ProfileComponent}
            options={{
              headerTitle: 'Profile',
            }}
          />
          <ProfileStack.Screen
            name='Register'
            component={RegisterComponent}
            options={{
              headerTitle: 'Register',
            }}
          />
          <ProfileStack.Screen
    name='AllEvents'
    component={AllEvents}
    options={{
      headerTitle: 'All Events',
    }}
  />
        </>
      ) : (
        <ProfileStack.Screen
          name='LogIn'
          component={LogInComponent}
          options={{
            headerTitle: 'Log In',
          }}
        />
      )}
    </ProfileStack.Navigator>
  );
};

const Tab = createBottomTabNavigator();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const login = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const authContext = {
    login,
    logout,
    isLoggedIn,
  };

  return (
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Tab.Navigator screenOptions={{ headerShown: false }}>
          <Tab.Screen
            name="Pagrindinis"
            component={HomeStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require('./assets/house.png')}
                  style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
          <Tab.Screen
            name="Profilis"
            component={ProfileStackScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Image
                  source={require('./assets/profile.png')}
                  style={{ width: size, height: size, tintColor: color }}
                />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    marginBottom: 20,
    borderColor: 'orange',
    borderWidth: 1,
    backgroundColor: 'white'
  },
  input: {
    height: 40,
    borderColor: 'orange',
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
    width: '80%', 
    backgroundColor: 'white'
    
  },
  passwordInput: {
    flex: 1,
    height: 40,
    padding: 10,
  },
  eyeIconContainer: {
    padding: 10,
  },
  loginButton:{
    backgroundColor: '#CC5500',
    width:200,
    height: 30
  },
  touchableTextContainer: {
    marginTop: 10,
  },
  touchableText: {
    color: '#F28500', 
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  labelText: {
    color: '#CC5500', 
    fontSize: 34,
   
  },
  smallText: {
    color: '#F28500', 
    fontSize: 16,
   
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  checkbox: {
    alignSelf: 'center',
  },
  label: {
    margin: 8,
  },
  card: {
    backgroundColor: 'white',
    padding: 10,
    margin: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E67E22',
    width: 300,
    alignItems: 'center',
    height:228
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardContent: {
    fontSize: 16,
  },
  actionButtonIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
  },
});

