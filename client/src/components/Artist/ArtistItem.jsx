import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'
import Tracklist from '../Tracks/Tracklist';
import TracklistItem from '../Tracks/TrackListItem';

export default function Artist() {

  const [artist, setArtist] = useState({});

  useEffect(() => {
    axios.get(`/artist`)
      .then(result => setArtist(result.data))
  }, []);

  // console.log("ARTIST", artist);

  return (
    <div className='artist-info'>
    <h1 className='artist-name'>
      {artist.name}
    </h1>
    <Tracklist/>
    </div>
  )
}


