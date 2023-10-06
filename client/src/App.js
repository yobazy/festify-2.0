import React, { useEffect, useState, Component } from 'react';
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
import { supabase } from "./client"


export default function App() {
  // load dummy events data
  const events = events_data

  // load dummy artist data
  const artists = artists_data

  // console.log('initalized events', events)
  const [eventsTwo, setEvents] = useState([])

  useEffect(() => {
    fetchEvents()
  }, [])

  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select();
    if (error) console.error("Error fetching events:", error);
    setEvents(data);
    console.log("DATA", data);
  }

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
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


