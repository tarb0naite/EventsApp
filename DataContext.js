// DataContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('eventData.db');

const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    readEventDataFromDatabase();
  }, []);

  const saveEventDataToDatabase = async (data) => {
    try {
      db.transaction((tx) => {
        tx.executeSql('DELETE FROM events');
        data.forEach((event) => {
          tx.executeSql(
            'INSERT INTO events (name, img, description, time, date) VALUES (?, ?, ?, ?, ?)',
            [
              event.name,
              event.img,
              event.description,
              event.time,
              event.date,
            ]
          );
        });
      });

      console.log('Data saved successfully');
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const readEventDataFromDatabase = async () => {
    try {
      db.transaction((tx) => {
        tx.executeSql('SELECT * FROM events', [], (_, { rows }) => {
          const newEvents = [];
          for (let i = 0; i < rows.length; i++) {
            newEvents.push(rows.item(i));
          }
          setEvents(newEvents);
          console.log('Data read successfully:', newEvents);
        });
      });
    } catch (error) {
      console.error('Error reading data:', error);
    }
  };

  const contextValue = {
    events,
    saveEventDataToDatabase,
    readEventDataFromDatabase,
  };

  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useDataContext = () => {
  return useContext(DataContext);
};
