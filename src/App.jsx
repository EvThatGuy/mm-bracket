import { useState, useEffect, useMemo, useCallback } from "react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

/* ══════════════════════════════════════════════════════════════
   TEAM DATABASE — 68 teams with deep analytics
   off/def/reb/to/three/ft/bench = 0-100 ratings
   tempo = possessions per 40 min (scaled 0-100, 50=avg)
   style: "inside","balanced","perimeter","fastbreak"
   defStyle: "pack-line","switch","press","zone","man"
   clutch = late-game performance rating
   starPIR = star player impact rating (0-100)
   ══════════════════════════════════════════════════════════════ */
const T={
"Duke":{s:1,r:"E",rec:"32-2",c:"ACC",off:96,def:97,exp:78,mom:95,sos:92,reb:88,to:85,three:76,ft:81,bench:80,tempo:72,style:"balanced",defStyle:"man",clutch:92,starPIR:97,star:"Cameron Boozer",starLine:"18.4p/8.2r/3.1a",inj:"",coach:"Jon Scheyer",vegasOdds:"+333",vegasImpl:23.1,note:"No.1 overall, Boozer top-3 NBA pick, best KenPom"},
"Siena":{s:16,r:"E",rec:"23-11",c:"MAAC",off:42,def:38,exp:55,mom:60,sos:18,reb:42,to:55,three:58,ft:68,bench:50,tempo:65,style:"perimeter",defStyle:"zone",clutch:50,starPIR:30,star:"",starLine:"",inj:"",coach:"C. Maciariello",vegasOdds:"",vegasImpl:0.2,note:"MAAC champ"},
"Ohio State":{s:8,r:"E",rec:"21-12",c:"Big Ten",off:68,def:70,exp:72,mom:62,sos:82,reb:72,to:65,three:63,ft:74,bench:70,tempo:68,style:"balanced",defStyle:"man",clutch:60,starPIR:52,star:"",starLine:"",inj:"",coach:"Jake Diebler",vegasOdds:"+8000",vegasImpl:1.2,note:"Big Ten defense, solid"},
"TCU":{s:9,r:"E",rec:"22-11",c:"Big 12",off:70,def:67,exp:74,mom:65,sos:80,reb:65,to:68,three:70,ft:72,bench:68,tempo:66,style:"perimeter",defStyle:"switch",clutch:62,starPIR:55,star:"",starLine:"",inj:"",coach:"Jamie Dixon",vegasOdds:"+8000",vegasImpl:1.2,note:"Big 12 tested"},
"St. John's":{s:5,r:"E",rec:"28-6",c:"Big East",off:80,def:76,exp:82,mom:88,sos:74,reb:70,to:72,three:74,ft:78,bench:75,tempo:70,style:"balanced",defStyle:"man",clutch:82,starPIR:70,star:"",starLine:"",inj:"",coach:"Rick Pitino",vegasOdds:"+3500",vegasImpl:2.8,note:"18-2 Big East, Pitino magic"},
"N. Iowa":{s:12,r:"E",rec:"23-12",c:"MVC",off:58,def:55,exp:70,mom:72,sos:35,reb:58,to:60,three:65,ft:75,bench:62,tempo:60,style:"inside",defStyle:"man",clutch:68,starPIR:42,star:"",starLine:"",inj:"",coach:"Ben Jacobson",vegasOdds:"",vegasImpl:0.5,note:"Classic 12-seed profile"},
"Kansas":{s:4,r:"E",rec:"23-10",c:"Big 12",off:76,def:82,exp:80,mom:68,sos:88,reb:78,to:70,three:68,ft:76,bench:76,tempo:70,style:"balanced",defStyle:"man",clutch:78,starPIR:68,star:"",starLine:"",inj:"",coach:"Bill Self",vegasOdds:"+2500",vegasImpl:3.8,note:"8 Q1 wins, Self tourney pedigree"},
"Cal Baptist":{s:13,r:"E",rec:"25-8",c:"WAC",off:52,def:48,exp:62,mom:70,sos:22,reb:50,to:58,three:62,ft:70,bench:55,tempo:72,style:"fastbreak",defStyle:"man",clutch:55,starPIR:35,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.3,note:"WAC champ, first-ever tourney"},
"Louisville":{s:6,r:"E",rec:"23-10",c:"ACC",off:72,def:68,exp:70,mom:72,sos:78,reb:68,to:68,three:66,ft:70,bench:72,tempo:74,style:"fastbreak",defStyle:"press",clutch:65,starPIR:62,star:"",starLine:"",inj:"Brown (back) GTD",coach:"Pat Kelsey",vegasOdds:"+5000",vegasImpl:2.0,note:"Brown back injury is major concern"},
"S. Florida":{s:11,r:"E",rec:"25-8",c:"AAC",off:65,def:62,exp:68,mom:82,sos:52,reb:60,to:64,three:68,ft:72,bench:65,tempo:75,style:"fastbreak",defStyle:"press",clutch:70,starPIR:55,star:"",starLine:"",inj:"",coach:"",vegasOdds:"+15000",vegasImpl:0.7,note:"AAC champs, legit talent"},
"Michigan St":{s:3,r:"E",rec:"25-7",c:"Big Ten",off:82,def:84,exp:85,mom:78,sos:86,reb:80,to:78,three:70,ft:75,bench:82,tempo:68,style:"inside",defStyle:"switch",clutch:85,starPIR:75,star:"",starLine:"",inj:"",coach:"Tom Izzo",vegasOdds:"+2000",vegasImpl:4.8,note:"KenPom title contender, Izzo = March GOAT"},
"N. Dakota St":{s:14,r:"E",rec:"27-7",c:"Summit",off:48,def:45,exp:60,mom:68,sos:20,reb:48,to:58,three:60,ft:72,bench:52,tempo:62,style:"balanced",defStyle:"man",clutch:55,starPIR:32,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"Summit champ"},
"UCLA":{s:7,r:"E",rec:"23-11",c:"Big Ten",off:70,def:66,exp:72,mom:60,sos:80,reb:66,to:66,three:72,ft:74,bench:70,tempo:68,style:"perimeter",defStyle:"man",clutch:64,starPIR:58,star:"",starLine:"",inj:"",coach:"Mick Cronin",vegasOdds:"+6000",vegasImpl:1.6,note:"Blue blood Cinderella as 7-seed"},
"UCF":{s:10,r:"E",rec:"21-11",c:"Big 12",off:66,def:65,exp:68,mom:58,sos:76,reb:64,to:62,three:66,ft:70,bench:65,tempo:70,style:"balanced",defStyle:"switch",clutch:58,starPIR:50,star:"",starLine:"",inj:"",coach:"",vegasOdds:"+10000",vegasImpl:1.0,note:"Big 12 at-large"},
"UConn":{s:2,r:"E",rec:"29-5",c:"Big East",off:88,def:90,exp:88,mom:82,sos:78,reb:84,to:80,three:72,ft:82,bench:85,tempo:70,style:"balanced",defStyle:"switch",clutch:90,starPIR:82,star:"",starLine:"",inj:"",coach:"Dan Hurley",vegasOdds:"+1800",vegasImpl:5.3,note:"Championship DNA, 28th off, 11th def. Brutal East draw."},
"Furman":{s:15,r:"E",rec:"22-12",c:"SoCon",off:45,def:42,exp:58,mom:65,sos:25,reb:44,to:55,three:62,ft:72,bench:50,tempo:68,style:"perimeter",defStyle:"man",clutch:52,starPIR:28,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"SoCon champ"},

"Arizona":{s:1,r:"W",rec:"32-2",c:"Big 12",off:95,def:93,exp:82,mom:92,sos:90,reb:90,to:82,three:78,ft:80,bench:84,tempo:74,style:"inside",defStyle:"switch",clutch:90,starPIR:95,star:"Koa Peat",starLine:"20.1p/9.4r/2.8b",inj:"",coach:"Tommy Lloyd",vegasOdds:"+425",vegasImpl:19.0,note:"Big 12 champs, Peat is elite, best draw of 1-seeds"},
"LIU":{s:16,r:"W",rec:"24-10",c:"NEC",off:38,def:35,exp:50,mom:58,sos:12,reb:38,to:50,three:55,ft:65,bench:45,tempo:70,style:"perimeter",defStyle:"zone",clutch:42,starPIR:22,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"NEC champ"},
"Villanova":{s:8,r:"W",rec:"24-8",c:"Big East",off:68,def:66,exp:75,mom:65,sos:72,reb:62,to:70,three:75,ft:78,bench:68,tempo:64,style:"perimeter",defStyle:"man",clutch:68,starPIR:55,star:"",starLine:"",inj:"",coach:"Kyle Neptune",vegasOdds:"+8000",vegasImpl:1.2,note:"Classic Big East, dangerous 8"},
"Utah State":{s:9,r:"W",rec:"28-6",c:"MWC",off:72,def:68,exp:76,mom:78,sos:58,reb:70,to:72,three:68,ft:74,bench:72,tempo:68,style:"inside",defStyle:"man",clutch:72,starPIR:58,star:"",starLine:"",inj:"",coach:"",vegasOdds:"+10000",vegasImpl:1.0,note:"MWC champs, undervalued 9"},
"Wisconsin":{s:5,r:"W",rec:"24-10",c:"Big Ten",off:72,def:74,exp:82,mom:70,sos:82,reb:68,to:76,three:72,ft:82,bench:74,tempo:58,style:"balanced",defStyle:"pack-line",clutch:76,starPIR:60,star:"",starLine:"",inj:"",coach:"Greg Gard",vegasOdds:"+5000",vegasImpl:2.0,note:"Gritty D, slow pace neutralizes gaps"},
"High Point":{s:12,r:"W",rec:"30-4",c:"Big South",off:62,def:55,exp:65,mom:80,sos:28,reb:58,to:60,three:70,ft:72,bench:60,tempo:74,style:"perimeter",defStyle:"man",clutch:65,starPIR:45,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.4,note:"30-4, classic 12v5 upset candidate"},
"Arkansas":{s:4,r:"W",rec:"26-8",c:"SEC",off:78,def:74,exp:72,mom:76,sos:85,reb:74,to:66,three:70,ft:72,bench:74,tempo:78,style:"fastbreak",defStyle:"press",clutch:70,starPIR:65,star:"",starLine:"",inj:"",coach:"John Calipari",vegasOdds:"+3000",vegasImpl:3.2,note:"Calipari's 1st tourney w/ Arkansas, fast tempo"},
"Hawaii":{s:13,r:"W",rec:"24-8",c:"Big West",off:55,def:50,exp:60,mom:72,sos:24,reb:52,to:58,three:64,ft:70,bench:55,tempo:70,style:"perimeter",defStyle:"zone",clutch:58,starPIR:35,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.2,note:"Big West champ"},
"BYU":{s:6,r:"W",rec:"23-11",c:"Big 12",off:70,def:66,exp:74,mom:62,sos:78,reb:66,to:68,three:72,ft:76,bench:68,tempo:66,style:"perimeter",defStyle:"man",clutch:62,starPIR:55,star:"",starLine:"",inj:"",coach:"Kevin Young",vegasOdds:"+6000",vegasImpl:1.6,note:"Big 12 solid but inconsistent"},
"NC State":{s:11,r:"W",rec:"20-13",c:"ACC",off:64,def:62,exp:72,mom:68,sos:76,reb:62,to:62,three:65,ft:68,bench:64,tempo:72,style:"balanced",defStyle:"man",clutch:74,starPIR:52,star:"",starLine:"",inj:"",coach:"Kevin Keatts",vegasOdds:"+15000",vegasImpl:0.7,note:"Last Four In but last year's Cinderella shows March DNA"},
"Gonzaga":{s:3,r:"W",rec:"30-3",c:"WCC",off:90,def:82,exp:80,mom:85,sos:62,reb:78,to:78,three:76,ft:80,bench:80,tempo:74,style:"inside",defStyle:"man",clutch:82,starPIR:78,star:"",starLine:"",inj:"",coach:"Mark Few",vegasOdds:"+2000",vegasImpl:4.8,note:"30-3, elite O, WCC SOS is only question"},
"Kennesaw St":{s:14,r:"W",rec:"21-13",c:"ASUN",off:46,def:44,exp:55,mom:62,sos:20,reb:46,to:55,three:58,ft:68,bench:50,tempo:70,style:"balanced",defStyle:"zone",clutch:50,starPIR:28,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"ASUN champ"},
"Miami FL":{s:7,r:"W",rec:"25-8",c:"ACC",off:74,def:70,exp:72,mom:78,sos:78,reb:68,to:68,three:72,ft:74,bench:70,tempo:72,style:"balanced",defStyle:"switch",clutch:72,starPIR:62,star:"",starLine:"",inj:"",coach:"Jim Larrañaga",vegasOdds:"+5000",vegasImpl:2.0,note:"7-24 to 25-8 rebuild, incredible story"},
"Missouri":{s:10,r:"W",rec:"20-12",c:"SEC",off:66,def:64,exp:70,mom:60,sos:80,reb:66,to:64,three:64,ft:70,bench:66,tempo:70,style:"balanced",defStyle:"man",clutch:58,starPIR:50,star:"",starLine:"",inj:"",coach:"Dennis Gates",vegasOdds:"+10000",vegasImpl:1.0,note:"SEC quality 10-seed"},
"Purdue":{s:2,r:"W",rec:"27-8",c:"Big Ten",off:86,def:84,exp:92,mom:90,sos:86,reb:82,to:78,three:74,ft:84,bench:82,tempo:66,style:"inside",defStyle:"man",clutch:88,starPIR:85,star:"Braden Smith",starLine:"15.8p/5.2r/7.4a",inj:"",coach:"Matt Painter",vegasOdds:"+1200",vegasImpl:7.7,note:"BIG TEN CHAMPS over Michigan! Smith/Loyer/TKR senior trio peaking."},
"Queens NC":{s:15,r:"W",rec:"21-13",c:"ASUN",off:42,def:40,exp:52,mom:60,sos:18,reb:40,to:52,three:58,ft:66,bench:48,tempo:68,style:"perimeter",defStyle:"man",clutch:48,starPIR:25,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"First-ever tourney appearance"},

"Florida":{s:1,r:"S",rec:"26-7",c:"SEC",off:88,def:90,exp:85,mom:82,sos:88,reb:96,to:78,three:62,ft:78,bench:82,tempo:70,style:"inside",defStyle:"man",clutch:85,starPIR:80,star:"",starLine:"",inj:"",coach:"Todd Golden",vegasOdds:"+600",vegasImpl:14.3,note:"DEFENDING CHAMPS. Best rebounding in nation. No perimeter star like Clayton Jr."},
"Lehigh":{s:16,r:"S",rec:"18-16",c:"Patriot",off:35,def:32,exp:50,mom:55,sos:10,reb:35,to:50,three:55,ft:65,bench:45,tempo:68,style:"perimeter",defStyle:"zone",clutch:40,starPIR:18,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.0,note:"18-16 Patriot auto-bid"},
"Clemson":{s:8,r:"S",rec:"24-10",c:"ACC",off:68,def:70,exp:74,mom:68,sos:78,reb:70,to:68,three:66,ft:74,bench:70,tempo:66,style:"balanced",defStyle:"man",clutch:64,starPIR:52,star:"",starLine:"",inj:"",coach:"Brad Brownell",vegasOdds:"+8000",vegasImpl:1.2,note:"ACC vet squad"},
"Iowa":{s:9,r:"S",rec:"21-12",c:"Big Ten",off:72,def:64,exp:70,mom:60,sos:82,reb:64,to:62,three:74,ft:78,bench:68,tempo:76,style:"perimeter",defStyle:"man",clutch:60,starPIR:55,star:"",starLine:"",inj:"",coach:"Fran McCaffery",vegasOdds:"+8000",vegasImpl:1.2,note:"High tempo, Big Ten tested"},
"Vanderbilt":{s:5,r:"S",rec:"26-8",c:"SEC",off:78,def:72,exp:68,mom:82,sos:84,reb:68,to:66,three:74,ft:72,bench:70,tempo:76,style:"fastbreak",defStyle:"press",clutch:78,starPIR:88,star:"Tyler Tanner",starLine:"19.2p/5.3a/2.4s/37.3% 3P",inj:"",coach:"Mark Byington",vegasOdds:"+3000",vegasImpl:3.2,note:"MASSIVELY under-seeded as 5. Tanner is breakout star of the year."},
"McNeese":{s:12,r:"S",rec:"28-5",c:"Southland",off:62,def:58,exp:65,mom:82,sos:25,reb:58,to:62,three:68,ft:72,bench:60,tempo:74,style:"fastbreak",defStyle:"press",clutch:65,starPIR:45,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.4,note:"28-5, dangerous 12"},
"Nebraska":{s:4,r:"S",rec:"26-6",c:"Big Ten",off:74,def:72,exp:68,mom:55,sos:82,reb:72,to:70,three:68,ft:74,bench:70,tempo:68,style:"balanced",defStyle:"man",clutch:52,starPIR:55,star:"",starLine:"",inj:"",coach:"Fred Hoiberg",vegasOdds:"+4000",vegasImpl:2.4,note:"NEVER won NCAA tourney game. 20-0 start then 6-6. Red flag."},
"Troy":{s:13,r:"S",rec:"22-11",c:"Sun Belt",off:54,def:50,exp:62,mom:70,sos:30,reb:52,to:58,three:62,ft:70,bench:55,tempo:72,style:"balanced",defStyle:"man",clutch:58,starPIR:35,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.2,note:"Beat SDSU on road"},
"UNC":{s:6,r:"S",rec:"24-8",c:"ACC",off:72,def:68,exp:70,mom:55,sos:80,reb:72,to:64,three:68,ft:72,bench:68,tempo:76,style:"fastbreak",defStyle:"man",clutch:58,starPIR:45,star:"",starLine:"",inj:"Wilson (hand) OUT",coach:"Hubert Davis",vegasOdds:"+6000",vegasImpl:1.6,note:"Lost star Wilson to surgery. Huge blow."},
"VCU":{s:11,r:"S",rec:"27-7",c:"A-10",off:66,def:68,exp:72,mom:78,sos:52,reb:64,to:60,three:64,ft:70,bench:68,tempo:78,style:"fastbreak",defStyle:"press",clutch:72,starPIR:55,star:"",starLine:"",inj:"",coach:"Ryan Odom",vegasOdds:"+15000",vegasImpl:0.7,note:"Havoc defense, real upset threat vs injured UNC"},
"Illinois":{s:3,r:"S",rec:"24-8",c:"Big Ten",off:82,def:80,exp:76,mom:75,sos:84,reb:76,to:74,three:72,ft:78,bench:76,tempo:70,style:"balanced",defStyle:"switch",clutch:76,starPIR:86,star:"Keaton Wagler",starLine:"21.3p/4.8a/2.1s/39.1% 3P",inj:"",coach:"Brad Underwood",vegasOdds:"+2500",vegasImpl:3.8,note:"Wagler top-6 NBA prospect. Houston clash = scout's dream."},
"Penn":{s:14,r:"S",rec:"18-11",c:"Ivy",off:48,def:46,exp:62,mom:65,sos:22,reb:46,to:60,three:62,ft:74,bench:52,tempo:66,style:"perimeter",defStyle:"man",clutch:55,starPIR:30,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"Ivy champ"},
"Saint Mary's":{s:7,r:"S",rec:"27-5",c:"WCC",off:74,def:72,exp:78,mom:76,sos:56,reb:68,to:76,three:72,ft:80,bench:72,tempo:58,style:"inside",defStyle:"pack-line",clutch:78,starPIR:82,star:"Mikey Lewis",starLine:"22.6ppg last 5, 31 vs Gonzaga",inj:"",coach:"Randy Bennett",vegasOdds:"+4000",vegasImpl:2.4,note:"Lewis is scorching hot. Slow pace disrupts everyone."},
"Texas A&M":{s:10,r:"S",rec:"21-11",c:"SEC",off:66,def:64,exp:66,mom:58,sos:82,reb:66,to:62,three:62,ft:70,bench:65,tempo:74,style:"fastbreak",defStyle:"man",clutch:56,starPIR:48,star:"",starLine:"",inj:"",coach:"Bucky McMillan",vegasOdds:"+10000",vegasImpl:1.0,note:"First-year coach, fast-paced SEC"},
"Houston":{s:2,r:"S",rec:"28-6",c:"Big 12",off:90,def:92,exp:82,mom:86,sos:88,reb:86,to:82,three:70,ft:78,bench:84,tempo:62,style:"inside",defStyle:"press",clutch:88,starPIR:90,star:"Kingston Flemings",starLine:"22.8p/4.2a/1.8s/38.5% 3P",inj:"",coach:"Kelvin Sampson",vegasOdds:"+1200",vegasImpl:7.7,note:"Flemings top-5 prospect. HOME GAME at Toyota Center in S16."},
"Idaho":{s:15,r:"S",rec:"21-14",c:"Big Sky",off:44,def:42,exp:55,mom:60,sos:18,reb:42,to:54,three:58,ft:68,bench:48,tempo:70,style:"balanced",defStyle:"man",clutch:48,starPIR:25,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"First appearance since 1990"},

"Michigan":{s:1,r:"MW",rec:"31-3",c:"Big Ten",off:92,def:88,exp:80,mom:78,sos:86,reb:94,to:80,three:70,ft:78,bench:82,tempo:72,style:"inside",defStyle:"switch",clutch:80,starPIR:82,star:"Lendeborg/M.Johnson/Mara",starLine:"Combined 42.6p/24.8r",inj:"Cason (ACL) OUT",coach:"Dusty May",vegasOdds:"+325",vegasImpl:23.5,note:"Best frontcourt in nation but Cason ACL tear. Looked vulnerable since."},
"Howard":{s:16,r:"MW",rec:"23-10",c:"MEAC",off:40,def:36,exp:52,mom:62,sos:14,reb:40,to:52,three:56,ft:66,bench:48,tempo:72,style:"fastbreak",defStyle:"man",clutch:45,starPIR:22,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"MEAC champ"},
"Georgia":{s:8,r:"MW",rec:"22-10",c:"SEC",off:68,def:66,exp:70,mom:62,sos:84,reb:68,to:64,three:66,ft:72,bench:66,tempo:70,style:"balanced",defStyle:"man",clutch:60,starPIR:52,star:"",starLine:"",inj:"",coach:"Mike White",vegasOdds:"+8000",vegasImpl:1.2,note:"SEC at-large"},
"Saint Louis":{s:9,r:"MW",rec:"28-5",c:"A-10",off:72,def:70,exp:78,mom:80,sos:54,reb:70,to:74,three:70,ft:76,bench:72,tempo:66,style:"balanced",defStyle:"man",clutch:74,starPIR:62,star:"",starLine:"",inj:"",coach:"Josh Conklin",vegasOdds:"+8000",vegasImpl:1.2,note:"28-5, massively underseeded as 9"},
"Texas Tech":{s:5,r:"MW",rec:"22-10",c:"Big 12",off:72,def:76,exp:72,mom:65,sos:82,reb:70,to:72,three:68,ft:72,bench:70,tempo:64,style:"balanced",defStyle:"press",clutch:62,starPIR:55,star:"",starLine:"",inj:"Toppin OUT",coach:"Grant McCasland",vegasOdds:"+4000",vegasImpl:2.4,note:"Lost Toppin, now jump-shooting heavy"},
"Akron":{s:12,r:"MW",rec:"29-5",c:"MAC",off:64,def:60,exp:72,mom:82,sos:32,reb:62,to:66,three:70,ft:74,bench:64,tempo:68,style:"perimeter",defStyle:"man",clutch:68,starPIR:48,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.4,note:"29-5, Toppin loss makes this live upset"},
"Alabama":{s:4,r:"MW",rec:"23-9",c:"SEC",off:82,def:72,exp:74,mom:72,sos:86,reb:66,to:62,three:76,ft:70,bench:74,tempo:78,style:"perimeter",defStyle:"switch",clutch:70,starPIR:72,star:"",starLine:"",inj:"",coach:"Nate Oats",vegasOdds:"+2200",vegasImpl:4.3,note:"Top offense, scores fast, gets outrebounded"},
"Hofstra":{s:13,r:"MW",rec:"24-10",c:"CAA",off:55,def:50,exp:64,mom:72,sos:28,reb:54,to:60,three:66,ft:72,bench:58,tempo:72,style:"perimeter",defStyle:"zone",clutch:58,starPIR:38,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.2,note:"First appearance since 2001"},
"Tennessee":{s:6,r:"MW",rec:"22-11",c:"SEC",off:74,def:76,exp:72,mom:68,sos:84,reb:74,to:70,three:64,ft:70,bench:72,tempo:66,style:"inside",defStyle:"man",clutch:70,starPIR:85,star:"Nate Ament",starLine:"17.8p/5.1r/3.2a - lottery pick",inj:"",coach:"Rick Barnes",vegasOdds:"+4000",vegasImpl:2.4,note:"Ament lottery pick, Gillespie 1-2 punch, defensive frontcourt"},
"Miami OH":{s:11,r:"MW",rec:"31-1",c:"MAC",off:68,def:64,exp:76,mom:70,sos:30,reb:64,to:72,three:72,ft:76,bench:68,tempo:66,style:"balanced",defStyle:"man",clutch:76,starPIR:62,star:"Eian Elmer",starLine:"12.4p/43.2% 3P/elite D",inj:"",coach:"Travis Steele",vegasOdds:"+15000",vegasImpl:0.7,note:"31-1!!! 18-0 MAC. Analytics love them despite schedule."},
"Virginia":{s:3,r:"MW",rec:"29-5",c:"ACC",off:78,def:86,exp:84,mom:80,sos:80,reb:72,to:80,three:70,ft:82,bench:78,tempo:56,style:"inside",defStyle:"pack-line",clutch:82,starPIR:78,star:"Malik Thomas",starLine:"18.2p/4.8a",inj:"",coach:"Tony Bennett",vegasOdds:"+2500",vegasImpl:3.8,note:"Thomas & de Ridder 1-2 punch. Slowest pace in field."},
"Wright St":{s:14,r:"MW",rec:"23-11",c:"Horizon",off:50,def:46,exp:58,mom:65,sos:22,reb:48,to:58,three:62,ft:70,bench:52,tempo:72,style:"balanced",defStyle:"man",clutch:52,starPIR:30,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"Horizon champ"},
"Kentucky":{s:7,r:"MW",rec:"21-13",c:"SEC",off:72,def:68,exp:68,mom:58,sos:84,reb:72,to:60,three:62,ft:68,bench:68,tempo:70,style:"inside",defStyle:"man",clutch:55,starPIR:60,star:"",starLine:"",inj:"",coach:"Mark Pope",vegasOdds:"+5000",vegasImpl:2.0,note:"No true PG, bully-ball, inconsistent, 21-13 rough for UK"},
"Santa Clara":{s:10,r:"MW",rec:"26-8",c:"WCC",off:72,def:66,exp:72,mom:76,sos:50,reb:64,to:70,three:74,ft:76,bench:70,tempo:70,style:"perimeter",defStyle:"man",clutch:70,starPIR:58,star:"",starLine:"",inj:"",coach:"Herb Sendek",vegasOdds:"+10000",vegasImpl:1.0,note:"23rd offense, 9 deep, real UK threat"},
"Iowa State":{s:2,r:"MW",rec:"27-7",c:"Big 12",off:84,def:90,exp:82,mom:78,sos:86,reb:80,to:82,three:68,ft:78,bench:80,tempo:62,style:"inside",defStyle:"press",clutch:82,starPIR:82,star:"Joshua Jefferson",starLine:"16.9p/7.6r/4.9a - highest big-man ast%",inj:"",coach:"T.J. Otzelberger",vegasOdds:"+1500",vegasImpl:6.3,note:"4th-best D nationally. Jefferson is a unicorn stat-stuffer."},
"Tenn. State":{s:15,r:"MW",rec:"23-9",c:"OVC",off:44,def:40,exp:54,mom:65,sos:16,reb:42,to:54,three:58,ft:68,bench:48,tempo:74,style:"fastbreak",defStyle:"man",clutch:50,starPIR:25,star:"",starLine:"",inj:"",coach:"",vegasOdds:"",vegasImpl:0.1,note:"First appearance since 1994"},
};

