import React, { Component } from 'react';
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

export default function App() {
  const[events, setEvents] = ([events_data])
  const [event, setEvent] = ([])
  // setEvents(events_data)

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


