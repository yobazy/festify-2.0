import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'



export default function Artist() {
  const params = useParams();
  const artistID = params['id']

  return (
    <div>
      <h1>Artist</h1>
    </div>
  );
}