const RG={E:"East",W:"West",S:"South",MW:"Midwest"};
const RC={E:"#1493ff",W:"#2fbd60",S:"#e5453d",MW:"#f5a623"};
const MO={
E:[["Duke","Siena"],["Ohio State","TCU"],["St. John's","N. Iowa"],["Kansas","Cal Baptist"],["Louisville","S. Florida"],["Michigan St","N. Dakota St"],["UCLA","UCF"],["UConn","Furman"]],
W:[["Arizona","LIU"],["Villanova","Utah State"],["Wisconsin","High Point"],["Arkansas","Hawaii"],["BYU","NC State"],["Gonzaga","Kennesaw St"],["Miami FL","Missouri"],["Purdue","Queens NC"]],
S:[["Florida","Lehigh"],["Clemson","Iowa"],["Vanderbilt","McNeese"],["Nebraska","Troy"],["UNC","VCU"],["Illinois","Penn"],["Saint Mary's","Texas A&M"],["Houston","Idaho"]],
MW:[["Michigan","Howard"],["Georgia","Saint Louis"],["Texas Tech","Akron"],["Alabama","Hofstra"],["Tennessee","Miami OH"],["Virginia","Wright St"],["Kentucky","Santa Clara"],["Iowa State","Tenn. State"]],
};

/* Conference Power Index — historical tourney performance */
const CONF_PI={
"SEC":{teams:10,histFF:48,histChamp:12,overSeed:0.92,avgSeedPerf:1.08,note:"Deepest conf ever with 10 bids"},
"Big Ten":{teams:9,histFF:42,histChamp:8,overSeed:0.95,avgSeedPerf:1.05,note:"9 teams, historically performs to seed"},
"ACC":{teams:8,histFF:65,histChamp:18,overSeed:1.02,avgSeedPerf:0.98,note:"8 bids, Duke/UVA carry, depth is soft"},
"Big 12":{teams:8,histFF:28,histChamp:5,overSeed:0.88,avgSeedPerf:1.12,note:"Most under-seeded conf, grinders"},
"Big East":{teams:3,histFF:38,histChamp:10,overSeed:1.05,avgSeedPerf:0.95,note:"Only 3 bids but UConn & SJU are loaded"},
"WCC":{teams:3,histFF:8,histChamp:0,overSeed:1.15,avgSeedPerf:0.88,note:"Gonzaga/SMC carry, SOS concerns persist"},
"A-10":{teams:2,histFF:6,histChamp:0,overSeed:1.10,avgSeedPerf:0.92,note:"SLU & VCU both underseeded"},
"MAC":{teams:2,histFF:1,histChamp:0,overSeed:1.20,avgSeedPerf:0.85,note:"Miami OH at 31-1 is an anomaly"},
"MVC":{teams:1,histFF:5,histChamp:0,overSeed:0.95,avgSeedPerf:1.02,note:"Classic Cinderella factory"},
"MWC":{teams:1,histFF:3,histChamp:0,overSeed:0.98,avgSeedPerf:1.0,note:"Utah State as 9 is about right"},
};

function getPower(n,boosts){const t=T[n];if(!t)return 0;const b=boosts?.[n]||0;return t.off*0.20+t.def*0.20+t.sos*0.14+t.mom*0.09+t.exp*0.07+t.reb*0.08+t.to*0.05+t.three*0.04+t.bench*0.04+t.clutch*0.05+t.starPIR*0.04+b;}
function getWP(a,b,boosts){const d=getPower(a,boosts)-getPower(b,boosts);return Math.min(0.98,Math.max(0.02,1/(1+Math.pow(10,-d/22))));}

