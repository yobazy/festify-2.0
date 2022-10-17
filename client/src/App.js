import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import EventListItem from './components/Event/EventListItem';
import { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from './components/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import headerImg from "./images/banner.jpeg";
import festifyIcon from './images/icon.png'



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
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Bungee&family=Roboto+Condensed:wght@700&family=Source+Sans+Pro:ital,wght@0,300;0,600;1,300;1,600&display=swap');
      </style>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/events" element={
              <div>
                <div className="header-box">
                  <img src={headerImg} className="header-photo" alt="header" />
                  <h3 className='greeting'>Welcome to Festify! Where you can experience your favourite festivals on the go! Choose an event and Festify will generate a Spotify playlist based on the event's lineup!</h3>
                </div>
                <EventList
                  events={state.events} />
              </div>
            } />

            <Route path="/events/:id" element={
              <EventListItem />
            }>
            </Route>
            {/* <Route path="/events/search" element={
          <EventListItem/>
        }> */}
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}


