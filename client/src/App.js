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
  const [state, setState] = useState({
    events: [],
    allEvents: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }]
  })

  const [eventz, setEventz] = useState({})
  const [artistz, setArtistz] = useState({})

  // api call to get events
  useEffect(() => {
    console.log('Event triggered')
    axios.get('/getEvents')
      .then((response) => {
        console.log("response.data", response.data)
        const events = response.data
        setState({
          events: events,
          allEvents: events
        });
      })
      .catch((err) =>  {
        console.log('err')
      }
      )
  }, []);

  const eventSetter = (event, artists) => {
    console.log('event setter called')
    console.log('event', event)
    console.log('artists', artists)

    setArtistz(artists)
    setEventz(event)
    console.log('ezz', eventz)
  }

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Header />
          <Routes>
            <Route path="/" element={<Home state={state}/>}></Route>
            <Route path="/events" element={<Events state={state} setEvent={eventSetter}/>
            } />
            <Route path="/event/:id" element={
              <Event event={eventz} artists={artistz}/>
            }>
            </Route>
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </>
  );
}


