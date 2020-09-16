const DEG = Math.PI / 180.0
const RAD = 180 / Math.PI

// Calculate Julian date: valid only from 1.3.1901 to 28.2.2100
function CalcJD (day: any, month: any, year: any): any {
  let jd = 2415020.5 - 64 // 1.1.1900 - correction of algorithm
  if (month <= 2) { year--; month += 12 }
  jd += Math.trunc((year - 1900) * 365.25)
  jd += Math.trunc(30.6001 * (1 + month))
  return (jd + day)
}

// Julian Date to Greenwich Mean Sidereal Time
function GMST (JD: any): any {
  let UT = (24 * (JD % 1) - 12) // UT in hours
  JD = Math.floor(JD - 0.5) + 0.5   // JD at 0 hours UT
  let T = (JD - 2451545.0) / 36525.0
  let T0 = 6.697374558 + T * (2400.051336 + T * 0.000025862)
  return ((T0 + UT * 1.002737909) % 24)
}

// Convert Greenweek mean sidereal time to UT
function GMST2UT (JD: any, gmst: any): any {
  JD = Math.floor(JD - 0.5) + 0.5   // JD at 0 hours UT
  let T = (JD - 2451545.0) / 36525.0
  let T0 = (6.697374558 + T * (2400.051336 + T * 0.000025862)) % 24
    // var UT = 0.9972695663*((gmst-T0))%(24.);
  let UT = 0.9972695663 * ((gmst - T0))
  return (UT)
}

// Transform ecliptical coordinates (lon/lat) to equatorial coordinates (RA/dec)
function Ecl2Equ (coor: any, TDT: any) {
  let T = (TDT - 2451545.0) / 36525 // Epoch 2000 January 1.5
  let eps = (23 + (26 + 21.45 / 60) / 60 + T * (-46.815 + T * (-0.0006 + T * 0.00181)) / 3600) * DEG
  let coseps = Math.cos(eps)
  let sineps = Math.sin(eps)

  let sinlon = Math.sin(coor.lon)
  coor.ra = (Math.atan2((sinlon * coseps - Math.tan(coor.lat) * sineps), Math.cos(coor.lon))) % (2 * Math.PI)
  coor.dec = Math.asin(Math.sin(coor.lat) * coseps + Math.cos(coor.lat) * sineps * sinlon)

  return coor
}

// Calculate coordinates for Sun
// Coordinates are accurate to about 10s (right ascension)
// and a few minutes of arc (declination)
function SunPosition (TDT: any): any {
  let D = TDT - 2447891.5

  let eg = 279.403303 * DEG
  let wg = 282.768422 * DEG
  let e = 0.016713
  let a = 149598500 // km
  let diameter0 = 0.533128 * DEG // angular diameter of Moon at a distance

  let MSun = 360 * DEG / 365.242191 * D + eg - wg
  let nu = MSun + 360 * DEG / Math.PI * e * Math.sin(MSun)

  let sunCoor: any = {}
  sunCoor.lon = (nu + wg) % (2 * Math.PI)
  sunCoor.lat = 0

  sunCoor.distance = (1 - Math.pow(e, 2)) / (1 + e * Math.cos(nu)) // distance in astronomical units
  sunCoor.diameter = diameter0 / sunCoor.distance // angular diameter in radians
  sunCoor.distance *= a                         // distance in km
  sunCoor.parallax = 6378.137 / sunCoor.distance  // horizonal parallax

  sunCoor = Ecl2Equ(sunCoor, TDT)

  return sunCoor
}

// returns Greenwich sidereal time (hours) of time of rise
// and set of object with coordinates coor.ra/coor.dec
// at geographic position lon/lat (all values in radians)
// Correction for refraction and semi-diameter/parallax of body is taken care of in function RiseSet
// h is used to calculate the twilights. It gives the required elevation of the disk center of the sun
function GMSTRiseSet (coor: any, lon: any, lat: any, h: any) {
  h = (h == null) ? 0 : h // set default value
  let riseset: any = {}
    //  var tagbogen = Math.acos(-Math.tan(lat)*Math.tan(coor.dec)); // simple formula if twilight is not required
  let tagbogen = Math.acos((Math.sin(h) - Math.sin(lat) * Math.sin(coor.dec)) / (Math.cos(lat) * Math.cos(coor.dec)))

  riseset.transit = RAD / 15 * (+coor.ra - lon)
  riseset.rise = 24 + RAD / 15 * (-tagbogen + coor.ra - lon) // calculate GMST of rise of object
  riseset.set = RAD / 15 * (+tagbogen + coor.ra - lon) // calculate GMST of set of object

    // using the modulo function Mod, the day number goes missing. This may get a problem for the moon
  riseset.transit = (riseset.transit) % (24)
  riseset.rise = (riseset.rise) % (24)
  riseset.set = (riseset.set) % (24)

  return (riseset)
}

// Find GMST of rise/set of object from the two calculates
// (start)points (day 1 and 2) and at midnight UT(0)
function InterpolateGMST (gmst0: any, gmst1: any, gmst2: any, timefactor: any) {
  return ((timefactor * 24.07 * gmst1 - gmst0 * (gmst2 - gmst1)) / (timefactor * 24.07 + gmst1 - gmst2))
}