function getStyleClash(a,b){
  const ta=T[a],tb=T[b];if(!ta||!tb)return null;
  const tempoGap=Math.abs(ta.tempo-tb.tempo);
  const fastTeam=ta.tempo>tb.tempo?a:b;
  const slowTeam=ta.tempo>tb.tempo?b:a;
  let tempoEdge=tempoGap>15?`${slowTeam}'s slow pace could frustrate ${fastTeam}'s rhythm`:tempoGap>8?"Moderate tempo mismatch — slight edge to the team that controls pace":"Similar pace — no major tempo advantage either way";
  const styleMatch=ta.style===tb.style?"Mirror match — same offensive identity":`${a} plays ${ta.style} vs ${b}'s ${tb.style} attack`;
  const defMatch=`${a} runs ${ta.defStyle} D vs ${b}'s ${tb.defStyle}`;
  const insideA=ta.style==="inside"||ta.style==="balanced"?ta.reb:ta.reb*0.7;
  const insideB=tb.style==="inside"||tb.style==="balanced"?tb.reb:tb.reb*0.7;
  const rebEdge=insideA>insideB+10?`${a} dominates the boards`:insideB>insideA+10?`${b} dominates the boards`:"Even on the glass";
  return{tempoGap,tempoEdge,styleMatch,defMatch,rebEdge,fastTeam,slowTeam};
}

function runMC(n=5000,boosts=null){
  const ch={},f4c={},s16c={};
  Object.keys(T).forEach(t=>{ch[t]=0;f4c[t]=0;s16c[t]=0;});
  for(let i=0;i<n;i++){
    const f4=[];
    Object.entries(MO).forEach(([rk,ms])=>{
      let r1=ms.map(([a,b])=>Math.random()<getWP(a,b,boosts)?a:b);
      let r2=[];for(let j=0;j<r1.length;j+=2)r2.push(Math.random()<getWP(r1[j],r1[j+1],boosts)?r1[j]:r1[j+1]);
      r2.forEach(t=>s16c[t]++);
      let s16=[];for(let j=0;j<r2.length;j+=2)s16.push(Math.random()<getWP(r2[j],r2[j+1],boosts)?r2[j]:r2[j+1]);
      const e8w=Math.random()<getWP(s16[0],s16[1],boosts)?s16[0]:s16[1];
      f4c[e8w]++;f4.push(e8w);
    });
    const s1=Math.random()<getWP(f4[0],f4[3],boosts)?f4[0]:f4[3];
    const s2=Math.random()<getWP(f4[1],f4[2],boosts)?f4[1]:f4[2];
    ch[Math.random()<getWP(s1,s2,boosts)?s1:s2]++;
  }
  return{ch,f4:f4c,s16:s16c,n};
}

/* ─── SMART ADAPTATION ENGINE ─── */
// Compute performance boosts from tournament results
function computeBoosts(margins){
  // margins = {teamName: {wins:[], losses:[]}} where each entry is margin of victory
  const boosts={};
  Object.entries(margins).forEach(([team,data])=>{
    let boost=0;
    // Blowout wins get big momentum boost
    data.wins.forEach(margin=>{
      if(margin>=20)boost+=4;       // Dominant win
      else if(margin>=12)boost+=2.5; // Comfortable
      else if(margin>=6)boost+=1;    // Solid
      else boost-=0.5;              // Barely survived — red flag
    });
    // Losses kill momentum
    data.losses.forEach(margin=>{
      boost-=5; // Eliminated teams don't matter, but this tracks
    });
    // Surviving close games can mean clutch
    const closeWins=data.wins.filter(m=>m<=4);
    if(closeWins.length>=2)boost+=1; // Battle-tested
    boosts[team]=boost;
  });
  return boosts;
}

// Detect championship path danger
function detectPathDanger(brackets,results,boosts){
  const alerts=[];
  brackets.forEach((bracket,bi)=>{
    // Find championship pick
    const champPicks=[];
    Object.keys(RG).forEach(rk=>{
      const e8Pick=bracket.picks[`${rk}-3-0`];
      if(e8Pick)champPicks.push({team:e8Pick,region:rk,bracketName:bracket.name});
    });
    
    champPicks.forEach(({team,region,bracketName})=>{
      // Is this team still alive?
      const eliminated=Object.entries(results).some(([key,winner])=>{
        // Check if this team lost
        const [rk,rd,gi]=key.split("-");
        if(rk!==region)return false;
        // Find who they played
        if(parseInt(rd)===0){
          const [a,b]=MO[rk][parseInt(gi)];
          return(a===team||b===team)&&winner!==team;
        }
        return false; // Simplified — full check would trace all rounds
      });
      
      if(eliminated){
        alerts.push({type:"eliminated",severity:"critical",bracket:bracketName,team,
          msg:`${team} has been eliminated. Your ${bracketName} bracket's ${RG[region]} pick is busted.`});
        return;
      }
      
      // Check next opponent matchup quality
      Object.entries(MO[region]).forEach(([_,pair])=>{
        // Find potential upcoming opponents
      });
      
      // Check if a dangerous team is in their path
      const dangerTeams=Object.keys(T).filter(t=>T[t].r===region&&t!==team&&getPower(t,boosts)>=getPower(team,boosts)-3);
      dangerTeams.forEach(dt=>{
        const clash=getStyleClash(team,dt);
        const wp=getWP(team,dt,boosts);
        if(wp<0.55){
          const t2=T[dt];
          let reason="";
          if(T[team].inj)reason=`${team}'s injury (${T[team].inj}) makes this matchup worse.`;
          else if(clash&&clash.tempoGap>12)reason=`${dt}'s tempo is a bad stylistic matchup.`;
          else if(T[dt].def>T[team].off)reason=`${dt}'s defense (${T[dt].def}) can neutralize ${team}'s offense.`;
          else reason=`${dt} has a ${Math.round((1-wp)*100)}% chance of beating ${team}.`;
          alerts.push({type:"danger",severity:wp<0.48?"high":"medium",bracket:bracketName,team,
            opponent:dt,wp:Math.round(wp*100),
            msg:`${bracketName}: Your ${RG[region]} pick ${team} could face (${t2.s}) ${dt}. ${reason}`});
        }
      });
    });
  });
  
  // Sort by severity
  alerts.sort((a,b)=>{const sev={critical:0,high:1,medium:2};return(sev[a.severity]||3)-(sev[b.severity]||3);});
  return alerts;
}

// Detect title odds shifts after results
function getOddsShift(prevSim,newSim){
  if(!prevSim||!newSim)return[];
  const shifts=[];
  Object.entries(newSim.ch).forEach(([team,count])=>{
    const newPct=count/newSim.n*100;
    const oldCount=prevSim.ch[team]||0;
    const oldPct=oldCount/prevSim.n*100;
    const delta=newPct-oldPct;
    if(Math.abs(delta)>=0.5){
      shifts.push({team,newPct:+newPct.toFixed(1),oldPct:+oldPct.toFixed(1),delta:+delta.toFixed(1),direction:delta>0?"up":"down"});
    }
  });
  shifts.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
  return shifts.slice(0,10);
}

/* ─── AUTO-BRACKET GENERATOR ─── */
function generateBracket(mode="chalk"){
  // mode: "chalk" (always pick favorite), "balanced" (pick some upsets), "chaos" (heavy upsets)
  const upsetThresh=mode==="chalk"?0.0:mode==="balanced"?0.35:0.55;
  const picks={};
  Object.entries(MO).forEach(([rk,matchups])=>{
    // R64
    const r1=matchups.map(([a,b],i)=>{
      const wp=getWP(a,b);const fav=wp>=0.5?a:b;const dog=wp>=0.5?b:a;
      const upProb=1-Math.max(wp,1-wp);
      // In balanced/chaos, pick upsets where underdog has a real shot
      let pick=fav;
      if(mode==="balanced"&&upProb>=0.30&&upProb<0.48&&T[dog].s>=9&&T[dog].s<=12)pick=dog;
      if(mode==="balanced"&&upProb>=0.38&&T[dog].s>=10)pick=dog;
      if(mode==="chaos"&&upProb>=0.22)pick=dog;
      if(mode==="chaos"&&upProb>=0.35)pick=dog;
      // Use specific upset intelligence
      if(mode!=="chalk"){
        if(dog==="VCU"&&T["UNC"].inj)pick=dog; // VCU over injured UNC
        if(dog==="Akron"&&T["Texas Tech"].inj?.includes("Toppin"))pick=dog;
        if(dog==="S. Florida"&&T["Louisville"].inj)pick=dog;
        if(dog==="Miami OH"&&T["Miami OH"].rec==="31-1"&&mode==="chaos")pick=dog;
        if(dog==="High Point"&&mode==="chaos")pick=dog;
        if(dog==="Saint Louis"&&T["Saint Louis"].rec==="28-5")pick=dog; // SLU underseeded
        if(dog==="Santa Clara"&&T["Santa Clara"].off>=70&&mode!=="chalk")pick=dog;
      }
      picks[`${rk}-0-${i}`]=pick;
      return pick;
    });
    // R32
    const r2=[];
    for(let i=0;i<r1.length;i+=2){
      const wp=getWP(r1[i],r1[i+1]);const fav=wp>=0.5?r1[i]:r1[i+1];const dog=wp>=0.5?r1[i+1]:r1[i];
      const upProb=1-Math.max(wp,1-wp);
      let pick=fav;
      if(mode==="balanced"&&upProb>=0.38)pick=dog;
      if(mode==="chaos"&&upProb>=0.28)pick=dog;
      picks[`${rk}-1-${Math.floor(i/2)}`]=pick;
      r2.push(pick);
    }
    // S16
    const s16=[];
    for(let i=0;i<r2.length;i+=2){
      const wp=getWP(r2[i],r2[i+1]);const fav=wp>=0.5?r2[i]:r2[i+1];const dog=wp>=0.5?r2[i+1]:r2[i];
      const upProb=1-Math.max(wp,1-wp);
      let pick=fav;
      if(mode==="chaos"&&upProb>=0.35)pick=dog;
      picks[`${rk}-2-${Math.floor(i/2)}`]=pick;
      s16.push(pick);
    }
    // E8
    const wp=getWP(s16[0],s16[1]);const fav=wp>=0.5?s16[0]:s16[1];const dog=wp>=0.5?s16[1]:s16[0];
    let pick=fav;
    if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.38)pick=dog;
    picks[`${rk}-3-0`]=pick;
  });
  return picks;
}

/* ─── GAME PREDICTION ENGINE ─── */
function getGamePrediction(a,b){
  const ta=T[a],tb=T[b];if(!ta||!tb)return null;
  const wp=getWP(a,b);
  const winner=wp>=0.5?a:b;const loser=wp>=0.5?b:a;
  const winPct=Math.round(Math.max(wp,1-wp)*100);
  const conf=winPct>=85?"LOCK":winPct>=72?"STRONG":winPct>=58?"LEAN":"TOSS-UP";
  const confColor=conf==="LOCK"?"var(--green)":conf==="STRONG"?"#4a9eff":conf==="LEAN"?"#d4a853":"var(--red)";
  
  // Generate reasoning
  const reasons=[];
  const tw=T[winner],tl=T[loser];
  
  if(tw.off-tl.def>=15)reasons.push(`${winner}'s offense (${tw.off}) badly outclasses ${loser}'s defense (${tl.def})`);
  else if(tw.off-tl.def>=8)reasons.push(`${winner} has a clear offensive edge over ${loser}'s D`);
  
  if(tw.reb-tl.reb>=12)reasons.push(`${winner} dominates the boards (${tw.reb} vs ${tl.reb})`);
  
  if(tw.sos-tl.sos>=25)reasons.push(`Massive strength-of-schedule gap (${tw.sos} vs ${tl.sos})`);
  else if(tw.sos-tl.sos>=15)reasons.push(`${winner}'s tougher schedule matters here`);
  
  if(tw.clutch>=80&&tl.clutch<65)reasons.push(`${winner} is far more reliable in clutch situations`);
  
  if(tw.starPIR-tl.starPIR>=20&&tw.star)reasons.push(`Star edge: ${tw.star} (PIR ${tw.starPIR}) can take over`);
  
  if(tl.inj)reasons.push(`${loser} injury concern: ${tl.inj}`);
  
  if(tw.exp>=80&&tl.exp<65)reasons.push(`${winner}'s tournament experience is a real factor`);
  
  if(tw.mom-tl.mom>=15)reasons.push(`${winner} enters with much better momentum`);
  
  // Style clash factor
  const tempoGap=Math.abs(ta.tempo-tb.tempo);
  if(tempoGap>=15)reasons.push(`Big tempo mismatch (${ta.tempo>tb.tempo?a:b} wants to push, ${ta.tempo>tb.tempo?b:a} wants to slow down)`);
  
  // Upset factor
  let upsetAngle="";
  if(winner!==a&&T[a].s<T[b].s){
    upsetAngle=`Despite the seeding, ${winner}'s ratings are actually superior across the board.`;
  }else if(conf==="TOSS-UP"||conf==="LEAN"){
    const ud=wp>=0.5?b:a;
    if(T[ud].mom>=75)upsetAngle=`${ud} is peaking at the right time and could pull the upset.`;
    if(T[ud].clutch>=72)upsetAngle=`${ud}'s clutch rating (${T[ud].clutch}) makes them dangerous in a close game.`;
    if(T[ud].inj===""&&T[winner].inj)upsetAngle=`${winner}'s injury issues (${T[winner].inj}) level this playing field considerably.`;
  }
  
  if(reasons.length===0)reasons.push(`${winner} is the stronger team across composite ratings`);
  
  return{winner,loser,winPct,conf,confColor,reasons:reasons.slice(0,4),upsetAngle,wp,
    seedA:ta.s,seedB:tb.s,regA:ta.r,regB:tb.r};
}

function getBracketScore(picks){
  if(!picks||Object.keys(picks).length<10)return null;
  let chalk=0,total=0,upsets=0;
  Object.entries(picks).forEach(([key,val])=>{
    const t=T[val];if(!t)return;total++;
    const parts=key.split("-");const round=parseInt(parts[1]);
    if(round===0){
      const rk=parts[0];const pi=parseInt(parts[2]);
      const [a,b]=MO[rk][pi];
      const fav=T[a].s<T[b].s?a:b;
      if(val===fav)chalk++;else upsets++;
    }
  });
  const chalkPct=total>0?chalk/total:0;
  const profile=chalkPct>=0.85?"CHALK":chalkPct>=0.65?"BALANCED":chalkPct>=0.45?"CONTRARIAN":"CHAOS";
  const colors={CHALK:"#4a9eff",BALANCED:"var(--green)",CONTRARIAN:"#d4a853",CHAOS:"var(--red)"};
  return{chalk,upsets,total,chalkPct,profile,color:colors[profile]};
}

const CSS=`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
:root{
  --bg:#0e1118;--s:#171b26;--s2:#1d2230;--s3:#252a3a;--s4:#2c3348;
  --b:rgba(255,255,255,0.06);--b2:rgba(255,255,255,0.10);
  --t:#ffffff;--t2:#c5cdd8;--m:rgba(255,255,255,0.45);--d:rgba(255,255,255,0.18);
  --acc:#1493ff;--acc2:#0f7ee0;--green:var(--green);--green2:#25a050;
  --red:var(--red);--orange:var(--orange);--yellow:#ffd23f;
  --r:10px;--mw:840px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--t);-webkit-font-smoothing:antialiased}
@keyframes fadeUp{from{opacity:0;transform:translateY(5px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes liveDot{0%,100%{box-shadow:0 0 3px var(--green),0 0 6px var(--green);transform:scale(1);opacity:1}50%{box-shadow:0 0 10px var(--green),0 0 25px var(--green),0 0 40px rgba(47,189,96,0.3);transform:scale(1.3);opacity:0.85}}
@keyframes liveGlow{0%,100%{box-shadow:0 0 2px rgba(47,189,96,0.1);border-color:rgba(47,189,96,0.15);background:rgba(47,189,96,0.06)}50%{box-shadow:0 0 15px rgba(47,189,96,0.25),0 0 30px rgba(47,189,96,0.1);border-color:rgba(47,189,96,0.5);background:rgba(47,189,96,0.12)}}
@keyframes liveText{0%,100%{text-shadow:0 0 4px rgba(47,189,96,0.3)}50%{text-shadow:0 0 12px rgba(47,189,96,0.6),0 0 20px rgba(47,189,96,0.3)}}
.fu{animation:fadeUp 0.2s ease both}
.gl{background:var(--s);border:1px solid var(--b);border-radius:var(--r)}
.mn{font-family:'IBM Plex Mono',monospace;letter-spacing:0}
select,button,input{font-family:'DM Sans',sans-serif}
.wrap{max-width:var(--mw);margin:0 auto;padding:0 16px}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:3px}
::selection{background:rgba(20,147,255,0.3)}
.pill{display:inline-flex;align-items:center;padding:3px 8px;border-radius:4px;font-size:9px;font-weight:700;letter-spacing:0.5px}
.tag{display:inline-block;padding:2px 7px;border-radius:3px;font-size:8px;font-weight:700;letter-spacing:0.3px}
`;

