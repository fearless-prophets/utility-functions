const fs = require('fs')

//user, playlists, tracks
try {
  const data = fs.readFileSync('info.json', 'utf8')
  const info = JSON.parse(data.toString())

  // helper logs
  
  const playlistsDict = objectListToDictById(info.playlists);
  const trackDict = objectListToDictById(info.tracks);
  console.log("playlistIds", Object.keys(playlistsDict).map(p => {
    return [p, playlistsDict[p].tracks.length, playlistsDict[p].name]
  }));

  const setLogicLibrary = createSetLogicLibrary(info);
  
  console.log("UNION");
  let result = setLogicLibrary.unionPlaylists("67m0s0LNvic0ygMrwRop1g", "1M6VWLQIn5RTrCbApnaOId")
  console.log(result, result.length);
  
  console.log("INNER JOIN");
  result = setLogicLibrary.innerJoinPlaylists("67m0s0LNvic0ygMrwRop1g", "0YIKXcMEqiE0OJTytTg93J")
  console.log(result, result.length);
  
  console.log("OUTER JOIN");
  result = setLogicLibrary.outerJoinPlaylists("67m0s0LNvic0ygMrwRop1g", "0YIKXcMEqiE0OJTytTg93J")
  console.log(result, result.length);
  
  console.log("OUTER DIFFERENCE");
  result = setLogicLibrary.getAllFromFirstNoneFromSecondPlaylists("67m0s0LNvic0ygMrwRop1g", "0YIKXcMEqiE0OJTytTg93J")
  console.log(result, result.length);

  const sortLibrary = createSortLibrary(info);
  const someTrackIds = Object.keys(trackDict).slice(0, Math.ceil(Math.random() * 50));
  const attribute = "tempo";
  console.log("SORT ASCENDING");
  result = sortLibrary.sortTracksByAttributeAscending(someTrackIds, attribute);
  console.log(result.map(r => r[attribute]), result.length);
  console.log("SORT DESCENDING");
  result = sortLibrary.sortTracksByAttributeDescending(someTrackIds, attribute);
  console.log(result.map(r => r[attribute]), result.length);
  
} catch (err) {
  console.error(err)
}


function createSetLogicLibrary(info) {
  const playlistsDict = objectListToDictById(info.playlists);
  // Needed for tags
  // const tracksDict = objectListToDictById(info.tracks);

  const getTrackIdsFromPlaylist = (playlistId) => {
    if (playlistId in playlistsDict) {
      const tracks = playlistsDict[playlistId].tracks
      const trackIds = tracks.map(p => p.id)
      return trackIds
    } else {
      return undefined
    }
  }

  const performSetOperation = (playlistId1, playlistId2, func) => {
    const trackIds1 = new Set(getTrackIdsFromPlaylist(playlistId1));
    const trackIds2 = new Set(getTrackIdsFromPlaylist(playlistId2));
    return Array.from(func(trackIds1, trackIds2));
  }

  const innerJoinPlaylists = (playlistId1, playlistId2) => {
    return performSetOperation(playlistId1, playlistId2, intersection);
  }

  const unionPlaylists = (playlistId1, playlistId2) => {
    return performSetOperation(playlistId1, playlistId2, union);
  }

  
  const outerJoinPlaylists = (playlistId1, playlistId2) => {
    return performSetOperation(playlistId1, playlistId2, symmetricDifference);
  }

  const getAllFromFirstNoneFromSecondPlaylists =  (playlistId1, playlistId2) => {
    return performSetOperation(playlistId1, playlistId2, difference);
  }

  return {
    innerJoinPlaylists,
    unionPlaylists,
    outerJoinPlaylists,
    getAllFromFirstNoneFromSecondPlaylists
  };
}

function createSortLibrary(info) {
  const tracksDict = objectListToDictById(info.tracks);
  function sortTracksByAttributeAscending(trackIds, attribute) {
    const tracks = trackIds.map(t => tracksDict[t]);
    return tracks.sort((a, b) => (a[attribute] > b[attribute]) ? 1 : -1);
  }
  function sortTracksByAttributeDescending(trackIds, attribute) {
    const tracks = trackIds.map(t => tracksDict[t]);
    return tracks.sort((a, b) => (a[attribute] < b[attribute]) ? 1 : -1);
  }
  return {
    sortTracksByAttributeAscending,
    sortTracksByAttributeDescending
  }
}

// // Converts a list of objects to a dictionary by IDs
function objectListToDictById(objects) {
  return objects.filter(o=>o && o.id != null).reduce((acc, o) => (acc[o.id] = o, acc), {});
}

/*********** Set Logic Operator Function ***********/

// is subset a subset of set 
// are all the elements from subset in set  (returns Boolean)
function isSuperset(set, subset) {
  for (let elem of subset) {
      if (!set.has(elem)) {
          return false
      }
  }
  return true
}

// "merge" both setA and setB
function union(setA, setB) {
  let _union = new Set(setA)
  for (let elem of setB) {
      _union.add(elem)
  }
  return _union
}

// Inner join
function intersection(setA, setB) {
  let _intersection = new Set()
  for (let elem of setB) {
      if (setA.has(elem)) {
          _intersection.add(elem)
      }
  }
  return _intersection
}

// Outer join both setA and setB
function symmetricDifference(setA, setB) {
  let _difference = new Set(setA)
  for (let elem of setB) {
      if (_difference.has(elem)) {
          _difference.delete(elem)
      } else {
          _difference.add(elem)
      }
  }
  return _difference
}

//setA not setB
function difference(setA, setB) {
  let _difference = new Set(setA)
  for (let elem of setB) {
      _difference.delete(elem)
  }
  return _difference
}
/***************************************************/