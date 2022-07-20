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

  let artistGenres = null
  let artistPic = null
  let spotLink = null

  console.log('check length', Object.keys(props.artistInfo).length !== 0)
  if (Object.keys(props.artistInfo).length !== 0) {
    // console.log(props.artistInfo[0].genres);
    spotLink = props.artistInfo[0].href

    artistPic = props.artistInfo[0].images[0].url

    artistGenres = props.artistInfo[0].genres.join(', ');
  }

  return (
    <div className='artist-info'>
      <div className='artist-header'>
          {/* <img src={artistLink} href={spotLink}/> */}
          {artistPic && <img className='artist-icon' src={artistPic} />}
        <div className='artist-title'>
          <h1 className='artist-name'>
            {props.artist}
          </h1>
          {artistGenres && <div className='genres'>
            {artistGenres}
          </div>}
        </div>
      </div>
      <Tracklist
        tracks={props.tracks} />
    </div>
  )
}