export default function App(){
  const [tab,setTab]=useState("brief");
  const [reg,setReg]=useState("E");
  const [sim,setSim]=useState(null);
  const [bIdx,setBIdx]=useState(0);
  const [brackets,setBrackets]=useState([{name:"Chalk",picks:{}},{name:"Balanced",picks:{}},{name:"Upset Heavy",picks:{}}]);
  const [cmpA,setCmpA]=useState("Duke");
  const [cmpB,setCmpB]=useState("Arizona");
  const [aiRes,setAiRes]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [selTeam,setSelTeam]=useState(null);
  const [tracker,setTracker]=useState({});
  const [predReg,setPredReg]=useState("ALL");
  const [results,setResults]=useState({});
  const [fetchLoading,setFetchLoading]=useState(false);
  const [fetchMsg,setFetchMsg]=useState("");
  const [trkRound,setTrkRound]=useState(0);
  const [nextRoundPreds,setNextRoundPreds]=useState(null);
  const [briefing,setBriefing]=useState(null);
  const [briefLoading,setBriefLoading]=useState(false);
  const [autoRan,setAutoRan]=useState(false);
  const [margins,setMargins]=useState({}); // {teamName: {wins:[margins], losses:[margins]}}
  const [boosts,setBoosts]=useState({});
  const [prevSim,setPrevSim]=useState(null);
  const [oddsShifts,setOddsShifts]=useState([]);
  const [pathAlerts,setPathAlerts]=useState([]);

  useEffect(()=>{
    (()=>{try{const v=localStorage.getItem("mm26-br");if(v)setBrackets(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-sim");if(v)setSim(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-trk");if(v)setTracker(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-res");if(v)setResults(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-brief");if(v){const d=JSON.parse(v);if(Date.now()-d.ts<1800000)setBriefing(d);}}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-margins");if(v)setMargins(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-boosts");if(v)setBoosts(JSON.parse(v));}catch(e){}})();
  },[]);

  const saveResults=useCallback(async(r)=>{setResults(r);try{localStorage.setItem("mm26-res",JSON.stringify(r));}catch(e){}},[]);

  // Auto-pilot briefing generator
  const generateBriefing=useCallback(async()=>{
    setBriefLoading(true);
    const numResults=Object.keys(results).length;
    const bracketSummary=brackets.map(b=>{
      let cor=0,wrg=0,pts=0;const rp={0:10,1:20,2:40,3:80,4:160,5:320};
      Object.entries(b.picks).forEach(([k,pk])=>{const rd=parseInt(k.split("-")[1]);if(results[k]){if(results[k]===pk){cor++;pts+=(rp[rd]||10);}else wrg++;}});
      const champs=Object.keys(RG).map(rk=>b.picks[`${rk}-3-0`]||"TBD");
      return`${b.name}: ${pts}pts, ${cor}/${cor+wrg} correct, Final Four: ${champs.join(", ")}`;
    }).join("\n");
    
    const topUpsets=Object.entries(MO).flatMap(([rk,ms])=>ms.map(([a,b])=>{
      const p=getWP(a,b);const up=1-p;
      if(up<0.28||T[b].s<=8)return null;
      return{fav:a,dog:b,pct:Math.round(up*100),reg:RG[rk]};
    }).filter(Boolean)).sort((a,b)=>b.pct-a.pct).slice(0,5);
    
    const injuries=Object.entries(T).filter(([,t])=>t.inj).map(([n,t])=>`${n} (${t.s}-seed): ${t.inj}`).join(", ");
    
    // Smart adaptation data
    const boostSummary=Object.entries(boosts).filter(([,v])=>Math.abs(v)>=1).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([t,v])=>`${t}: ${v>0?"+":""}${v.toFixed(1)}`).join(", ");
    const pathAlertSummary=pathAlerts.slice(0,5).map(a=>a.msg).join(" | ");
    const shiftSummary=oddsShifts.slice(0,5).map(s=>`${s.team}: ${s.oldPct}% -> ${s.newPct}% (${s.delta>0?"+":""}${s.delta})`).join(", ");
    
    const prompt=`You are an elite NCAA tournament analyst providing a daily briefing. Search the web for the latest 2026 NCAA Men's Tournament news, scores, and updates.

Current state: ${numResults} games completed out of 63.
${numResults===0?"Tournament starts with First Four on March 17, first round March 19-20.":""}

User's 3 brackets:
${bracketSummary}

Key injuries: ${injuries}

Top model upset picks: ${topUpsets.map(u=>`${u.dog} ${u.pct}% over ${u.fav} (${u.reg})`).join(", ")}

${boostSummary?"LIVE PERFORMANCE ADJUSTMENTS (teams getting boosted/dinged based on tournament performance): "+boostSummary:""}

${pathAlertSummary?"PATH DANGER ALERTS detected by our model: "+pathAlertSummary:""}

${shiftSummary?"TITLE ODDS SHIFTS since last simulation: "+shiftSummary:""}

Respond ONLY with JSON (no backticks):
{
  "headline": "One bold sentence summarizing the tournament state right now",
  "status": "pre_tournament" or "round_of_64" or "round_of_32" or "sweet_16" or "elite_8" or "final_four" or "complete",
  "key_news": ["3-5 bullet points of the most important things happening right now"],
  "bracket_analysis": "2-3 sentences analyzing the user's 3 brackets - which is performing best, which picks are in danger",
  "todays_games": ["List upcoming games today/tomorrow with brief prediction, or recent results"],
  "danger_alerts": ["1-3 specific proactive warnings about bracket picks in trouble, like: Your title pick X plays Y next round. Y's defense is the worst matchup for X's weakened backcourt. Consider hedging."],
  "performance_flags": ["1-3 notes about teams that looked dominant or vulnerable based on how they've played so far, like: Vanderbilt just won as a 5-seed and looked like the best team on the court. They're now the most undervalued team remaining."],
  "odds_movement": ["1-3 notes about which teams' title odds have shifted most and why"],
  "hot_takes": ["2-3 bold predictions or insights most people are missing"],
  "recommended_action": "One specific thing the user should do right now with their brackets"
}`;
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1500,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:prompt}]})});
      const d=await res.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
      const clean=txt.replace(/```json|```/g,"").trim();
      const data={...JSON.parse(clean),ts:Date.now()};
      setBriefing(data);
      try{localStorage.setItem("mm26-brief",JSON.stringify(data));}catch(e){}
    }catch(e){
      setBriefing({headline:"Unable to fetch live briefing. Showing cached analysis.",status:"unknown",
        key_news:["AI briefing unavailable — check your API connection","Tournament bracket and predictions are still fully functional","Use the TRACKER tab to manually enter scores"],
        bracket_analysis:"Generate brackets in the AUTO-GEN tab to get started.",todays_games:[],danger_alerts:[],hot_takes:[],
        recommended_action:"Run a simulation in the SIMULATE tab to see championship probabilities.",ts:Date.now()});
    }
    setBriefLoading(false);
  },[results,brackets]);

  // Auto-run briefing on first load (once)
  useEffect(()=>{
    if(!autoRan&&!briefing&&!briefLoading){
      setAutoRan(true);
      // Small delay to let state hydrate from localStorage
      const timer=setTimeout(()=>generateBriefing(),800);
      return()=>clearTimeout(timer);
    }
  },[autoRan,briefing,briefLoading,generateBriefing]);

  // Mark a game result with optional margin — triggers smart adaptation
  const markResult=useCallback((key,winner,margin=null)=>{
    const nr={...results,[key]:winner};saveResults(nr);
    
    // Update margins if provided
    if(margin!==null){
      const [rk,rd,gi]=key.split("-");
      // Determine loser
      let loser=null;
      if(parseInt(rd)===0){
        const [a,b]=MO[rk][parseInt(gi)];
        loser=a===winner?b:a;
      }
      if(loser){
        const nm={...margins};
        if(!nm[winner])nm[winner]={wins:[],losses:[]};
        if(!nm[loser])nm[loser]={wins:[],losses:[]};
        nm[winner].wins.push(margin);
        nm[loser].losses.push(margin);
        setMargins(nm);
        try{localStorage.setItem("mm26-margins",JSON.stringify(nm));}catch(e){}
        
        // Recompute boosts
        const newBoosts=computeBoosts(nm);
        setBoosts(newBoosts);
        try{localStorage.setItem("mm26-boosts",JSON.stringify(newBoosts));}catch(e){}
        
        // Auto re-run simulation with new boosts
        const oldSim=sim;
        setPrevSim(oldSim);
        const newSim=runMC(5000,newBoosts);
        setSim(newSim);
        try{localStorage.setItem("mm26-sim",JSON.stringify(newSim));}catch(e){}
        
        // Compute odds shifts
        if(oldSim){
          const shifts=getOddsShift(oldSim,newSim);
          setOddsShifts(shifts);
        }
      }
    }
    
    // Detect path danger for all brackets
    const alerts=detectPathDanger(brackets,nr,boosts);
    setPathAlerts(alerts);
  },[results,saveResults,margins,sim,brackets,boosts]);

  // Score a bracket against results
  const scoreBracket=useCallback((picks)=>{
    let correct=0,wrong=0,pending=0,pts=0;
    const roundPts={0:10,1:20,2:40,3:80,4:160,5:320};
    Object.entries(picks).forEach(([key,pick])=>{
      const rd=parseInt(key.split("-")[1]);
      if(results[key]){
        if(results[key]===pick){correct++;pts+=(roundPts[rd]||10);}
        else wrong++;
      }else pending++;
    });
    return{correct,wrong,pending,pts};
  },[results]);

  // Get all game keys for a round
  const getGamesForRound=useCallback((round)=>{
    const games=[];
    const pairsPerRound={0:8,1:4,2:2,3:1};
    Object.keys(RG).forEach(rk=>{
      for(let i=0;i<(pairsPerRound[round]||0);i++){
        const key=`${rk}-${round}-${i}`;
        // Get teams for this game
        if(round===0){
          const [a,b]=MO[rk][i];
          games.push({key,a,b,region:rk});
        }else{
          // Teams come from prior round results
          const prevA=results[`${rk}-${round-1}-${i*2}`];
          const prevB=results[`${rk}-${round-1}-${i*2+1}`];
          if(prevA&&prevB)games.push({key,a:prevA,b:prevB,region:rk});
        }
      }
    });
    return games;
  },[results]);

  // Generate predictions for next round based on results
  const genNextRound=useCallback((round)=>{
    const games=getGamesForRound(round);
    return games.map(g=>{
      const pred=getGamePrediction(g.a,g.b);
      return{...g,...pred};
    }).filter(g=>g.winner);
  },[getGamesForRound]);

  // Web search powered update
  const fetchLatest=useCallback(async()=>{
    setFetchLoading(true);setFetchMsg("Searching for latest scores & injuries...");
    const roundNames=["First Round","Second Round","Sweet 16","Elite Eight","Final Four","Championship"];
    const prompt=`You are a sports data assistant. Search for the latest 2026 NCAA Men's Basketball Tournament results and injury updates.

I need:
1. All completed game results so far (winner of each matchup with seeds)
2. Any new injury reports since the tournament started
3. Any notable upsets or surprises

The bracket matchups are:
EAST: (1)Duke vs (16)Siena, (8)Ohio State vs (9)TCU, (5)St. John's vs (12)N. Iowa, (4)Kansas vs (13)Cal Baptist, (6)Louisville vs (11)S. Florida, (3)Michigan St vs (14)N. Dakota St, (7)UCLA vs (10)UCF, (2)UConn vs (15)Furman
WEST: (1)Arizona vs (16)LIU, (8)Villanova vs (9)Utah State, (5)Wisconsin vs (12)High Point, (4)Arkansas vs (13)Hawaii, (6)BYU vs (11)NC State, (3)Gonzaga vs (14)Kennesaw St, (7)Miami FL vs (10)Missouri, (2)Purdue vs (15)Queens NC
SOUTH: (1)Florida vs (16)Lehigh, (8)Clemson vs (9)Iowa, (5)Vanderbilt vs (12)McNeese, (4)Nebraska vs (13)Troy, (6)UNC vs (11)VCU, (3)Illinois vs (14)Penn, (7)Saint Mary's vs (10)Texas A&M, (2)Houston vs (15)Idaho
MIDWEST: (1)Michigan vs (16)Howard, (8)Georgia vs (9)Saint Louis, (5)Texas Tech vs (12)Akron, (4)Alabama vs (13)Hofstra, (6)Tennessee vs (11)Miami OH, (3)Virginia vs (14)Wright St, (7)Kentucky vs (10)Santa Clara, (2)Iowa State vs (15)Tenn. State

Respond ONLY with JSON (no backticks):
{
  "status": "pre_tournament" or "in_progress" or "completed",
  "current_round": "First Four" or "First Round" or "Second Round" etc,
  "completed_games": [{"region":"E/W/S/MW","round":0,"game_index":0,"winner":"Team Name"}],
  "injuries": [{"team":"Team","player":"Name","status":"OUT/GTD/UPDATE","note":"details"}],
  "upsets": ["brief description"],
  "last_updated": "description of recency"
}
If the tournament hasn't started yet, return status "pre_tournament" with empty arrays.`;

    try{
      const res=await fetch("/api/claude",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:2000,
          tools:[{type:"web_search_20250305",name:"web_search"}],
          messages:[{role:"user",content:prompt}]
        })
      });
      const d=await res.json();
      const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
      const clean=txt.replace(/```json|```/g,"").trim();
      try{
        const data=JSON.parse(clean);
        setFetchMsg(`Status: ${data.status} | ${data.last_updated||"Updated just now"}`);
        // Auto-import results
        if(data.completed_games&&data.completed_games.length>0){
          const nr={...results};
          data.completed_games.forEach(g=>{
            const key=`${g.region}-${g.round}-${g.game_index}`;
            if(g.winner)nr[key]=g.winner;
          });
          saveResults(nr);
          setFetchMsg(`Imported ${data.completed_games.length} results | ${data.upsets?.length||0} upsets | ${data.injuries?.length||0} injury updates`);
        }else if(data.status==="pre_tournament"){
          setFetchMsg("Tournament hasn't started yet. First Four tips off March 17.");
        }
      }catch(pe){
        setFetchMsg("Got response but couldn't parse structured data. Check the raw output.");
      }
    }catch(e){
      setFetchMsg("Couldn't reach the search API. You can enter results manually below.");
    }
    setFetchLoading(false);
  },[results,saveResults]);

  const save=useCallback(async(br)=>{setBrackets(br);try{localStorage.setItem("mm26-br",JSON.stringify(br));}catch(e){}},[]);
  const pick=useCallback((key,team)=>{
    const nb=[...brackets];const p={...nb[bIdx].picks,[key]:team};
    // Clear downstream
    const [rk,rs,ps]=key.split("-");const rd=parseInt(rs),pi=parseInt(ps);
    for(let r=rd+1;r<=3;r++){const dk=`${rk}-${r}-${Math.floor(pi/Math.pow(2,r-rd))}`;delete p[dk];}
    nb[bIdx]={...nb[bIdx],picks:p};save(nb);
  },[brackets,bIdx,save]);

  const doSim=useCallback((n=10000)=>{const old=sim;setPrevSim(old);const d=runMC(n,boosts);setSim(d);try{localStorage.setItem("mm26-sim",JSON.stringify(d));}catch(e){} if(old){setOddsShifts(getOddsShift(old,d));}},[boosts,sim]);
  const simR=useMemo(()=>{if(!sim)return null;return{ch:Object.entries(sim.ch).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,25),f4:Object.entries(sim.f4).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,16),s16:Object.entries(sim.s16).filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,20),n:sim.n};},[sim]);

  const bScore=useMemo(()=>getBracketScore(brackets[bIdx]?.picks),[brackets,bIdx]);
  const allNames=useMemo(()=>Object.keys(T).sort((a,b)=>T[a].s-T[b].s),[]);

  const getAdv=(rk,ri)=>{
    const base=MO[rk].flat();if(ri===0)return base;
    const prev=getAdv(rk,ri-1);const res=[];
    for(let i=0;i<prev.length;i+=2){const k=`${rk}-${ri-1}-${Math.floor(i/2)}`;res.push(brackets[bIdx].picks[k]||null);}
    return res;
  };

  const runAI=useCallback(async()=>{
    setAiLoading(true);setAiRes(null);
    const ta=T[cmpA],tb=T[cmpB];const clash=getStyleClash(cmpA,cmpB);
    const prompt=`You are an elite NCAA basketball analyst. Analyze this 2026 NCAA Tournament matchup:

${cmpA} (${ta.s}-seed, ${ta.rec}, ${ta.c}): OFF ${ta.off} DEF ${ta.def} SOS ${ta.sos} REB ${ta.reb} Tempo ${ta.tempo} Style: ${ta.style} offense, ${ta.defStyle} defense. Star: ${ta.star||"none"} ${ta.starLine}. ${ta.inj?"INJURY: "+ta.inj:""} Notes: ${ta.note}

${cmpB} (${tb.s}-seed, ${tb.rec}, ${tb.c}): OFF ${tb.off} DEF ${tb.def} SOS ${tb.sos} REB ${tb.reb} Tempo ${tb.tempo} Style: ${tb.style} offense, ${tb.defStyle} defense. Star: ${tb.star||"none"} ${tb.starLine}. ${tb.inj?"INJURY: "+tb.inj:""} Notes: ${tb.note}

Style clash: ${clash?.tempoEdge}. ${clash?.styleMatch}. ${clash?.rebEdge}.

Respond ONLY with JSON (no backticks): {"winner":"team name","winPct":number,"keyMatchup":"1 sentence","styleFactor":"1 sentence on how styles interact","starWatch":"1 sentence on star player impact","upsetRecipe":"1 sentence how underdog wins","injury_impact":"1 sentence if relevant or N/A","prediction":"bold 2 sentence prediction with score"}`;
    try{
      const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const d=await res.json();const txt=d.content?.find(b=>b.type==="text")?.text||"";
      setAiRes(JSON.parse(txt.replace(/```json|```/g,"").trim()));
    }catch(e){setAiRes({winner:cmpA,winPct:Math.round(getWP(cmpA,cmpB)*100),keyMatchup:"AI unavailable — using model ratings.",styleFactor:"N/A",starWatch:"N/A",upsetRecipe:"N/A",injury_impact:"N/A",prediction:`${cmpA} wins based on composite power.`});}
    setAiLoading(false);
  },[cmpA,cmpB]);

  // Betting value finder
  const bettingValues=useMemo(()=>{
    if(!simR)return[];
    return simR.ch.map(([name,count])=>{
      const t=T[name];const modelImpl=count/simR.n*100;const vegasImpl=t.vegasImpl||0;
      const edge=modelImpl-vegasImpl;
      return{name,seed:t.s,reg:t.r,modelPct:modelImpl,vegasPct:vegasImpl,vegasOdds:t.vegasOdds,edge,conf:t.c};
    }).filter(v=>v.vegasPct>0).sort((a,b)=>b.edge-a.edge);
  },[simR]);

  const TABS=[{id:"brief",l:"BRIEFING"},{id:"predict",l:"PICKS"},{id:"sim",l:"SIMULATE"},{id:"bracket",l:"BRACKET"},{id:"autogen",l:"AUTO-GEN"},{id:"value",l:"VALUE"},{id:"clash",l:"MATCHUPS"},{id:"players",l:"PLAYERS"},{id:"conf",l:"CONF"},{id:"tracker",l:"TRACKER"}];

  return(
    <div style={{background:"var(--bg)",minHeight:"100vh",fontFamily:"'DM Sans',sans-serif",color:"var(--t)"}}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{background:"var(--s)",borderBottom:"1px solid var(--b)"}}>
        <div className="wrap" style={{padding:"20px 24px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
            <div>
              <div style={{fontSize:24,fontWeight:800,letterSpacing:-0.4,color:"#fff"}}>March Madness</div>
              <div style={{fontSize:13,color:"var(--m)",marginTop:1,fontWeight:500}}>2026 NCAA Tournament Bracket Intelligence</div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 14px",borderRadius:8,background:"rgba(47,189,96,0.06)",border:"1px solid rgba(47,189,96,0.15)",animation:"liveGlow 1.8s ease-in-out infinite"}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:"var(--green)",boxShadow:"0 0 6px var(--green), 0 0 12px rgba(47,189,96,0.4)",animation:"liveDot 1.8s ease-in-out infinite"}}/>
              <span style={{fontSize:12,color:"var(--green)",fontWeight:700,letterSpacing:1,animation:"liveText 1.8s ease-in-out infinite"}}>LIVE</span>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"var(--bg)",borderBottom:"2px solid var(--b)",position:"sticky",top:0,zIndex:50}}>
        <div className="wrap" style={{display:"flex",overflowX:"auto",WebkitOverflowScrolling:"touch",gap:0,padding:"0 20px"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:"0 0 auto",padding:"12px 16px",fontSize:12,fontWeight:700,letterSpacing:0.6,
              background:"transparent",color:tab===t.id?"#fff":"var(--m)",
              borderBottom:tab===t.id?"2px solid var(--acc)":"2px solid transparent",
              border:"none",borderTop:"none",borderLeft:"none",borderRight:"none",
              cursor:"pointer",fontFamily:"'DM Sans'",whiteSpace:"nowrap",transition:"color 0.12s"
            }}>{t.l}</button>
          ))}
        </div>
      </div>

      {/* CONTENT */}
      <div className="wrap" style={{padding:"20px 20px 50px"}}>

      {/* ═══ AUTO-PILOT BRIEFING TAB ═══ */}
      {tab==="brief"&&(<div>
        {/* Loading state */}
        {briefLoading&&!briefing&&(
          <div style={{textAlign:"center",padding:"60px 20px"}}>
            <div style={{width:40,height:40,borderRadius:8,border:"3px solid var(--b)",borderTopColor:"var(--acc)",margin:"0 auto 16px",animation:"spin 0.8s linear infinite"}}/>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:4}}>Generating Briefing</div>
            <div style={{fontSize:13,color:"var(--m)"}}>Searching for latest scores, news, and injury updates...</div>
          </div>
        )}

        {briefing&&(
          <>
            {/* Headline */}
            <div className="gl fu" style={{padding:20,marginBottom:20,borderLeft:"3px solid var(--acc)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div style={{fontSize:12,fontWeight:700,color:"var(--m)",letterSpacing:0.5}}>
                  {briefing.status==="pre_tournament"?"PRE-TOURNAMENT BRIEFING":"TOURNAMENT BRIEFING"}
                </div>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {briefLoading&&<div style={{width:12,height:12,borderRadius:5,border:"2px solid var(--b)",borderTopColor:"var(--acc)",animation:"spin 0.8s linear infinite"}}/>}
                  <button onClick={generateBriefing} disabled={briefLoading} style={{padding:"6px 12px",borderRadius:7,fontSize:12,fontWeight:600,background:"var(--s2)",color:"var(--m)",border:"1px solid var(--b)",cursor:"pointer",fontFamily:"'DM Sans'"}}>
                    {briefLoading?"Updating...":"Refresh"}
                  </button>
                </div>
              </div>
              <div style={{fontSize:22,fontWeight:800,color:"#fff",lineHeight:1.3,letterSpacing:-0.3}}>{briefing.headline}</div>
              <div style={{fontSize:11,color:"var(--d)",marginTop:6}}>
                Last updated {briefing.ts?new Date(briefing.ts).toLocaleTimeString():"just now"} — auto-refreshes every 30 min
              </div>
            </div>

            {/* Key News */}
            {briefing.key_news&&briefing.key_news.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:20}}>Key Updates</div>
                {briefing.key_news.map((item,i)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"6px 0",borderBottom:i<briefing.key_news.length-1?"1px solid var(--b)":"none"}}>
                    <div style={{width:28,height:28,borderRadius:6,background:"var(--s2)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>
                      <span className="mn" style={{fontSize:12,color:"var(--m)",fontWeight:600}}>{i+1}</span>
                    </div>
                    <div style={{fontSize:14,color:"var(--t2)",lineHeight:1.5}}>{item}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Bracket Health */}
            <div className="gl fu" style={{padding:18,marginBottom:18}}>
              <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:20}}>Bracket Analysis</div>
              <div style={{fontSize:14,color:"var(--t2)",lineHeight:1.6,marginBottom:18}}>{briefing.bracket_analysis}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                {brackets.map((b,i)=>{
                  let cor=0,wrg=0,pts=0;const rp={0:10,1:20,2:40,3:80,4:160,5:320};
                  Object.entries(b.picks).forEach(([k,pk])=>{const rd=parseInt(k.split("-")[1]);if(results[k]){if(results[k]===pk){cor++;pts+=(rp[rd]||10);}else wrg++;}});
                  const total=Object.keys(b.picks).length;const filled=total>=50;
                  return(
                    <div key={i} style={{padding:14,borderRadius:8,background:"var(--s2)",textAlign:"center",border:"1px solid var(--b)"}}>
                      <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{b.name}</div>
                      <div className="mn" style={{fontSize:22,fontWeight:800,color:cor+wrg>0?"var(--acc)":"var(--m)",margin:"4px 0"}}>{pts}</div>
                      <div style={{fontSize:14,color:"var(--d)"}}>{cor+wrg>0?`${cor}W - ${wrg}L`:filled?`${total} picks ready`:`${total} picks made`}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Danger Alerts */}
            {briefing.danger_alerts&&briefing.danger_alerts.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18,borderLeft:"3px solid var(--red)"}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--red)",marginBottom:20}}>Danger Alerts</div>
                {briefing.danger_alerts.map((alert,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"4px 0",borderBottom:i<briefing.danger_alerts.length-1?"1px solid var(--b)":"none"}}>{alert}</div>
                ))}
              </div>
            )}

            {/* Today's Games */}
            {briefing.todays_games&&briefing.todays_games.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:20}}>Today's Games</div>
                {briefing.todays_games.map((game,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.todays_games.length-1?"1px solid var(--b)":"none"}}>{game}</div>
                ))}
              </div>
            )}

            {/* Today's Games */}
            {briefing.todays_games&&briefing.todays_games.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:20}}>Today's Games</div>
                {briefing.todays_games.map((game,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.todays_games.length-1?"1px solid var(--b)":"none"}}>{game}</div>
                ))}
              </div>
            )}

            {/* Performance Flags — from AI */}
            {briefing.performance_flags&&briefing.performance_flags.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18,borderLeft:"3px solid var(--green)"}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--green)",marginBottom:20}}>Performance Tracker</div>
                {briefing.performance_flags.map((flag,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.performance_flags.length-1?"1px solid var(--b)":"none"}}>{flag}</div>
                ))}
              </div>
            )}

            {/* Live Odds Shifts — from AI + local data */}
            {(briefing.odds_movement&&briefing.odds_movement.length>0||oddsShifts.length>0)&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--acc)",marginBottom:20}}>Title Odds Movement</div>
                {/* Local computed shifts */}
                {oddsShifts.length>0&&(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:briefing.odds_movement?.length>0?8:0}}>
                    {oddsShifts.slice(0,6).map((s,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:7,background:"var(--s2)"}}>
                        <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>{s.team}</div>
                        <div className="mn" style={{fontSize:13,fontWeight:700,color:s.direction==="up"?"var(--green)":"var(--red)"}}>
                          {s.delta>0?"+":""}{s.delta}%
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {/* AI-generated context */}
                {briefing.odds_movement&&briefing.odds_movement.map((note,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"4px 0",borderBottom:i<briefing.odds_movement.length-1?"1px solid var(--b)":"none"}}>{note}</div>
                ))}
              </div>
            )}

            {/* Local Path Alerts — computed in real-time */}
            {pathAlerts.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18,borderLeft:`3px solid ${pathAlerts[0].severity==="critical"?"var(--red)":"var(--orange)"}`}}>
                <div style={{fontSize:15,fontWeight:700,color:pathAlerts[0].severity==="critical"?"var(--red)":"var(--orange)",marginBottom:20}}>Path Analysis</div>
                {pathAlerts.slice(0,5).map((alert,i)=>(
                  <div key={i} style={{display:"flex",gap:12,padding:"6px 0",borderBottom:i<Math.min(pathAlerts.length,5)-1?"1px solid var(--b)":"none"}}>
                    <div style={{flexShrink:0,width:28,height:28,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,
                      background:alert.severity==="critical"?"rgba(229,69,61,0.12)":alert.severity==="high"?"rgba(245,166,35,0.12)":"rgba(20,147,255,0.08)",
                      color:alert.severity==="critical"?"var(--red)":alert.severity==="high"?"var(--orange)":"var(--acc)"}}>
                      {alert.severity==="critical"?"X":alert.severity==="high"?"!":"~"}
                    </div>
                    <div style={{fontSize:14,color:"var(--t2)",lineHeight:1.5}}>{alert.msg}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Live Power Boosts — show teams whose ratings have shifted */}
            {Object.keys(boosts).filter(t=>Math.abs(boosts[t])>=1.5).length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:20}}>Live Rating Adjustments</div>
                <div style={{fontSize:13,color:"var(--m)",marginBottom:20}}>Power ratings adjusted based on actual tournament performance. Blowout wins boost, close calls flag concern.</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                  {Object.entries(boosts).filter(([,v])=>Math.abs(v)>=1.5).sort((a,b)=>b[1]-a[1]).slice(0,8).map(([team,boost],i)=>{
                    const t=T[team];if(!t)return null;
                    return(
                      <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"7px 10px",borderRadius:7,background:"var(--s2)"}}>
                        <div>
                          <div style={{fontSize:14,fontWeight:600,color:"#fff"}}>({t.s}) {team}</div>
                          <div style={{fontSize:14,color:"var(--m)"}}>{margins[team]?.wins?.length||0}W</div>
                        </div>
                        <div className="mn" style={{fontSize:15,fontWeight:700,color:boost>0?"var(--green)":"var(--red)"}}>
                          {boost>0?"+":""}{boost.toFixed(1)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Hot Takes */}
            {briefing.hot_takes&&briefing.hot_takes.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--orange)",marginBottom:20}}>Intel</div>
                {briefing.hot_takes.map((take,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"4px 0",borderBottom:i<briefing.hot_takes.length-1?"1px solid var(--b)":"none"}}>{take}</div>
                ))}
              </div>
            )}

            {/* Recommended Action */}
            {briefing.recommended_action&&(
              <div className="gl fu" style={{padding:18,background:"var(--s2)",borderColor:"var(--acc)",borderLeft:"3px solid var(--acc)"}}>
                <div style={{fontSize:13,fontWeight:700,color:"var(--acc)",marginBottom:4,letterSpacing:0.3}}>RECOMMENDED ACTION</div>
                <div style={{fontSize:15,color:"#fff",lineHeight:1.5,fontWeight:600}}>{briefing.recommended_action}</div>
              </div>
            )}
          </>
        )}

        {/* Quick actions if no briefing yet and not loading */}
        {!briefing&&!briefLoading&&(
          <div style={{textAlign:"center",padding:"40px 20px"}}>
            <div style={{fontSize:18,fontWeight:800,color:"#fff",marginBottom:6}}>Tournament Intelligence</div>
            <p style={{fontSize:14,color:"var(--m)",marginBottom:20,lineHeight:1.5}}>
              Auto-pilot will search the web for the latest scores, injuries, and news, then generate a personalized briefing based on your brackets.
            </p>
            <button onClick={generateBriefing} style={{padding:"14px 32px",borderRadius:8,fontSize:15,fontWeight:700,background:"var(--acc)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans'"}}>
              Generate Briefing
            </button>
          </div>
        )}
      </div>)}

      {/* ═══ GAME PREDICTIONS TAB ═══ */}
      {tab==="predict"&&(<div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.3,color:"#fff"}}>Game Predictions</div>
          <p style={{fontSize:14,color:"var(--m)",lineHeight:1.5,marginTop:3}}>Model-driven picks for every first-round matchup with confidence tiers and reasoning.</p>
        </div>

        {/* Region filter */}
        <div style={{display:"flex",gap:12,marginBottom:18,background:"var(--s)",borderRadius:8,padding:3,border:"1px solid var(--b)"}}>
          {[["ALL","All"],...Object.entries(RG).map(([k,v])=>[k,v])].map(([k,v])=>(
            <button key={k} onClick={()=>setPredReg(k)} style={{flex:1,padding:"11px 8px",borderRadius:8,fontSize:13,fontWeight:600,background:predReg===k?"var(--s3)":"transparent",color:predReg===k?"#fff":"var(--m)",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.12s"}}>{v}</button>
          ))}
        </div>

        {Object.entries(MO).filter(([rk])=>predReg==="ALL"||predReg===rk).map(([rk,matchups])=>(
          <div key={rk} style={{marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
              <div style={{width:3,height:14,borderRadius:1,background:RC[rk]}}/>
              <span style={{fontSize:15,fontWeight:700,color:"var(--t2)"}}>{RG[rk]} Region</span>
            </div>
            {matchups.map(([a,b],i)=>{
              const pred=getGamePrediction(a,b);if(!pred)return null;
              return(
                <div key={i} className="gl" style={{padding:16,marginBottom:20,borderLeft:`3px solid ${pred.confColor}`}}>
                  {/* Matchup header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
                        <span style={{fontSize:13,fontWeight:800,color:RC[rk]}}>({T[a].s})</span>
                        <span style={{fontSize:15,fontWeight:pred.winner===a?900:500,color:pred.winner===a?"#fff":"var(--m)"}}>{a}</span>
                        <span style={{fontSize:14,color:"var(--d)"}}>vs</span>
                        <span style={{fontSize:13,fontWeight:800,color:RC[rk]}}>({T[b].s})</span>
                        <span style={{fontSize:15,fontWeight:pred.winner===b?900:500,color:pred.winner===b?"#fff":"var(--m)"}}>{b}</span>
                      </div>
                      <div style={{fontSize:14,color:"var(--m)"}}>{T[a].rec} {T[a].c} vs {T[b].rec} {T[b].c}</div>
                    </div>
                    <div style={{textAlign:"center",flexShrink:0}}>
                      <div style={{fontSize:15,fontWeight:700,letterSpacing:1,color:pred.confColor,padding:"1px 6px",borderRadius:5,background:`${pred.confColor}15`,border:`1px solid ${pred.confColor}30`}}>{pred.conf}</div>
                    </div>
                  </div>

                  {/* Pick */}
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"8px 10px",borderRadius:8,background:"rgba(255,255,255,0.03)",marginBottom:20}}>
                    <div style={{width:38,height:38,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${pred.confColor}20`,border:`1px solid ${pred.confColor}40`}}>
                      <span className="mn" style={{fontSize:15,fontWeight:800,color:pred.confColor}}>{pred.winPct}</span>
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:16,fontWeight:900,color:"#fff"}}>PICK: {pred.winner}</div>
                      <div style={{fontSize:14,color:"var(--m)"}}>({T[pred.winner].s}) seed · {T[pred.winner].rec} · {T[pred.winner].c}</div>
                    </div>
                    <div style={{fontSize:14,color:pred.confColor,fontWeight:700}}>{pred.winPct}% WIN</div>
                  </div>

                  {/* Reasoning */}
                  <div style={{marginBottom:pred.upsetAngle?6:0}}>
                    {pred.reasons.map((r,ri)=>(
                      <div key={ri} style={{display:"flex",gap:5,padding:"2px 0"}}>
                        <span style={{color:pred.confColor,fontSize:14,fontWeight:800,flexShrink:0}}>→</span>
                        <span style={{fontSize:14,color:"rgba(255,255,255,0.6)",lineHeight:1.4}}>{r}</span>
                      </div>
                    ))}
                  </div>

                  {/* Upset angle */}
                  {pred.upsetAngle&&pred.conf!=="LOCK"&&(
                    <div style={{padding:"7px 10px",borderRadius:8,background:"rgba(239,68,68,0.06)",border:"1px solid rgba(239,68,68,0.15)",marginTop:4}}>
                      <span style={{fontSize:15,fontWeight:700,color:"var(--red)",letterSpacing:0.5}}>UPSET WATCH: </span>
                      <span style={{fontSize:14,color:"rgba(255,255,255,0.55)"}}>{pred.upsetAngle}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Summary stats */}
        <div className="gl" style={{padding:16,marginTop:8}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--m)",letterSpacing:1,textTransform:"uppercase",marginBottom:20}}>Prediction Summary</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:6}}>
            {["LOCK","STRONG","LEAN","TOSS-UP"].map(c=>{
              const color=c==="LOCK"?"var(--green)":c==="STRONG"?"var(--acc)":c==="LEAN"?"var(--orange)":"var(--red)";
              const count=Object.entries(MO).flatMap(([rk,ms])=>ms.map(([a,b])=>getGamePrediction(a,b))).filter(p=>p?.conf===c).length;
              return(
                <div key={c} style={{textAlign:"center",padding:"6px",borderRadius:8,background:`${color}08`,border:`1px solid ${color}20`}}>
                  <div className="mn" style={{fontSize:15,fontWeight:800,color}}>{count}</div>
                  <div style={{fontSize:13,fontWeight:700,color,letterSpacing:0.5}}>{c}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>)}

      {/* ═══ AUTO-GENERATE BRACKET TAB ═══ */}
      {tab==="autogen"&&(<div>
        <div style={{marginBottom:18}}>
          <div style={{fontSize:20,fontWeight:800,letterSpacing:-0.3,color:"#fff"}}>Auto-Generate Brackets</div>
          <p style={{fontSize:14,color:"var(--m)",lineHeight:1.5,marginTop:3}}>
            Instantly build complete 63-game brackets at 3 risk levels. Powered by the prediction engine, injury data, and style clash analysis.
          </p>
        </div>

        <div style={{display:"grid",gridTemplateColumns:"1fr",gap:12,marginBottom:20}}>
          {[
            {mode:"chalk",name:"Chalk",desc:"Always pick the favorite. Safest bracket — maximizes correct picks in early rounds. Best for small pools.",color:"var(--acc)",upsets:"0-2 upsets"},
            {mode:"balanced",name:"Balanced",desc:"Smart upsets only — targets games with real edges: injuries, under-seeding, style mismatches. Best for 10-50 person pools.",color:"var(--green)",upsets:"5-8 upsets"},
            {mode:"chaos",name:"Upset Heavy",desc:"Maximum chaos — picks every live upset, targets Cinderellas, fades injured teams. Best for 100+ person pools.",color:"var(--red)",upsets:"12-18 upsets"},
          ].map(({mode,name,desc,color,upsets})=>(
            <div key={mode} className="gl" style={{padding:18,borderLeft:`3px solid ${color}`}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{name}</div>
                  <div style={{fontSize:13,color:"var(--m)",lineHeight:1.5,marginTop:5,maxWidth:320}}>{desc}</div>
                  <div className="mn" style={{fontSize:14,color,fontWeight:600,marginTop:4}}>{upsets}</div>
                </div>
              </div>
              <button onClick={()=>{
                const newPicks=generateBracket(mode);
                const nb=[...brackets];
                const targetIdx=mode==="chalk"?0:mode==="balanced"?1:2;
                nb[targetIdx]={...nb[targetIdx],picks:newPicks};
                save(nb);
              }} style={{width:"100%",padding:"10px",borderRadius:8,fontSize:15,fontWeight:700,background:`${color}`,color:"#000",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",marginTop:4}}>
                Generate & Save to "{name}" Bracket →
              </button>
            </div>
          ))}
        </div>

        {/* Generate All */}
        <div className="gl" style={{padding:20,marginBottom:20,textAlign:"center",background:"linear-gradient(135deg,rgba(157,122,255,0.04),rgba(74,158,255,0.04))"}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:6,letterSpacing:-0.2}}>Generate All 3 Brackets</div>
          <p style={{fontSize:13,color:"var(--m)",marginBottom:20}}>Fill Chalk, Balanced, and Upset Heavy simultaneously — ready for any pool.</p>
          <button onClick={()=>{
            const nb=[
              {name:"Chalk",picks:generateBracket("chalk")},
              {name:"Balanced",picks:generateBracket("balanced")},
              {name:"Upset Heavy",picks:generateBracket("chaos")},
            ];
            save(nb);
          }} style={{padding:"14px 40px",borderRadius:8,fontSize:14,fontWeight:700,background:"linear-gradient(135deg,var(--acc),var(--acc2))",color:"#000",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",letterSpacing:0.2,transition:"all 0.15s"}}>
            Generate All 3 →
          </button>
        </div>

        {/* Preview generated brackets */}
        <div style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Current Bracket Status</div>
        {brackets.map((b,bi)=>{
          const total=Object.keys(b.picks).length;const score=getBracketScore(b.picks);
          // Get regional champs
          const champs=Object.entries(RG).map(([rk,rn])=>{const k=`${rk}-3-0`;return{reg:rn,team:b.picks[k]||null,color:RC[rk]};});
          return(
            <div key={bi} className="gl" style={{padding:16,marginBottom:20}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <span style={{fontSize:14,fontWeight:800}}>{b.name}</span>
                  {score&&<span style={{fontSize:15,fontWeight:700,color:score.color,padding:"1px 6px",borderRadius:5,background:`${score.color}12`}}>{score.profile}</span>}
                </div>
                <span className="mn" style={{fontSize:13,color:total>=60?"var(--green)":"var(--m)"}}>{total}/60</span>
              </div>
              {total>0&&(
                <div style={{display:"flex",gap:4}}>
                  {champs.map((ch,ci)=>(
                    <div key={ci} style={{flex:1,textAlign:"center",padding:"4px",borderRadius:6,background:"rgba(255,255,255,0.02)",border:`1px solid ${ch.color}20`}}>
                      <div style={{fontSize:13,color:ch.color,fontWeight:700}}>{ch.reg}</div>
                      <div style={{fontSize:14,fontWeight:800,color:ch.team?"#fff":"var(--d)"}}>{ch.team||"—"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Injury-driven picks */}
        <div className="gl" style={{padding:18,marginTop:8}}>
          <div style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)",marginBottom:20}}>INJURY-DRIVEN UPSET INTELLIGENCE</div>
          <div style={{fontSize:13,color:"var(--m)",lineHeight:1.6,marginBottom:20}}>
            These injuries are baked into the balanced and upset-heavy bracket generators:
          </div>
          {Object.entries(T).filter(([,t])=>t.inj).map(([name,t])=>(
            <div key={name} style={{display:"flex",gap:12,padding:"5px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
              <span style={{fontSize:13,fontWeight:700,color:RC[t.r]}}>({t.s}) {name}</span>
              <span style={{fontSize:13,color:"var(--red)"}}>{t.inj}</span>
              <span style={{fontSize:14,color:"var(--d)",marginLeft:"auto"}}>
                {name==="Michigan"?"Cason ACL → frontcourt must carry":name==="UNC"?"Wilson OUT → major scoring loss":name==="Louisville"?"Brown GTD → limited at best":name==="Texas Tech"?"Toppin OUT → no interior game":"Impact TBD"}
              </span>
            </div>
          ))}
        </div>
      </div>)}

      {/* ═══ SIMULATE TAB ═══ */}
      {tab==="sim"&&(<div>
        <div className="gl fu" style={{padding:20,textAlign:"center",marginBottom:18}}>
          <div style={{fontSize:14,fontWeight:800,marginBottom:4,letterSpacing:-0.3,color:"#fff"}}>Tournament Simulation</div>
          <p style={{fontSize:13,color:"var(--m)",marginBottom:18,lineHeight:1.6}}>
            Run thousands of tournament simulations using an 11-factor composite power model.
          </p>
          <p className="mn" style={{fontSize:14,color:"var(--d)",marginBottom:18,lineHeight:1.8,maxWidth:480,margin:"0 auto 14px"}}>
            PWR = OFF×.20 + DEF×.20 + SOS×.14 + MOM×.09 + EXP×.07 + REB×.08 + TO×.05 + 3PT×.04 + BENCH×.04 + CLUTCH×.05 + STAR×.04
          </p>
          <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:4}}>
            {[1000,5000,10000,25000].map(n=>(
              <button key={n} onClick={()=>doSim(n)} style={{padding:"11px 22px",borderRadius:8,fontSize:13,fontWeight:700,background:"var(--acc)",color:"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.12s"}}>{(n/1000)}k</button>
            ))}
          </div>
        </div>

        {simR&&(<>
          <div className="gl fu" style={{padding:18,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <span style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)"}}>Championship Win %</span>
              <span className="mn" style={{fontSize:14,color:"var(--d)"}}>{simR.n.toLocaleString()} sims</span>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={simR.ch.slice(0,12).map(([n,c])=>({name:n.length>11?n.slice(0,10)+"…":n,pct:+(c/simR.n*100).toFixed(1)}))} layout="vertical" margin={{left:0,right:35}}>
                <XAxis type="number" tick={{fill:"rgba(140,160,200,0.35)",fontSize:26,fontFamily:"IBM Plex Mono"}} tickFormatter={v=>`${v}%`}/>
                <YAxis type="category" dataKey="name" width={85} tick={{fill:"rgba(180,195,220,0.7)",fontSize:12,fontFamily:"DM Sans"}}/>
                <Tooltip contentStyle={{background:"var(--s2)",border:"1px solid var(--b2)",borderRadius:8,fontSize:13,fontFamily:"DM Sans",color:"#fff"}} formatter={v=>[`${v}%`,"Win %"]}/>
                <Bar dataKey="pct" radius={[0,4,4,0]}>
                  {simR.ch.slice(0,12).map(([n],i)=><Cell key={i} fill={i===0?"var(--acc)":i<3?"var(--acc)":i<6?"var(--green)":"rgba(255,255,255,0.06)"}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="gl fu" style={{padding:18,marginBottom:20}}>
            <div style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Final Four Rates — Top 12</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
              {simR.f4.slice(0,12).map(([n,c])=>{const t=T[n];const pct=(c/simR.n*100).toFixed(1);
                return(<div key={n} style={{display:"flex",alignItems:"center",gap:5,padding:"5px 6px",borderRadius:8,background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.04)"}}>
                  <div style={{width:28,height:28,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,background:RC[t.r],color:"#000"}}>{t.s}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:13,fontWeight:700,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n}</div><div style={{fontSize:13,color:"var(--m)"}}>{RG[t.r]}</div></div>
                  <span className="mn" style={{fontSize:13,fontWeight:700,color:RC[t.r]}}>{pct}%</span>
                </div>);
              })}
            </div>
          </div>

          {/* Upset alerts */}
          <div className="gl fu" style={{padding:14}}>
            <div style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)",marginBottom:20}}>First-Round Upset Alerts</div>
            {Object.entries(MO).flatMap(([rk,ms])=>ms.map(([a,b])=>{const p=getWP(a,b);const up=1-p;if(up<0.28||T[b].s<=8)return null;return{r:rk,fav:a,dog:b,pct:up};}).filter(Boolean)).sort((a,b)=>b.pct-a.pct).slice(0,8).map((u,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                <div className="mn" style={{fontSize:15,fontWeight:800,color:u.pct>=0.45?"var(--red)":"var(--orange)",width:35,textAlign:"center"}}>{Math.round(u.pct*100)}%</div>
                <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}><span style={{color:RC[u.r]}}>({T[u.dog].s})</span> {u.dog} over ({T[u.fav].s}) {u.fav}</div>
                <div style={{fontSize:14,color:"var(--m)"}}>{RG[u.r]} · {T[u.dog].note?.slice(0,70)}</div></div>
              </div>
            ))}
          </div>
        </>)}
      </div>)}

      {/* ═══ BRACKET TAB ═══ */}
      {tab==="bracket"&&(<div>
        {/* Bracket selector */}
        <div style={{display:"flex",gap:12,marginBottom:18}}>
          {brackets.map((b,i)=>(
            <button key={i} onClick={()=>setBIdx(i)} style={{flex:1,padding:"8px",borderRadius:8,fontSize:13,fontWeight:700,background:bIdx===i?"rgba(255,255,255,0.08)":"transparent",color:bIdx===i?"#fff":"var(--m)",border:bIdx===i?"1px solid rgba(255,255,255,0.15)":"1px solid var(--b)",cursor:"pointer",fontFamily:"'DM Sans'"}}>
              {b.name}<br/><span className="mn" style={{fontSize:14,color:"var(--d)"}}>{Object.keys(b.picks).length} picks</span>
            </button>
          ))}
        </div>

        {/* Bracket confidence */}
        {bScore&&(
          <div className="gl" style={{padding:14,marginBottom:18,display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:50,height:50,borderRadius:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:`${bScore.color}15`,border:`1px solid ${bScore.color}40`}}>
              <div style={{fontSize:16,fontWeight:900,color:bScore.color}}>{bScore.profile}</div>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:700}}>Bracket Profile: <span style={{color:bScore.color}}>{bScore.profile}</span></div>
              <div style={{fontSize:14,color:"var(--m)"}}>
                {bScore.chalk} chalk / {bScore.upsets} upsets of {bScore.total} picks · {Math.round(bScore.chalkPct*100)}% favorites
              </div>
            </div>
          </div>
        )}

        {/* Region tabs */}
        <div style={{display:"flex",gap:12,marginBottom:18}}>
          {Object.entries(RG).map(([k,v])=>(
            <button key={k} onClick={()=>setReg(k)} style={{flex:1,padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,background:reg===k?RC[k]:"var(--s)",color:reg===k?"#000":"var(--m)",border:reg===k?"none":"1px solid var(--b)",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.15s",letterSpacing:0.2}}>{v}</button>
          ))}
        </div>

        {/* Bracket grid */}
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:12}}>
          <div style={{display:"flex",gap:12,minWidth:600}}>
            {["R64","R32","S16","E8"].map((label,ri)=>{
              const teams=ri===0?MO[reg].flat():getAdv(reg,ri);
              const pairs=[];for(let i=0;i<teams.length;i+=2)pairs.push([teams[i],teams[i+1]]);
              return(
                <div key={ri} style={{display:"flex",flexDirection:"column",justifyContent:"space-around",minWidth:135,gap:3,flexShrink:0}}>
                  <div style={{fontSize:13,fontWeight:700,fontWeight:700,color:"var(--t2)",textAlign:"center",padding:"0 0 3px"}}>{label}</div>
                  {pairs.map(([a,b],pi)=>{
                    const key=`${reg}-${ri}-${pi}`;const picked=brackets[bIdx].picks[key];
                    return(
                      <div key={pi} style={{display:"flex",flexDirection:"column",justifyContent:"center",flex:1,gap:1}}>
                        {[a,b].map((tm,ti)=>{
                          if(!tm)return <div key={ti} style={{height:26,background:"rgba(255,255,255,0.015)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"var(--d)"}}>—</div>;
                          const t=T[tm];const other=ti===0?b:a;const wp=other?getWP(tm,other):1;const sel=picked===tm;
                          return(
                            <div key={ti} onClick={()=>pick(key,tm)} style={{display:"flex",alignItems:"center",gap:3,padding:"3px 5px",borderRadius:5,cursor:"pointer",background:sel?`${RC[reg]}12`:"rgba(255,255,255,0.015)",border:sel?`1px solid ${RC[reg]}50`:"1px solid rgba(255,255,255,0.03)",transition:"all 0.1s"}}>
                              <span style={{fontSize:15,fontWeight:800,color:t.s<=4?RC[reg]:"var(--d)",width:12,textAlign:"center"}}>{t.s}</span>
                              <span style={{fontSize:14,fontWeight:sel?800:600,color:sel?"#fff":"rgba(255,255,255,0.65)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tm}</span>
                              <span className="mn" style={{fontSize:13,fontWeight:700,color:wp>=0.6?"var(--green)":"var(--orange)"}}>{Math.round(wp*100)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minWidth:110}}>
              {(()=>{const k=`${reg}-3-0`;const w=brackets[bIdx].picks[k];
                if(!w)return <div className="gl" style={{padding:20,textAlign:"center"}}><div style={{fontSize:14,color:"var(--d)"}}>Complete bracket to see champion</div></div>;
                const t=T[w];
                return <div className="gl" style={{padding:16,textAlign:"center",borderColor:`${RC[reg]}40`}}>
                  <div style={{fontSize:15,fontWeight:700,color:RC[reg],letterSpacing:1,textTransform:"uppercase"}}>{RG[reg]} Champ</div>
                  <div style={{fontSize:20,fontWeight:900,margin:"4px 0"}}>{w}</div>
                  <div style={{fontSize:14,color:"var(--m)"}}>({t.s}) {t.rec}</div>
                </div>;
              })()}
            </div>
          </div>
        </div>
      </div>)}

      {/* ═══ BETTING VALUE TAB ═══ */}
      {tab==="value"&&(<div>
        {!simR?(
          <div className="gl fu" style={{padding:20,textAlign:"center"}}>
            <p style={{fontSize:14,fontWeight:700,marginBottom:16}}>Run a simulation first to generate betting values</p>
            <button onClick={()=>{doSim(10000);}} style={{padding:"14px 32px",borderRadius:8,background:"var(--acc)",color:"#fff",border:"none",cursor:"pointer",fontSize:15,fontWeight:700,fontFamily:"'DM Sans'"}}>Run 10k Sims</button>
          </div>
        ):(
          <>
            <div className="gl fu" style={{padding:18,marginBottom:20}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Betting Value Finder</div>
              <div style={{fontSize:13,color:"var(--m)",marginBottom:18,lineHeight:1.5}}>
                Compares our model's implied win probability vs Vegas lines. Positive edge = the model thinks the team is more likely to win than Vegas does. These are your best value plays.
              </div>
              <div style={{display:"flex",padding:"6px 0",borderBottom:"1px solid var(--b)",marginBottom:4}}>
                <span style={{flex:2,fontSize:15,fontWeight:700,color:"var(--d)"}}>TEAM</span>
                <span style={{width:45,fontSize:15,fontWeight:700,color:"var(--d)",textAlign:"center"}}>VEGAS</span>
                <span style={{width:45,fontSize:15,fontWeight:700,color:"var(--d)",textAlign:"center"}}>MODEL</span>
                <span style={{width:45,fontSize:15,fontWeight:700,color:"var(--d)",textAlign:"center"}}>EDGE</span>
              </div>
              {bettingValues.map((v,i)=>(
                <div key={v.name} style={{display:"flex",alignItems:"center",padding:"6px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                  <div style={{flex:2,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:16,height:16,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,background:RC[v.reg],color:"#000"}}>{v.seed}</div>
                    <div><div style={{fontSize:13,fontWeight:700}}>{v.name}</div><div style={{fontSize:13,color:"var(--m)"}}>{v.conf} · {v.vegasOdds}</div></div>
                  </div>
                  <span className="mn" style={{width:45,textAlign:"center",fontSize:13,color:"var(--m)"}}>{v.vegasPct.toFixed(1)}%</span>
                  <span className="mn" style={{width:45,textAlign:"center",fontSize:13,color:"#fff"}}>{v.modelPct.toFixed(1)}%</span>
                  <span className="mn" style={{width:45,textAlign:"center",fontSize:15,fontWeight:800,color:v.edge>2?"var(--green)":v.edge>0?"var(--orange)":"var(--red)"}}>
                    {v.edge>0?"+":""}{v.edge.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="gl" style={{padding:12}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--t2)",marginBottom:6}}>How to read this</div>
              <div style={{fontSize:13,color:"var(--m)",lineHeight:1.6}}>
                A positive edge means our model gives a team a higher championship probability than Vegas does — that's where the value is. The bigger the edge, the more "mispriced" the team is. Look for 2%+ edges on teams with strong underlying analytics.
              </div>
            </div>
          </>
        )}
      </div>)}

      {/* ═══ AI STYLE CLASH TAB ═══ */}
      {tab==="clash"&&(<div>
        <div className="gl fu" style={{padding:20,marginBottom:20}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:20}}>
            
            <span style={{fontSize:13,fontWeight:800,letterSpacing:-0.2}}>AI Matchup Analysis</span>
          </div>
          <div style={{display:"flex",gap:12,marginBottom:18}}>
            <select value={cmpA} onChange={e=>setCmpA(e.target.value)} style={{flex:1,padding:"7px",borderRadius:8,background:"var(--s2)",color:"#fff",border:"1px solid var(--b)",fontSize:16}}>
              {allNames.map(t=><option key={t} value={t}>({T[t].s}) {t}</option>)}
            </select>
            <div style={{display:"flex",alignItems:"center",fontSize:15,fontWeight:800,color:"var(--d)"}}>VS</div>
            <select value={cmpB} onChange={e=>setCmpB(e.target.value)} style={{flex:1,padding:"7px",borderRadius:8,background:"var(--s2)",color:"#fff",border:"1px solid var(--b)",fontSize:16}}>
              {allNames.map(t=><option key={t} value={t}>({T[t].s}) {t}</option>)}
            </select>
          </div>
          <button onClick={runAI} disabled={aiLoading} style={{width:"100%",padding:"10px",borderRadius:8,fontSize:15,fontWeight:700,background:aiLoading?"var(--s2)":"linear-gradient(135deg,#7c8db5,#7c5ce0)",color:aiLoading?"var(--m)":"#fff",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.2s",letterSpacing:0.2}}>
            {aiLoading?"Analyzing matchup...":"Run AI Analysis →"}
          </button>
        </div>

        {/* Radar + Style Clash */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:20}}>
          {[cmpA,cmpB].map(n=>{const t=T[n];if(!t)return null;const ac=RC[t.r];
            const data=[{s:"OFF",v:t.off},{s:"DEF",v:t.def},{s:"REB",v:t.reb},{s:"SOS",v:t.sos},{s:"CLT",v:t.clutch},{s:"PIR",v:t.starPIR}];
            return(
              <div key={n} className="gl" style={{padding:10}}>
                <div style={{fontSize:15,fontWeight:800,color:ac}}>({t.s}) {n}</div>
                <div style={{fontSize:14,color:"var(--m)"}}>{t.rec} · {t.style} / {t.defStyle}</div>
                <ResponsiveContainer width="100%" height={130}>
                  <RadarChart data={data}><PolarGrid stroke="rgba(255,255,255,0.06)"/><PolarAngleAxis dataKey="s" tick={{fill:"rgba(255,255,255,0.35)",fontSize:16}}/><Radar dataKey="v" stroke={ac} fill={ac} fillOpacity={0.12} strokeWidth={2}/></RadarChart>
                </ResponsiveContainer>
              </div>
            );
          })}
        </div>

        {/* Style clash breakdown */}
        {(()=>{const sc=getStyleClash(cmpA,cmpB);if(!sc)return null;
          return(
            <div className="gl fu" style={{padding:18,marginBottom:20}}>
              <div style={{fontSize:15,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Style Clash Breakdown</div>
              {[{l:"Tempo",v:sc.tempoEdge,c:"var(--acc)"},{l:"Offensive Style",v:sc.styleMatch,c:"var(--orange)"},{l:"Defensive Schemes",v:sc.defMatch,c:"#7c8db5"},{l:"Rebounding Edge",v:sc.rebEdge,c:"var(--green)"}].map((item,i)=>(
                <div key={i} style={{marginBottom:6}}>
                  <div style={{fontSize:15,fontWeight:700,color:item.c,letterSpacing:0.5,textTransform:"uppercase"}}>{item.l}</div>
                  <div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{item.v}</div>
                </div>
              ))}
              <div style={{textAlign:"center",marginTop:10,padding:"8px",background:"rgba(255,255,255,0.02)",borderRadius:8}}>
                <span className="mn" style={{fontSize:20,fontWeight:800,color:RC[T[cmpA]?.r]}}>{Math.round(getWP(cmpA,cmpB)*100)}%</span>
                <span style={{fontSize:13,color:"var(--d)",margin:"0 8px"}}>—</span>
                <span className="mn" style={{fontSize:20,fontWeight:800,color:RC[T[cmpB]?.r]}}>{Math.round((1-getWP(cmpA,cmpB))*100)}%</span>
              </div>
            </div>
          );
        })()}

        {/* AI results */}
        {aiRes&&(
          <div className="gl fu" style={{padding:18,borderColor:"rgba(139,92,246,0.3)"}}>
            <div style={{fontSize:14,fontWeight:700,letterSpacing:1.5,color:"#7c8db5",textTransform:"uppercase",marginBottom:20}}>Claude's Analysis</div>
            <div style={{textAlign:"center",marginBottom:18}}>
              <span style={{fontSize:13,fontWeight:900}}>{aiRes.winner}</span>
              <span className="mn" style={{fontSize:14,fontWeight:700,color:"var(--green)",marginLeft:8}}>{aiRes.winPct}%</span>
            </div>
            {[{l:"Key Matchup",v:aiRes.keyMatchup,c:"var(--acc)"},{l:"Style Factor",v:aiRes.styleFactor,c:"#7c8db5"},{l:"Star Watch",v:aiRes.starWatch,c:"var(--orange)"},{l:"Upset Recipe",v:aiRes.upsetRecipe,c:"var(--red)"},{l:"Injury Impact",v:aiRes.injury_impact,c:"#ec4899"},{l:"Prediction",v:aiRes.prediction,c:"var(--green)"}].map((item,i)=>(
              <div key={i} style={{marginBottom:6}}><div style={{fontSize:15,fontWeight:700,color:item.c,textTransform:"uppercase",letterSpacing:0.5}}>{item.l}</div><div style={{fontSize:13,color:"rgba(255,255,255,0.65)",lineHeight:1.5}}>{item.v}</div></div>
            ))}
          </div>
        )}
      </div>)}

      {/* ═══ PLAYER IMPACT TAB ═══ */}
      {tab==="players"&&(<div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          
          <span style={{fontSize:20,fontWeight:800,letterSpacing:-0.3,color:"#fff"}}>Star Player Impact</span>
        </div>
        <p style={{fontSize:13,color:"var(--m)",marginBottom:18,lineHeight:1.5,paddingLeft:11}}>
          Players ranked by PIR — composite of scoring, efficiency, defense, clutch, and win-share. Injury flags show tournament impact.
        </p>
        {Object.entries(T).filter(([,t])=>t.starPIR>=70).sort((a,b)=>b[1].starPIR-a[1].starPIR).map(([name,t])=>(
          <div key={name} className="gl" style={{padding:16,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:RC[t.r]}}>{t.star||name}</div>
                <div style={{fontSize:14,color:"var(--m)"}}>({t.s}) {name} · {t.c}</div>
                {t.starLine&&<div className="mn" style={{fontSize:14,color:"rgba(255,255,255,0.55)",marginTop:2}}>{t.starLine}</div>}
              </div>
              <div style={{textAlign:"center",background:`${RC[t.r]}12`,borderRadius:8,padding:"6px 12px",border:`1px solid ${RC[t.r]}30`}}>
                <div className="mn" style={{fontSize:13,fontWeight:800,color:RC[t.r]}}>{t.starPIR}</div>
                <div style={{fontSize:13,color:"var(--d)"}}>PIR</div>
              </div>
            </div>
            {t.inj&&<div style={{fontSize:14,color:"var(--red)",fontWeight:700,marginTop:6,padding:"3px 6px",background:"rgba(239,68,68,0.08)",borderRadius:6,display:"inline-block"}}>{t.inj}</div>}
            <div style={{fontSize:14,color:"var(--m)",marginTop:4,lineHeight:1.4}}>{t.note}</div>
            <div style={{display:"flex",gap:12,marginTop:6}}>
              {[{l:"OFF",v:t.off},{l:"CLT",v:t.clutch},{l:"DEF",v:t.def}].map(s=>(
                <div key={s.l} style={{flex:1,textAlign:"center",padding:"3px",background:"rgba(255,255,255,0.02)",borderRadius:4}}>
                  <div style={{fontSize:13,color:"var(--d)"}}>{s.l}</div>
                  <div className="mn" style={{fontSize:13,fontWeight:700,color:s.v>=85?"var(--green)":s.v>=70?"var(--acc)":"var(--m)"}}>{s.v}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ CONFERENCE POWER INDEX ═══ */}
      {tab==="conf"&&(<div>
        <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:4}}>
          
          <span style={{fontSize:20,fontWeight:800,letterSpacing:-0.3,color:"#fff"}}>Conference Power Index</span>
        </div>
        <p style={{fontSize:13,color:"var(--m)",marginBottom:18,lineHeight:1.5,paddingLeft:11}}>
          Historical performance by conference. Seed Factor below 1.0 = historically underseeded (outperforms). Above 1.0 = overseeded.
        </p>
        {Object.entries(CONF_PI).sort((a,b)=>b[1].teams-a[1].teams).map(([conf,d])=>(
          <div key={conf} className="gl" style={{padding:16,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <div>
                <div style={{fontSize:13,fontWeight:800}}>{conf}</div>
                <div style={{fontSize:14,color:"var(--m)"}}>{d.teams} teams in field</div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <div style={{textAlign:"center"}}>
                  <div className="mn" style={{fontSize:14,fontWeight:800,color:d.overSeed<1.0?"var(--green)":"var(--red)"}}>{d.overSeed.toFixed(2)}</div>
                  <div style={{fontSize:13,color:"var(--d)"}}>Seed Factor</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div className="mn" style={{fontSize:14,fontWeight:800,color:"var(--acc)"}}>{d.histFF}</div>
                  <div style={{fontSize:13,color:"var(--d)"}}>Hist F4</div>
                </div>
                <div style={{textAlign:"center"}}>
                  <div className="mn" style={{fontSize:14,fontWeight:800,color:"var(--orange)"}}>{d.histChamp}</div>
                  <div style={{fontSize:13,color:"var(--d)"}}>Titles</div>
                </div>
              </div>
            </div>
            <div style={{fontSize:14,color:"var(--m)",lineHeight:1.4}}>{d.note}</div>
            <div style={{marginTop:6,height:6,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
              <div style={{width:`${d.avgSeedPerf*50}%`,height:"100%",background:d.avgSeedPerf>=1.05?"var(--green)":d.avgSeedPerf>=0.95?"var(--orange)":"var(--red)",borderRadius:2}}/>
            </div>
          </div>
        ))}
      </div>)}

      {/* ═══ LIVE TRACKER TAB ═══ */}
      {tab==="tracker"&&(<div>
        {/* Web Search Update Button */}
        <div className="gl fu" style={{padding:20,marginBottom:18,background:"linear-gradient(135deg,rgba(61,214,140,0.03),rgba(74,158,255,0.03))"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                
                <span style={{fontSize:15,fontWeight:800,letterSpacing:-0.2}}>Live Tournament Tracker</span>
              </div>
              <div style={{fontSize:14,color:"var(--m)",marginTop:5,paddingLeft:11}}>Web-search powered · Manual entry · Auto-scoring</div>
            </div>
            <button onClick={fetchLatest} disabled={fetchLoading} style={{padding:"9px 18px",borderRadius:8,fontSize:13,fontWeight:700,background:fetchLoading?"var(--s2)":"linear-gradient(135deg,var(--green),#2bb870)",color:fetchLoading?"var(--m)":"#000",border:"none",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.15s",letterSpacing:0.2}}>
              {fetchLoading?"Searching...":"Fetch Scores →"}
            </button>
          </div>
          {fetchMsg&&<div style={{fontSize:13,color:fetchMsg.startsWith("")?"var(--green)":fetchMsg.startsWith("")?"var(--orange)":"var(--m)",padding:"6px 8px",borderRadius:8,background:"rgba(255,255,255,0.02)",lineHeight:1.5}}>{fetchMsg}</div>}
        </div>

        {/* Bracket Scoreboard */}
        <div className="gl fu" style={{padding:18,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Bracket Scoreboard</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
            {brackets.map((b,i)=>{
              const sc=scoreBracket(b.picks);const totalResults=Object.keys(results).length;
              const pct=sc.correct+sc.wrong>0?Math.round(sc.correct/(sc.correct+sc.wrong)*100):0;
              return(
                <div key={i} className="gl" style={{padding:14,textAlign:"center",borderColor:i===0?"var(--acc)40":i===1?"var(--green)40":"var(--red)40"}}>
                  <div style={{fontSize:13,fontWeight:700,color:i===0?"var(--acc)":i===1?"var(--green)":"var(--red)"}}>{b.name}</div>
                  <div className="mn" style={{fontSize:24,fontWeight:900,color:"#fff",margin:"4px 0"}}>{sc.pts}</div>
                  <div style={{fontSize:14,color:"var(--d)"}}>points</div>
                  <div style={{display:"flex",justifyContent:"center",gap:12,marginTop:6}}>
                    <div><span className="mn" style={{fontSize:14,color:"var(--green)",fontWeight:700}}>{sc.correct}</span><span style={{fontSize:13,color:"var(--d)"}}> ✓</span></div>
                    <div><span className="mn" style={{fontSize:14,color:"var(--red)",fontWeight:700}}>{sc.wrong}</span><span style={{fontSize:13,color:"var(--d)"}}> ✗</span></div>
                    <div><span className="mn" style={{fontSize:14,color:"var(--m)",fontWeight:700}}>{sc.pending}</span><span style={{fontSize:13,color:"var(--d)"}}> ?</span></div>
                  </div>
                  {sc.correct+sc.wrong>0&&(
                    <div style={{marginTop:4}}>
                      <div style={{height:6,background:"rgba(255,255,255,0.04)",borderRadius:2,overflow:"hidden"}}>
                        <div style={{width:`${pct}%`,height:"100%",background:pct>=70?"var(--green)":pct>=50?"var(--orange)":"var(--red)",borderRadius:2}}/>
                      </div>
                      <div style={{fontSize:14,color:"var(--m)",marginTop:2}}>{pct}% accuracy</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Round Selector */}
        <div style={{display:"flex",gap:3,marginBottom:18}}>
          {["R64","R32","S16","E8","F4","Final"].map((label,i)=>{
            const roundResults=Object.keys(results).filter(k=>parseInt(k.split("-")[1])===i).length;
            const roundTotal={0:32,1:16,2:8,3:4,4:2,5:1}[i];
            const complete=roundResults>=(roundTotal||0);
            return(
              <button key={i} onClick={()=>setTrkRound(i)} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:15,fontWeight:700,background:trkRound===i?"rgba(255,255,255,0.1)":"transparent",color:trkRound===i?"#fff":"var(--m)",border:complete?`1px solid var(--green)40`:`1px solid var(--b)`,cursor:"pointer",fontFamily:"'DM Sans'",textTransform:"uppercase"}}>
                {label}<br/>
                <span className="mn" style={{fontSize:13,color:complete?"var(--green)":"var(--d)"}}>{roundResults}/{roundTotal}</span>
              </button>
            );
          })}
        </div>

        {/* Game Results Entry + Bracket Tracking */}
        <div style={{marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,letterSpacing:1,color:"var(--m)",textTransform:"uppercase",marginBottom:20}}>
            {["Round of 64","Round of 32","Sweet 16","Elite Eight","Final Four","Championship"][trkRound]} — Tap winner to log result
          </div>

          {(()=>{
            const games=getGamesForRound(trkRound);
            if(games.length===0&&trkRound>0){
              // Check if previous round is complete
              const prevGames=getGamesForRound(trkRound-1);
              const prevComplete=prevGames.length>0&&prevGames.every(g=>results[g.key]);
              if(!prevComplete)return(
                <div className="gl" style={{padding:20,textAlign:"center"}}>
                  <div style={{fontSize:14,color:"var(--m)"}}>Complete the previous round first to unlock this round.</div>
                  <div style={{fontSize:14,color:"var(--d)",marginTop:4}}>Go to {["Round of 64","Round of 32","Sweet 16","Elite Eight","Final Four"][trkRound-1]} and enter all results.</div>
                </div>
              );
            }
            return games.map((g,gi)=>{
              const result=results[g.key];const ta=T[g.a],tb=T[g.b];
              const wp=getWP(g.a,g.b);
              // Check each bracket's pick for this game
              const bracketPicks=brackets.map(b=>b.picks[g.key]);
              return(
                <div key={gi} className="gl" style={{padding:14,marginBottom:6,borderLeft:result?`3px solid var(--green)`:`3px solid var(--b)`}}>
                  <div style={{display:"flex",gap:12,marginBottom:6}}>
                    <span style={{fontSize:15,fontWeight:700,color:RC[g.region],letterSpacing:0.5}}>{RG[g.region]}</span>
                    {result&&<span style={{fontSize:15,fontWeight:700,color:"var(--green)"}}>✓ FINAL</span>}
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    {/* Team A */}
                    <div onClick={()=>{const m=prompt(`${g.a} wins by how many points? (Enter number, or leave blank to skip margin)`);markResult(g.key,g.a,m?parseInt(m)||null:null);}} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",textAlign:"center",
                      background:result===g.a?"rgba(47,189,96,0.1)":!result?"rgba(255,255,255,0.02)":"rgba(229,69,61,0.05)",
                      border:result===g.a?"1px solid rgba(47,189,96,0.25)":!result?"1px solid var(--b)":"1px solid rgba(229,69,61,0.12)",
                      transition:"all 0.15s"}}>
                      <div style={{fontSize:14,fontWeight:800,color:RC[ta?.r||g.region]}}>({ta?.s})</div>
                      <div style={{fontSize:26,fontWeight:result===g.a?900:600,color:result===g.a?"var(--green)":result?"var(--d)":"#fff"}}>{g.a}</div>
                      <div className="mn" style={{fontSize:14,color:"var(--d)",marginTop:2}}>{Math.round(wp*100)}%</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",fontSize:14,color:"var(--d)",fontWeight:800}}>VS</div>
                    {/* Team B */}
                    <div onClick={()=>{const m=prompt(`${g.b} wins by how many points? (Enter number, or leave blank to skip margin)`);markResult(g.key,g.b,m?parseInt(m)||null:null);}} style={{flex:1,padding:"8px",borderRadius:8,cursor:"pointer",textAlign:"center",
                      background:result===g.b?"rgba(47,189,96,0.1)":!result?"rgba(255,255,255,0.02)":"rgba(229,69,61,0.05)",
                      border:result===g.b?"1px solid rgba(47,189,96,0.25)":!result?"1px solid var(--b)":"1px solid rgba(229,69,61,0.12)",
                      transition:"all 0.15s"}}>
                      <div style={{fontSize:14,fontWeight:800,color:RC[tb?.r||g.region]}}>({tb?.s})</div>
                      <div style={{fontSize:26,fontWeight:result===g.b?900:600,color:result===g.b?"var(--green)":result?"var(--d)":"#fff"}}>{g.b}</div>
                      <div className="mn" style={{fontSize:14,color:"var(--d)",marginTop:2}}>{Math.round((1-wp)*100)}%</div>
                    </div>
                  </div>
                  {/* Margin display */}
                  {result&&margins[result]&&margins[result].wins.length>0&&(
                    <div style={{textAlign:"center",marginTop:4}}>
                      <span className="mn" style={{fontSize:14,color:"var(--m)"}}>Won by {margins[result].wins[margins[result].wins.length-1]} pts</span>
                      {margins[result].wins[margins[result].wins.length-1]>=20&&<span className="tag" style={{marginLeft:6,background:"rgba(47,189,96,0.1)",color:"var(--green)"}}>DOMINANT</span>}
                      {margins[result].wins[margins[result].wins.length-1]<=4&&<span className="tag" style={{marginLeft:6,background:"rgba(245,166,35,0.1)",color:"var(--orange)"}}>CLOSE CALL</span>}
                    </div>
                  )}
                  {/* Bracket pick check */}
                  {result&&(
                    <div style={{display:"flex",gap:12,marginTop:6}}>
                      {brackets.map((b,bi)=>{
                        const pick=b.picks[g.key];const correct=pick===result;
                        return(
                          <div key={bi} style={{flex:1,textAlign:"center",padding:"3px",borderRadius:6,background:!pick?"rgba(255,255,255,0.02)":correct?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${!pick?"var(--b)":correct?"var(--green)30":"var(--red)30"}`}}>
                            <div style={{fontSize:13,color:"var(--d)"}}>{b.name}</div>
                            <div style={{fontSize:15,fontWeight:700,color:!pick?"var(--d)":correct?"var(--green)":"var(--red)"}}>
                              {!pick?"—":correct?"✓":"✗"} {pick?pick.length>8?pick.slice(0,7)+"…":pick:""}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>

        {/* Next Round Predictions */}
        {(()=>{
          const roundGames=getGamesForRound(trkRound);
          const allDone=roundGames.length>0&&roundGames.every(g=>results[g.key]);
          if(!allDone||trkRound>=5)return null;
          const nextGames=getGamesForRound(trkRound+1);
          if(nextGames.length===0)return null;
          const nextLabel=["Round of 32","Sweet 16","Elite Eight","Final Four","Championship",""][trkRound+1];
          return(
            <div className="gl fu" style={{padding:18,background:"linear-gradient(135deg,rgba(139,92,246,0.04),rgba(59,130,246,0.04))",borderColor:"rgba(139,92,246,0.2)"}}>
              <div style={{fontSize:14,fontWeight:700,letterSpacing:1.5,color:"#7c8db5",textTransform:"uppercase",marginBottom:4}}>Auto-Predictions: {nextLabel}</div>
              <div style={{fontSize:13,color:"var(--m)",marginBottom:18,lineHeight:1.4}}>Based on actual results, here's who the model predicts for the next round:</div>
              {nextGames.map((g,i)=>{
                const pred=getGamePrediction(g.a,g.b);if(!pred)return null;
                return(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                    <div style={{width:4,height:28,borderRadius:2,background:RC[g.region]}}/>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:700}}>
                        <span style={{color:RC[g.region]}}>({T[g.a]?.s})</span> {g.a} vs <span style={{color:RC[g.region]}}>({T[g.b]?.s})</span> {g.b}
                      </div>
                      <div style={{fontSize:14,color:"var(--m)",marginTop:1}}>
                        {pred.reasons[0]}
                      </div>
                    </div>
                    <div style={{textAlign:"center",flexShrink:0}}>
                      <div style={{fontSize:16,fontWeight:900,color:pred.confColor}}>{pred.winner}</div>
                      <div className="mn" style={{fontSize:14,color:pred.confColor}}>{pred.winPct}%</div>
                    </div>
                  </div>
                );
              })}
              <button onClick={()=>setTrkRound(trkRound+1)} style={{width:"100%",marginTop:10,padding:"8px",borderRadius:8,fontSize:13,fontWeight:700,background:"rgba(139,92,246,0.12)",color:"#7c8db5",border:"1px solid rgba(139,92,246,0.25)",cursor:"pointer",fontFamily:"'DM Sans'"}}>
                Go to {nextLabel} →
              </button>
            </div>
          );
        })()}

        {/* Results management */}
        <div className="gl" style={{padding:16,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"var(--m)",letterSpacing:1}}>RESULTS LOGGED</div>
              <div className="mn" style={{fontSize:15,fontWeight:800}}>{Object.keys(results).length} / 63</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>{if(confirm("Clear all results? This cannot be undone."))saveResults({});}} style={{padding:"6px 12px",borderRadius:8,fontSize:14,fontWeight:700,background:"rgba(239,68,68,0.08)",color:"var(--red)",border:"1px solid rgba(239,68,68,0.2)",cursor:"pointer",fontFamily:"'DM Sans'"}}>Reset All</button>
            </div>
          </div>
          <div style={{fontSize:14,color:"var(--m)",marginTop:6,lineHeight:1.5}}>
            <b>Scoring:</b> R64=10pts · R32=20pts · S16=40pts · E8=80pts · F4=160pts · Final=320pts
          </div>
        </div>
      </div>)}

      </div>
    </div>
  );
}
