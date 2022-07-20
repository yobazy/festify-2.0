import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import EventList from './components/Event/EventList';
import EventListItem from './components/Event/EventListItem';
import { useState, useEffect } from "react";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import headerImg from "./images/banner.jpeg";



export default function App() {
  const [state, setState] = useState({
    events: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }],
    allEvents: [{ name: 'shambs', date: 'asdasd', artistList: [{ name: 'clams casino' }] }]
  })

  const [query, setQuery] = useState('')

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
          <Navbar className='nav' bg="dark" variant="dark">
            <Container className="nav-container">
              <Navbar.Brand className="brand" href="/">FESTIFY</Navbar.Brand>
              <Nav className="me-auto">
                <div className='disco'>
                <Nav.Link className='home' href="/">HOME</Nav.Link>
                <Nav.Link className='user' href="#features">USER</Nav.Link>
                </div>
                <Nav.Link href="#search">
                  {/* <form action="/events/search" method="get" > */}
                  <input id="query" name="query" type="text" placeholder='Search...' onChange={(event) => setQuery(event.target.value)} value={query} />
                  <input id ="search" name="commit" type="submit" value="Search" data-disable-with="Search" onClick={handleSearch} />
                  {/* </form> */}
                </Nav.Link>
              </Nav>
            </Container>
          </Navbar>
          {/* <Button onClick={printState} >
        Print state
      </Button> */}
          {/* <headerImg>
        <img href="/images/header-banner.jpg" alt='banner'/>
      </headerImg> */}
          <Routes>
            <Route path="/events" element={
              <div>
                <div className="header-box">
                  <img src={headerImg} className="header-photo" alt="header" />
                  <h2 className='greeting'>Welcome to Festify! Where you can experience your favourite festivals in your room or on your way to the real thing! Choose an event and Festify will generate a Spotify playlist based on the event's lineup!</h2>
                </div>
                <EventList
                  events={state.events} />
              </div>
            } />

            {/* <Route path="/events" element={
        }>
        </Route> */}
            <Route path="/events/:id" element={
              <EventListItem />
            }>
            </Route>
            {/* <Route path="/events/search" element={
          <EventListItem/>
        }> */}
            {/* </Route> */}
          </Routes>
        </div>
      </BrowserRouter>
    </>
  );
}


