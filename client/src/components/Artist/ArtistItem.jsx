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
import chasingPoster from '../../images/chasing-summer.jpeg';

export default function Artist(props) {
  // console.log(props);

  let artistGenres = null
  let artistPic = null
  let spotLink = null
  let emptyBox = null
  let evntImg = null

  console.log('check length', Object.keys(props.artistInfo).length !== 0)
  if (Object.keys(props.artistInfo).length !== 0) {
    spotLink = props.artistInfo[0].href

    artistPic = props.artistInfo[0].images[0].url

    artistGenres = props.artistInfo[0].genres.join(', ');

  }

  else {
    emptyBox = "Click on an artist and check out their tracks!!"

    evntImg = chasingPoster;
  }
  
    // const trackPreview = props.tracks[0].preview_url
  

  return (
    <>
    <div className='artist-info'>
      <div className='artist-header'>
        <p className='empty'>{emptyBox}</p>
          {artistPic && <img className='artist-icon' src={artistPic} />}
        {props.artist && <div className='artist-title'>
          <h1 className='artist-name'>
            {props.artist}
          </h1>
          {artistGenres && <div className='genres'>
            {artistGenres}
          </div>}
        </div>}
      </div>
      <Tracklist
        tracks={props.tracks} />
    </div>
    <img id="poster2"src={evntImg} />
    </>
  )
}


