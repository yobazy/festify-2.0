import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import Events from './routes/Events';
import Event from './routes/Event';
import { useState, useEffect } from "react";
import Navbar from './components/Navbar';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import headerImg from "./images/banner.jpeg";
import Home from './routes/Home'
import Footer from './components/Footer';



export default function App() {
  const [state, setState] = useState({
    events: [],
    allEvents: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }]
  })

  const [query, setQuery] = useState('')
  const [eventz, setEventz] = useState({})
  const [artistz, setArtistz] = useState({})

  // api call to get events
  useEffect(() => {
    // console.log('Event triggered')
    axios.get('/events')
      .then((response) => {
        // console.log("response.data", response.data)
        const events = response.data.data
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

  const setArtists = (artistList) => {
    setArtistz(artistList)
  }

  const eventSetter = (event, artists) => {
    setArtists(artists)
    setEventz(event)
    console.log('ezz', eventz)
  }


  const filterSearch = (allEvents, query) => {
    const search = allEvents.filter(function (event) {
      return event.name.includes(query)
    })
    return search;
  }

  const handleSearch = () => {
    console.log('Search triggered')
    console.log('all events', state.allEvents)

    let allEvents = state.allEvents
    let searchResults = filterSearch(state.allEvents, query)
    setState({
      events: searchResults,
      allEvents: allEvents
    });
    console.log('events', state.events)

  };

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <img src={headerImg} className="banner"/>
          <Routes>
            <Route path="/" element={<Home />}></Route>
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


