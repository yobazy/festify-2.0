import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Button from 'react-bootstrap/Button';
import Card from 'react-bootstrap/Card';
// import '../../../src/Event.css'
import Player from './Player';
import '../../../src/Tracks.css'
import spotLogo from '../../../src/images/spot-logo.png'

export default function Tracklist(props) {
  console.log(props)

  function millisToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }



  const listTracks = props.tracks.map((track) => {
    const link = track.external_urls.spotify
    console.log(link);
    const trackDur = millisToMinutesAndSeconds(track.duration_ms);
    const img = track.album.images[1].url;
    const feats = [];
    const featArtists = track.artists.map((artist) => {
      feats.push(artist['name'])
    })
    const f = feats.join(', ');
    return (
      <div className='track-info'>
        <div className='track-box'>
          <div className="sum">
            <h3 className='track-name'>{track.name}</h3>
            <a href={link}>
              <img id="logo" src={spotLogo}></img>
            </a>
          </div>
          <div className='feat'>
            {/* <h5></h5> */}
            <h5 className='feat'>Artists: {f}</h5>
          </div>
          <h5 id="time" className='feat'>Duration: {trackDur} min</h5>
        </div>

        <img className='track-img' src={img} alt="icons" />
      </div>
    )
  })

  console.log(props.tracks);

  return (
    <div className='tracklist'>
      <ul className='unordered'> {listTracks}</ul>
    </div>
  )
}

// hellloooo 


