import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import EventListItem from './components/Event/EventListItem';
import { useState, useEffect } from "react";
import Navbar from './components/Navbar';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import headerImg from "./images/banner.jpeg";



export default function App() {
  const [state, setState] = useState({
    events: [],
    allEvents: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }]
  })

  const [query, setQuery] = useState('')

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
          <Routes>
            <Route path="/events" element={
              <div>
                <div className="header-box">
                  <img src={headerImg} className="header-photo" alt="header" />
                  <p className='greeting text'>Welcome to Festify!</p>
                  <p className='greeting text'>Search for a event below. Festify will generate a Spotify playlist based on the event's lineup!</p>
                </div>
                <EventList
                  events={state.events} />
              </div>
            } />
            <Route path="/events/:id" element={
              <EventListItem />
            }>
            </Route>
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}


