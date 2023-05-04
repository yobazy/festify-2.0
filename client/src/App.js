import React, { useEffect, useState, Component } from 'react';
import axios from 'axios';
import './App.css';
import Events from './routes/Events';
import Event from './routes/Event';
import Navbar from './components/Navbar';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './routes/Home'
import Header from './components/Header';
import Footer from './components/Footer';
import events_data from './events.json'
import artists_data from './artists.json'


export default function App() {
  // load dummy events data
  const events = events_data

  // load dummy artist data
  const artists = artists_data

  // console.log('initalized events', events)
  // api call to get events, can uncomment once dummy data is not being used
  // useEffect(() => {
  //   console.log('Event triggered')
  //   axios.get('/getEvents')
  //     .then((response) => {
  //       console.log("response.data", response.data)
  //       const data = response.data
  //       setEvents(data)
  //       console.log('state-set')
  //     })
  //     .catch((err) =>  {
  //       console.log('err', err)
  //     }
  //     )
  // }, []);

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Header />
          <Routes>
            <Route path="/" element={<Home events={events} />}></Route>
            <Route path="/events" element={<Events events={events} />
            } />
            <Route path="/event/:id" element={
              <Event events={events} artists={artists}/>
            }>
            </Route>
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </>
  );
}


