import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Events from './routes/Events';
import Event from './routes/Event';
import { useState, useEffect } from "react";
import Navbar from './components/Navbar';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './routes/Home'
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  const[events, setEvents] = ([])
  const [event, setEvent] = ([])

  // api call to get events
  // useEffect(() => {
  //   console.log('Event triggered')
  //   axios.get('/getEvents')
  //     .then((response) => {
  //       console.log("response.data", response.data)
  //       const events = response.data
  //       setState({
  //         events: events,
  //         allEvents: events
  //       });
  //     })
  //     .catch((err) =>  {
  //       console.log('err')
  //     }
  //     )
  // }, []);

  fetch('./events.json')
  .then(response => response.json())
  .then(data => {
    console.log(data); // The JSON data from the file is now a JavaScript object
  })
  .catch(error => {
    console.error('Error fetching JSON data from file:', error);
  });

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Header />
          <Routes>
            <Route path="/" element={<Home events={events} setEvent={setEvent}/>}></Route>
            <Route path="/events" element={<Events events={events} setEvent={setEvent}/>
            } />
            <Route path="/event/:id" element={
              <Event event={event}/>
            }>
            </Route>
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </>
  );
}