// JD is the Julian Date of 0h UTC time (midnight)
function RiseSet (jd0UT: any, coor1: any, coor2: any, lon: any, lat: any, timeinterval: any, altitude: any = 0) {
    // altitude of sun center: semi-diameter, horizontal parallax and (standard) refraction of 34'
  let alt = 0 // calculate
  altitude = (altitude == null) ? 0 : altitude // set default value

    // true height of sun center for sunrise and set calculation. Is kept 0 for twilight (ie. altitude given):
  if (!altitude) alt = 0.5 * coor1.diameter - coor1.parallax + 34 / 60 * DEG

  let rise1 = GMSTRiseSet(coor1, lon, lat, altitude)
  let rise2 = GMSTRiseSet(coor2, lon, lat, altitude)

  let rise: any = {}

    // unwrap GMST in case we move across 24h -> 0h
  if (rise1.transit > rise2.transit && Math.abs(rise1.transit - rise2.transit) > 18) rise2.transit += 24
  if (rise1.rise > rise2.rise && Math.abs(rise1.rise - rise2.rise) > 18) rise2.rise += 24
  if (rise1.set > rise2.set && Math.abs(rise1.set - rise2.set) > 18) rise2.set += 24
  let T0 = GMST(jd0UT)
    //  var T02 = T0-zone*1.002738; // Greenwich sidereal time at 0h time zone (zone: hours)

    // Greenwich sidereal time for 0h at selected longitude
  let T02 = T0 - lon * RAD / 15 * 1.002738; if (T02 < 0) T02 += 24

  if (rise1.transit < T02) { rise1.transit += 24; rise2.transit += 24 }
  if (rise1.rise < T02) { rise1.rise += 24; rise2.rise += 24 }
  if (rise1.set < T02) { rise1.set += 24; rise2.set += 24 }

    // Refraction and Parallax correction
  let decMean = 0.5 * (coor1.dec + coor2.dec)
  let psi = Math.acos(Math.sin(lat) / Math.cos(decMean))
  let y = Math.asin(Math.sin(alt) / Math.sin(psi))
  let dt = 240 * RAD * y / Math.cos(decMean) / 3600 // time correction due to refraction, parallax

  rise.transit = GMST2UT(jd0UT, InterpolateGMST(T0, rise1.transit, rise2.transit, timeinterval))
  rise.rise = GMST2UT(jd0UT, InterpolateGMST(T0, rise1.rise, rise2.rise, timeinterval) - dt)
  rise.set = GMST2UT(jd0UT, InterpolateGMST(T0, rise1.set, rise2.set, timeinterval) + dt)

  return (rise)
}

// Find (local) time of sunrise and sunset, and twilights
// JD is the Julian Date of 0h local time (midnight)
// Accurate to about 1-2 minutes
// recursive: 1 - calculate rise/set in UTC in a second run
// recursive: 0 - find rise/set on the current local day. This is set when doing the first call to this function
// deltaT https://de.wikipedia.org/wiki/Delta_T
function SunRise (JD: any, deltaT: any, lon: any, lat: any, zone: any, twilightOffset: any): any {
  let jd0UT = Math.floor(JD - 0.5) + 0.5   // JD at 0 hours UTC
  let coor1 = SunPosition(jd0UT + deltaT / 24 / 3600)
  let coor2 = SunPosition(jd0UT + 1 + deltaT / 24 / 3600) // calculations for next day's UTC midnight
  let risetemp: any = {}
  let rise: any = {}
    // rise/set time in UTC.
  rise = RiseSet(jd0UT, coor1, coor2, lon, lat, 1)

  rise.transit = (rise.transit + zone) % (24)
  rise.rise = (rise.rise + zone) % (24)
  rise.set = (rise.set + zone) % (24)
  if (rise.rise < 0) {
    rise.rise += 24
  }

  if (rise.set < 0) {
    rise.rise += 24
  }
    // Twilight calculation
    // civil twilight time in UTC.
  risetemp = RiseSet(jd0UT, coor1, coor2, lon, lat, 1, twilightOffset * DEG)
  rise.dawn = (risetemp.rise + zone) % (24)
  rise.dusk = (risetemp.set + zone) % (24)
  if (rise.dawn < 0) {
    rise.dawn += 24
  }

  if (rise.dusk < 0) {
    rise.dusk += 24
  }

  if (rise.dusk < rise.dawn) {
    rise.dusk += 24
  }

  if (rise.set < rise.rise) {
    rise.set += 24
  }
  return rise
}

export function CalcSunRise (ts: Date, lat: number, lon: number, timeZone: number, deltaT: number, twilightOffset: number): {
  dawn: Date
  dusk: Date
  rise: Date
  set: Date
} {
  deltaT = deltaT || 0
  const JD0 = CalcJD(ts.getDate(), ts.getMonth() + 1, ts.getFullYear())

  lat *= DEG // geodetic latitude of observer on WGS84
  lon *= DEG // latitude of observer
  let data = SunRise(JD0, deltaT, lon, lat, timeZone, twilightOffset)
  let nts = new Date(ts.getTime())
  nts.setHours(0,0,0,0)
  for (let i in data) {
    data[i] = new Date(nts.getTime() + data[i] * 60 * 60 * 1000)
  }
  return data
}
