import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'
import Tracklist from '../Tracks/Tracklist';
import TracklistItem from '../Tracks/TrackListItem';

export default function Artist() {
  const [state, setState] = useState({
    tracks: [],
  })

  const [artist, setArtist] = useState({});

  useEffect(() => {
    axios.get(`/artist`)
      .then(result => setArtist(result.data))
  }, []);

  useEffect(() => {
    // console.log('Event triggered')
    axios.get('/tracks')
      .then((response) => {
        // console.log("response.data", response.data)
        const tracks = response.data.tracks
        // console.log(response.data)
        setState({
          tracks: tracks
        });
      })
  }, []);

  const tempArtistName = state.tracks[0].artists[0].name;

  // console.log("ARTIST", artist);

  return (
    <div className='artist-info'>
    <h1 className='artist-name'>
      {tempArtistName}
    </h1>
    <Tracklist
      tracks={state.tracks}/>
    </div>
  )
}


