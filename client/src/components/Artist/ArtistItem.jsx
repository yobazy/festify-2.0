import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
import '../../../src/Event.css'
import Tracklist from '../Tracks/Tracklist';
import TracklistItem from '../Tracks/TrackListItem';
// import artistLink from '../../../src/images/spot-link4.jpeg';
import '../../../src/Artist.css'

export default function Artist(props) {
  console.log(props);
  // const [pic, setPic] = useState('')
  if (typeof props.artistInfo == 'undefined') {

    console.log(props.artistInfo[0].genres);
    const artistGenres = props.artistInfo[0].genres.map((g) => {
      console.log(g);
      return <h3>{g}</h3>
    });
  
    // const spotLink = props.artistInfo[0].href;
  
    const artistPic = props.artistInfo[0].images[0].url;
  }

  return (
    <div className='artist-info'>
      {/* <img src={artistLink} href={spotLink}/> */}
      {/* <img className='artist-icon' src={artistPic} /> */}
      <h1 className='artist-name'>
        {props.artist}
      </h1>

      <div className='genres'>
        {/* {artistGenres} */}
      </div>
      <Tracklist
        tracks={props.tracks} />
    </div>
  )
}


