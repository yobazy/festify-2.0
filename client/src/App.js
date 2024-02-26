import React, { useEffect, useState } from 'react';
import './App.css';
import Events from './routes/Events';
import Event from './routes/Event';
import Artists from './routes/Artists';
import Artist from './routes/Artist';
import Navbar from './components/Navbar';
import { Route, Routes, BrowserRouter } from 'react-router-dom';
import Home from './routes/Home'
import Footer from './components/Footer';
import artists_data from './artists.json'
import { supabase } from "./client"


export default function App() {

  // load dummy artist data
  const artists = artists_data

  // console.log('initalized events', events)
  const [events, setEvents] = useState([])
  const [showEvents, setShowEvents] = useState([])

  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState("");
  const searchParams = ["event_name","event_location", "event_venue"];
  // const [searchParams, setSearchParams] = useState([])
  const [searchQuery, setSearchQuery] = useState("");


  // fetch events from supabase api
  async function fetchEvents() {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *, 
        artists ( * )
      `)
    if (error) {
      // setEvents(null)
      // return <>error.message</>
      console.log('error')
    } else if (!isLoaded) {
      // return <>loading...</>
      console.log('loading')
    }; // add error case
    setEvents(data);
    setShowEvents(data)
    console.log("DATA", data);
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    setSearchQuery(query)
    // filter events by search query
    const filtered = events.filter((event) => {
      return searchParams.some((newItem) => {
        return event[newItem].toString().toLowerCase().indexOf(query.toLowerCase()) > -1;
      });
    });
    setShowEvents(filtered)
  }, [query]) // if add clickSearch button, change this 

  return (
    <>
      <BrowserRouter>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home events={showEvents} query={query} setQuery={setQuery}/>}/>
            <Route path="/events" element={<Events events={showEvents} query={query} setQuery={setQuery}/>}/>
            <Route path="/event/:id" element={
              <Event/>
            }>
            </Route>
            <Route path="/artists" element={
              <Artists/>
            }>
            </Route>
            <Route path="/artist/:id" element={
              <Artist/>
            }>
            </Route>
          </Routes>
          <Footer/>
        </div>
      </BrowserRouter>
    </>
  );
}


