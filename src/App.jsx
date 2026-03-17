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
  const picks={};
  const regionChamps={};
  Object.entries(MO).forEach(([rk,matchups])=>{
    // R64
    const r1=matchups.map(([a,b],i)=>{
      const wp=getWP(a,b);const fav=wp>=0.5?a:b;const dog=wp>=0.5?b:a;
      const upProb=1-Math.max(wp,1-wp);
      let pick=fav;
      if(mode==="balanced"&&upProb>=0.30&&T[dog].s>=9&&T[dog].s<=12)pick=dog;
      if(mode==="balanced"&&upProb>=0.38&&T[dog].s>=10)pick=dog;
      if(mode==="chaos"&&upProb>=0.22)pick=dog;
      // Injury-driven upset intelligence
      if(mode!=="chalk"){
        if(dog==="VCU"&&T["UNC"].inj)pick=dog;
        if(dog==="Akron"&&T["Texas Tech"].inj?.includes("Toppin"))pick=dog;
        if(dog==="S. Florida"&&T["Louisville"].inj)pick=dog;
        if(dog==="Miami OH"&&T["Miami OH"].rec==="31-1"&&mode==="chaos")pick=dog;
        if(dog==="High Point"&&mode==="chaos")pick=dog;
        if(dog==="Saint Louis"&&T["Saint Louis"].rec==="28-5")pick=dog;
        if(dog==="Santa Clara"&&T["Santa Clara"].off>=70&&mode!=="chalk")pick=dog;
      }
      picks[`${rk}-0-${i}`]=pick;
      return pick;
    });
    // R32
    const r2=[];
    for(let i=0;i<r1.length;i+=2){
      const wp=getWP(r1[i],r1[i+1]);const fav=wp>=0.5?r1[i]:r1[i+1];const dog=wp>=0.5?r1[i+1]:r1[i];
      let pick=fav;
      if(mode==="balanced"&&(1-Math.max(wp,1-wp))>=0.38)pick=dog;
      if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.28)pick=dog;
      picks[`${rk}-1-${Math.floor(i/2)}`]=pick;
      r2.push(pick);
    }
    // S16
    const s16=[];
    for(let i=0;i<r2.length;i+=2){
      const wp=getWP(r2[i],r2[i+1]);const fav=wp>=0.5?r2[i]:r2[i+1];const dog=wp>=0.5?r2[i+1]:r2[i];
      let pick=fav;
      if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.35)pick=dog;
      picks[`${rk}-2-${Math.floor(i/2)}`]=pick;
      s16.push(pick);
    }
    // E8
    const wp=getWP(s16[0],s16[1]);const fav=wp>=0.5?s16[0]:s16[1];const dog=wp>=0.5?s16[1]:s16[0];
    let pick=fav;
    if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.38)pick=dog;
    picks[`${rk}-3-0`]=pick;
    regionChamps[rk]=pick;
  });
  // Final Four: East vs South, West vs Midwest
  const semi1A=regionChamps["E"],semi1B=regionChamps["S"];
  const semi2A=regionChamps["W"],semi2B=regionChamps["MW"];
  if(semi1A&&semi1B){
    const wp=getWP(semi1A,semi1B);const fav=wp>=0.5?semi1A:semi1B;const dog=wp>=0.5?semi1B:semi1A;
    let pick=fav;
    if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.40)pick=dog;
    picks["F4-0"]=pick;
  }
  if(semi2A&&semi2B){
    const wp=getWP(semi2A,semi2B);const fav=wp>=0.5?semi2A:semi2B;const dog=wp>=0.5?semi2B:semi2A;
    let pick=fav;
    if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.40)pick=dog;
    picks["F4-1"]=pick;
  }
  // Championship
  if(picks["F4-0"]&&picks["F4-1"]){
    const wp=getWP(picks["F4-0"],picks["F4-1"]);const fav=wp>=0.5?picks["F4-0"]:picks["F4-1"];const dog=wp>=0.5?picks["F4-1"]:picks["F4-0"];
    let pick=fav;
    if(mode==="chaos"&&(1-Math.max(wp,1-wp))>=0.42)pick=dog;
    picks["CHAMP"]=pick;
  }
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
    const t=T[val];if(!t)return;
    // Skip F4 and CHAMP keys for chalk/upset calculation
    if(key.startsWith("F4")||key==="CHAMP")return;
    total++;
    const parts=key.split("-");const round=parseInt(parts[1]);
    if(round===0){
      const rk=parts[0];const pi=parseInt(parts[2]);
      if(!MO[rk]||!MO[rk][pi])return;
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
  --acc:#1493ff;--acc2:#0f7ee0;--green:#2fbd60;--green2:#25a050;
  --red:#e5453d;--orange:#f5a623;--yellow:#ffd23f;
  --r:10px;--mw:840px;
}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:var(--bg);color:var(--t);-webkit-font-smoothing:antialiased;overflow-x:hidden}
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
button{transition:all 0.15s ease!important}
button:hover:not(:disabled){filter:brightness(1.15);transform:translateY(-1px)}
button:active:not(:disabled){transform:translateY(0px);filter:brightness(0.95)}
button:disabled{opacity:0.5;cursor:not-allowed!important}
@keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}
@keyframes notifPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}
.btn-primary{background:var(--acc)!important;color:#fff!important;border:none!important;font-weight:700!important;box-shadow:0 2px 8px rgba(20,147,255,0.2)}
.btn-primary:hover{box-shadow:0 4px 16px rgba(20,147,255,0.35)}
.btn-green{background:var(--green)!important;color:#000!important;border:none!important;font-weight:700!important;box-shadow:0 2px 8px rgba(47,189,96,0.2)}
.btn-green:hover{box-shadow:0 4px 16px rgba(47,189,96,0.35)}
.btn-red{background:var(--red)!important;color:#fff!important;border:none!important;font-weight:700!important;box-shadow:0 2px 8px rgba(229,69,61,0.2)}
.btn-red:hover{box-shadow:0 4px 16px rgba(229,69,61,0.35)}
.btn-outline{background:var(--s2)!important;color:#fff!important;border:1px solid var(--b2)!important;font-weight:600!important}
.btn-outline:hover{background:var(--s3)!important;border-color:rgba(255,255,255,0.2)!important}
@media(max-width:600px){
  .wrap{padding:0 10px!important}
  .gl{padding:12px!important}
  .resp-grid3{grid-template-columns:1fr!important}
  .resp-grid2{grid-template-columns:1fr!important}
  .resp-flex{flex-wrap:wrap!important}
  .resp-hide{display:none!important}
}
`;

export default function App(){
  const ALLOWED_BOOKS=["FanDuel","DraftKings"];
  const isAllowedBook=(name)=>ALLOWED_BOOKS.some(b=>name.toLowerCase().includes(b.toLowerCase()));
  
  // Exact mapping: Odds API team name → bracket team name
  // This eliminates ALL fuzzy matching. If a team isn't in this map, it's ignored.
  const API_TEAM_MAP={
    "Duke Blue Devils":"Duke","Siena Saints":"Siena",
    "Ohio State Buckeyes":"Ohio State","TCU Horned Frogs":"TCU",
    "St John's Red Storm":"St. John's","St. John's Red Storm":"St. John's","Saint John's Red Storm":"St. John's",
    "Northern Iowa Panthers":"N. Iowa",
    "Kansas Jayhawks":"Kansas","California Baptist Lancers":"Cal Baptist","Cal Baptist Lancers":"Cal Baptist",
    "Louisville Cardinals":"Louisville","South Florida Bulls":"S. Florida","USF Bulls":"S. Florida",
    "Michigan State Spartans":"Michigan St","Michigan St Spartans":"Michigan St",
    "North Dakota State Bison":"N. Dakota St","North Dakota St Bison":"N. Dakota St","NDSU Bison":"N. Dakota St",
    "UCLA Bruins":"UCLA","UCF Knights":"UCF",
    "UConn Huskies":"UConn","Connecticut Huskies":"UConn",
    "Furman Paladins":"Furman",
    "Arizona Wildcats":"Arizona","Long Island Sharks":"LIU","LIU Sharks":"LIU",
    "Villanova Wildcats":"Villanova","Utah State Aggies":"Utah State",
    "Wisconsin Badgers":"Wisconsin","High Point Panthers":"High Point",
    "Arkansas Razorbacks":"Arkansas","Hawaii Rainbow Warriors":"Hawaii","Hawai'i Rainbow Warriors":"Hawaii",
    "BYU Cougars":"BYU","NC State Wolfpack":"NC State",
    "Gonzaga Bulldogs":"Gonzaga","Kennesaw State Owls":"Kennesaw St","Kennesaw St Owls":"Kennesaw St",
    "Miami Hurricanes":"Miami FL","Miami (FL) Hurricanes":"Miami FL","Miami FL Hurricanes":"Miami FL",
    "Missouri Tigers":"Missouri",
    "Purdue Boilermakers":"Purdue","Queens Royals":"Queens NC","Queens NC Royals":"Queens NC",
    "Florida Gators":"Florida","Lehigh Mountain Hawks":"Lehigh",
    "Clemson Tigers":"Clemson","Iowa Hawkeyes":"Iowa",
    "Vanderbilt Commodores":"Vanderbilt","McNeese Cowboys":"McNeese","McNeese State Cowboys":"McNeese",
    "Nebraska Cornhuskers":"Nebraska","Troy Trojans":"Troy",
    "North Carolina Tar Heels":"UNC","UNC Tar Heels":"UNC",
    "VCU Rams":"VCU",
    "Illinois Fighting Illini":"Illinois","Penn Quakers":"Penn","Pennsylvania Quakers":"Penn",
    "Saint Mary's Gaels":"Saint Mary's","St. Mary's Gaels":"Saint Mary's",
    "Texas A&M Aggies":"Texas A&M",
    "Houston Cougars":"Houston","Idaho Vandals":"Idaho",
    "Michigan Wolverines":"Michigan","Howard Bison":"Howard",
    "Georgia Bulldogs":"Georgia","Saint Louis Billikens":"Saint Louis","St. Louis Billikens":"Saint Louis",
    "Texas Tech Red Raiders":"Texas Tech","Akron Zips":"Akron",
    "Alabama Crimson Tide":"Alabama","Hofstra Pride":"Hofstra",
    "Tennessee Volunteers":"Tennessee","Miami (OH) RedHawks":"Miami OH","Miami OH RedHawks":"Miami OH","Miami Ohio RedHawks":"Miami OH",
    "Virginia Cavaliers":"Virginia","Wright State Raiders":"Wright St","Wright St Raiders":"Wright St",
    "Kentucky Wildcats":"Kentucky","Santa Clara Broncos":"Santa Clara",
    "Iowa State Cyclones":"Iowa State","Tennessee State Tigers":"Tenn. State","Tennessee St Tigers":"Tenn. State",
  };
  // Reverse map for display: bracket name → possible API names
  const resolveAPIName=(apiName)=>API_TEAM_MAP[apiName]||null;
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
  const [liveScores,setLiveScores]=useState(null);
  const [autoPolling,setAutoPolling]=useState(false);
  const [lastScoreFetch,setLastScoreFetch]=useState(null);
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
  const [modal,setModal]=useState(null);
  const [toast,setToast]=useState(null);
  const [bracketNotif,setBracketNotif]=useState(false);
  const [liveOdds,setLiveOdds]=useState(null);
  const [oddsLoading,setOddsLoading]=useState(false);
  const [oddsUsage,setOddsUsage]=useState(null);
  const [parlayLegs,setParlayLegs]=useState(8);
  const [parlayType,setParlayType]=useState("auto");
  const [parlayBetTypes,setParlayBetTypes]=useState({ml:true,spread:false,total:false});
  const [parlayBook,setParlayBook]=useState("ALL");
  const [oddsHistory,setOddsHistory]=useState([]);
  const [parlays,setParlays]=useState(null);
  const [parlayLoading,setParlayLoading]=useState(false);

  useEffect(()=>{
    (()=>{try{const v=localStorage.getItem("mm26-br");if(v)setBrackets(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-sim");if(v)setSim(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-trk");if(v)setTracker(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-res");if(v)setResults(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-brief");if(v){const d=JSON.parse(v);if(Date.now()-d.ts<1800000)setBriefing(d);}}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-margins");if(v)setMargins(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-boosts");if(v)setBoosts(JSON.parse(v));}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-odds");if(v){const d=JSON.parse(v);if(Date.now()-d.ts<3600000){setLiveOdds(d.data);setOddsUsage(d.usage);}}}catch(e){}})();
    (()=>{try{const v=localStorage.getItem("mm26-odds-hist");if(v)setOddsHistory(JSON.parse(v));}catch(e){}})();
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
      const clean=txt.replace(/```json|```/g,"").replace(/<\/?antml:cite[^>]*>/g,"").replace(/<\/?cite[^>]*>/g,"").trim();
      // Strip any remaining HTML-like tags from all string values
      const stripTags=(obj)=>{if(!obj)return obj;if(typeof obj==="string")return obj.replace(/<[^>]+>/g,"").trim();if(Array.isArray(obj))return obj.map(stripTags);if(typeof obj==="object"){const r={};Object.entries(obj).forEach(([k,v])=>{r[k]=stripTags(v);});return r;}return obj;};
      const data={...stripTags(JSON.parse(clean)),ts:Date.now()};
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
  // Fetch live scores from The Odds API (free, fast, no AI tokens)
  const fetchLiveScores=useCallback(async(silent=false)=>{
    if(!silent){setFetchLoading(true);setFetchMsg("Fetching live scores...");}
    try{
      const res=await fetch("/api/scores?sport=basketball_ncaab&daysFrom=3");
      const data=await res.json();
      if(data.scores&&Array.isArray(data.scores)){
        setLiveScores(data.scores);
        setLastScoreFetch(new Date());
        if(data.usage)setOddsUsage(data.usage);
        
        // Fuzzy match team name to our database
        const matchTeam=(name)=>name?resolveAPIName(name):null;
        
        // Auto-import completed games
        let imported=0;
        const nr={...results};
        data.scores.forEach(game=>{
          if(!game.completed)return;
          const scores=game.scores;
          if(!scores||scores.length<2)return;
          // Determine winner
          const s0=parseInt(scores[0]?.score)||0;
          const s1=parseInt(scores[1]?.score)||0;
          const winnerName=s0>s1?game.home_team:game.away_team;
          const loserName=s0>s1?game.away_team:game.home_team;
          const margin=Math.abs(s0-s1);
          const winnerTeam=matchTeam(winnerName);
          const loserTeam=matchTeam(loserName);
          if(!winnerTeam||!loserTeam)return;
          
          // Find the matchup key in our bracket
          Object.entries(MO).forEach(([rk,matchups])=>{
            matchups.forEach(([a,b],mi)=>{
              if((a===winnerTeam&&b===loserTeam)||(b===winnerTeam&&a===loserTeam)){
                const key=`${rk}-0-${mi}`;
                if(!nr[key]){
                  nr[key]=winnerTeam;
                  imported++;
                  // Store margin
                  const nm={...margins};
                  if(!nm[key])nm[key]={wins:[]};
                  nm[key].wins.push(margin);
                  setMargins(nm);
                  try{localStorage.setItem("mm26-margins",JSON.stringify(nm));}catch(e){}
                }
              }
            });
          });
        });
        
        if(imported>0){
          saveResults(nr);
          // Recompute boosts
          const newBoosts=computeBoosts(margins);
          setBoosts(newBoosts);
          try{localStorage.setItem("mm26-boosts",JSON.stringify(newBoosts));}catch(e){}
          setFetchMsg(`${imported} new results imported. ${data.scores.filter(g=>!g.completed&&g.scores).length} games live.`);
        }else{
          const liveGames=data.scores.filter(g=>!g.completed&&g.scores&&g.scores.length>0);
          const completedGames=data.scores.filter(g=>g.completed);
          setFetchMsg(`${completedGames.length} completed, ${liveGames.length} live. No new results to import.`);
        }
      }else{
        setFetchMsg("No score data available. Games may not have started.");
      }
    }catch(e){
      setFetchMsg("Couldn't fetch scores. Check ODDS_API_KEY in Vercel settings.");
    }
    setFetchLoading(false);
  },[results,margins,saveResults]);

  // Auto-poll every 5 minutes when enabled
  useEffect(()=>{
    if(!autoPolling)return;
    const interval=setInterval(()=>fetchLiveScores(true),300000); // 5 min
    return()=>clearInterval(interval);
  },[autoPolling,fetchLiveScores]);

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
      const clean=txt.replace(/```json|```/g,"").replace(/<[^>]+>/g,"").trim();
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

  const showToast=useCallback((msg,actionLabel,action)=>{
    setToast({msg,actionLabel,action,id:Date.now()});
    setTimeout(()=>setToast(null),5000);
  },[]);

  // Export parlay as shareable image
  const exportParlay=useCallback((parlay)=>{
    const canvas=document.createElement("canvas");
    const ctx=canvas.getContext("2d");
    const w=600,legH=36,headerH=80,footerH=50,aiH=parlay.aiReasoning?50:0;
    const legs=parlay.legs||[];
    const h=headerH+aiH+(legs.length*legH)+footerH+20;
    canvas.width=w*2;canvas.height=h*2;ctx.scale(2,2); // 2x for retina
    
    // Background
    ctx.fillStyle="#0e1118";ctx.fillRect(0,0,w,h);
    
    // Accent bar
    const colorMap={"var(--acc)":"#1493ff","var(--green)":"#2fbd60","var(--orange)":"#f5a623","var(--red)":"#e5453d"};
    const accent=colorMap[parlay.color]||"#1493ff";
    ctx.fillStyle=accent;ctx.fillRect(0,0,4,h);
    
    // Header
    ctx.fillStyle="#ffffff";ctx.font="bold 18px 'DM Sans',sans-serif";
    ctx.fillText(parlay.name||"Parlay",16,30);
    ctx.fillStyle=accent;ctx.font="bold 12px 'IBM Plex Mono',monospace";
    ctx.fillText(parlay.payout?.american||"",16,50);
    ctx.fillStyle="rgba(255,255,255,0.4)";ctx.font="11px 'DM Sans',sans-serif";
    ctx.fillText(`${legs.length} legs · Hit rate: ${parlay.payout?.hitRate||"?"}% · $10 → $${Math.round((parlay.payout?.payout||0)/10+10)}`,16,68);
    
    // Tag
    ctx.fillStyle=accent+"30";
    ctx.fillRect(w-80,12,70,24);
    ctx.fillStyle=accent;ctx.font="bold 10px 'DM Sans',sans-serif";
    ctx.fillText(parlay.tag||"",w-70,28);
    
    // AI reasoning
    let y=headerH;
    if(parlay.aiReasoning){
      ctx.fillStyle="rgba(255,255,255,0.03)";ctx.fillRect(12,y,w-24,aiH-8);
      ctx.fillStyle=accent;ctx.font="bold 9px 'DM Sans',sans-serif";
      ctx.fillText("AI ANALYSIS",20,y+14);
      ctx.fillStyle="rgba(255,255,255,0.6)";ctx.font="11px 'DM Sans',sans-serif";
      const reason=parlay.aiReasoning.slice(0,90)+(parlay.aiReasoning.length>90?"...":"");
      ctx.fillText(reason,20,y+30);
      y+=aiH;
    }
    
    // Legs
    legs.forEach((leg,i)=>{
      const ly=y+(i*legH);
      // Separator
      if(i>0){ctx.fillStyle="rgba(255,255,255,0.04)";ctx.fillRect(16,ly,w-32,1);}
      // Number
      ctx.fillStyle="rgba(255,255,255,0.2)";ctx.font="bold 11px 'IBM Plex Mono',monospace";
      ctx.fillText(`${i+1}`,20,ly+22);
      // Pick
      ctx.fillStyle="#ffffff";ctx.font="bold 13px 'DM Sans',sans-serif";
      const pickName=leg.betType==="spread"?`${leg.winner} ${leg.spreadPoint>0?"+":""}${leg.spreadPoint}`:leg.betType==="total"?`${leg.totalSide} ${leg.totalPoint} (${leg.gameA||leg.winner} vs ${leg.gameB||leg.loser})`:leg.winner||"";
      ctx.fillText(pickName,42,ly+16);
      ctx.fillStyle="rgba(255,255,255,0.3)";ctx.font="11px 'DM Sans',sans-serif";
      const subText=leg.betType==="spread"?`vs ${leg.loser}`:leg.betType==="total"?"":(`over ${leg.loser||""}`);
      ctx.fillText(subText,42,ly+30);
      // Bet type badge
      if(leg.betType&&leg.betType!=="ml"){
        ctx.fillStyle=accent+"20";
        const badge=leg.betType==="spread"?"SPR":"TOT";
        ctx.fillRect(w-120,ly+6,28,16);
        ctx.fillStyle=accent;ctx.font="bold 8px 'DM Sans',sans-serif";
        ctx.fillText(badge,w-116,ly+17);
      }
      // Odds/confidence
      const confColor=leg.winPct>=80?"#2fbd60":leg.winPct>=65?"#1493ff":leg.winPct>=50?"#f5a623":"#e5453d";
      ctx.fillStyle=confColor;ctx.font="bold 14px 'IBM Plex Mono',monospace";
      const odds=leg.liveOdds!==null?`${leg.liveOdds>0?"+":""}${leg.liveOdds}`:`${leg.winPct}%`;
      ctx.fillText(odds,w-70,ly+20);
    });
    
    // Footer
    const fy=y+(legs.length*legH)+10;
    ctx.fillStyle="rgba(255,255,255,0.03)";ctx.fillRect(0,fy,w,footerH);
    ctx.fillStyle="rgba(255,255,255,0.25)";ctx.font="10px 'DM Sans',sans-serif";
    ctx.fillText("Generated by March Madness Bracket Intelligence · "+new Date().toLocaleDateString(),16,fy+20);
    ctx.fillText("Model-generated picks. Bet responsibly.",16,fy+36);
    
    // Download
    const link=document.createElement("a");
    link.download=`parlay-${(parlay.name||"picks").replace(/\s/g,"-").toLowerCase()}.png`;
    link.href=canvas.toDataURL("image/png");
    link.click();
    showToast("Parlay image saved to downloads");
  },[showToast]);

  // Fetch live odds from The Odds API
  const fetchLiveOdds=useCallback(async()=>{
    setOddsLoading(true);
    try{
      const res=await fetch("/api/odds?sport=basketball_ncaab&markets=h2h,spreads,totals&regions=us");
      const data=await res.json();
      if(data.odds&&Array.isArray(data.odds)){
        // Parse odds into a usable format
        const parsed={};
        data.odds.forEach(game=>{
          const home=game.home_team;const away=game.away_team;
          const bookmakers=(game.bookmakers||[]).filter(bk=>isAllowedBook(bk.title));
          const gameData={home,away,commence:game.commence_time,books:{}};
          bookmakers.forEach(bk=>{
            const h2h=bk.markets?.find(m=>m.key==="h2h");
            const spreads=bk.markets?.find(m=>m.key==="spreads");
            const totals=bk.markets?.find(m=>m.key==="totals");
            gameData.books[bk.title]={
              h2h:h2h?.outcomes?.reduce((a,o)=>({...a,[o.name]:o.price}),{})||{},
              spreads:spreads?.outcomes?.reduce((a,o)=>({...a,[o.name]:{price:o.price,point:o.point}}),{})||{},
              totals:totals?.outcomes?.reduce((a,o)=>({...a,[o.name]:{price:o.price,point:o.point}}),{})||{},
            };
          });
          // Match to our team database - require BOTH teams to be in our bracket
          const matchTeam=(name)=>resolveAPIName(name);
          const homeMatch=matchTeam(home);const awayMatch=matchTeam(away);
          // Only store if both teams are in our 68-team database
          if(homeMatch&&awayMatch){
            // Verify they actually play each other in our bracket
            let isRealMatchup=false;
            Object.values(MO).forEach(matchups=>{
              matchups.forEach(([a,b])=>{
                if((a===homeMatch&&b===awayMatch)||(a===awayMatch&&b===homeMatch))isRealMatchup=true;
              });
            });
            if(isRealMatchup){
              parsed[homeMatch]={...gameData,opponent:awayMatch};
              parsed[awayMatch]={...gameData,opponent:homeMatch};
            }
          }
        });
        setLiveOdds(parsed);
        setOddsUsage(data.usage);
        try{localStorage.setItem("mm26-odds",JSON.stringify({data:parsed,usage:data.usage,ts:Date.now()}));}catch(e){}
        // Save snapshot for line movement tracking
        const snapshot={ts:Date.now(),lines:{}};
        Object.entries(parsed).forEach(([team,gd])=>{
          const fb=Object.keys(gd.books)[0];if(!fb)return;
          const bk=gd.books[fb];
          const h2h=bk?.h2h||{};const spreads=bk?.spreads||{};
          Object.entries(h2h).forEach(([name,price])=>{
            const resolved=resolveAPIName(name);
            if(resolved)snapshot.lines[resolved]={ml:price,spread:Object.values(spreads)[0]?.point||null,book:fb};
          });
        });
        const hist=[...oddsHistory,snapshot].slice(-20); // Keep last 20 snapshots
        setOddsHistory(hist);
        try{localStorage.setItem("mm26-odds-hist",JSON.stringify(hist));}catch(e){}
        showToast(`Live odds loaded — ${data.odds.length} games from ${data.usage?.remaining||"?"} requests remaining`);
      }
    }catch(e){
      showToast("Could not fetch live odds — check your API key in Vercel settings");
    }
    setOddsLoading(false);
  },[showToast]);

  // Historical upset rates by seed matchup (for calibration)
  const SEED_UPSET_RATE={
    "1v16":0.01,"2v15":0.06,"3v14":0.15,"4v13":0.21,"5v12":0.35,"6v11":0.37,"7v10":0.39,"8v9":0.49
  };
  const getSeedMatchup=(sA,sB)=>{const hi=Math.min(sA,sB),lo=Math.max(sA,sB);return `${hi}v${lo}`;};
  
  // Calibrate model probability with historical seed data
  const calibrate=(modelProb,seedW,seedL)=>{
    const key=getSeedMatchup(seedW,seedL);
    const histRate=SEED_UPSET_RATE[key];
    if(!histRate)return modelProb;
    // If model says favorite wins, blend with historical rate
    const isFav=seedW<seedL;
    const histProb=isFav?(1-histRate):histRate;
    return modelProb*0.65+histProb*0.35; // 65% model, 35% history
  };

  // Build parlays using prediction engine + live odds + AI
  const buildParlays=useCallback(async()=>{
    setParlayLoading(true);setParlays(null);
    
    // Auto-fetch live odds if we don't have them
    let odds=liveOdds;
    if(!odds){
      try{
        const res=await fetch("/api/odds?sport=basketball_ncaab&markets=h2h,spreads,totals&regions=us");
        const data=await res.json();
        if(data.odds&&Array.isArray(data.odds)){
          const parsed={};
          data.odds.forEach(game=>{
            const bookmakers=(game.bookmakers||[]).filter(bk=>isAllowedBook(bk.title));
            const gameData={home:game.home_team,away:game.away_team,commence:game.commence_time,books:{}};
            bookmakers.forEach(bk=>{
              const h2h=bk.markets?.find(m=>m.key==="h2h");
              const spreads=bk.markets?.find(m=>m.key==="spreads");
              gameData.books[bk.title]={
                h2h:h2h?.outcomes?.reduce((a,o)=>({...a,[o.name]:o.price}),{})||{},
                spreads:spreads?.outcomes?.reduce((a,o)=>({...a,[o.name]:{price:o.price,point:o.point}}),{})||{},
              };
            });
            const matchTeam=(name)=>resolveAPIName(name);
            const hm=matchTeam(game.home_team);const am=matchTeam(game.away_team);
            // Only store if both teams match AND they play each other in our bracket
            if(hm&&am){
              let isReal=false;
              Object.values(MO).forEach(ms=>{ms.forEach(([a,b])=>{if((a===hm&&b===am)||(a===am&&b===hm))isReal=true;});});
              if(isReal){parsed[hm]={...gameData,opponent:am};parsed[am]={...gameData,opponent:hm};}
            }
          });
          odds=parsed;setLiveOdds(parsed);
          setOddsUsage(data.usage);
          try{localStorage.setItem("mm26-odds",JSON.stringify({data:parsed,usage:data.usage,ts:Date.now()}));}catch(e){}
        }
      }catch(e){/* proceed without live odds */}
    }

    // Helper: convert American odds to implied probability
    const americanToProb=(am)=>{if(!am||am===0)return null;return am>0?100/(am+100):Math.abs(am)/(Math.abs(am)+100);};
    // Helper: find best moneyline for a team — verifies opponent matches
    const findLiveLine=(teamName,expectedOpponent)=>{
      if(!odds)return null;
      const gameData=odds[teamName];
      if(!gameData)return null;
      if(expectedOpponent&&gameData.opponent&&gameData.opponent!==expectedOpponent)return null;
      let bestOdds=null;let bestBook=null;
      const booksToCheck=parlayBook==="ALL"?Object.entries(gameData.books):Object.entries(gameData.books).filter(([name])=>name===parlayBook);
      booksToCheck.forEach(([bookName,bk])=>{
        const h2h=bk.h2h||{};
        Object.entries(h2h).forEach(([name,price])=>{
          // Use exact map: resolve API name to bracket name and compare
          const resolved=resolveAPIName(name);
          if(resolved===teamName){
            if(bestOdds===null||price>bestOdds){bestOdds=price;bestBook=bookName;}
          }
        });
      });
      return bestOdds!==null?{american:bestOdds,implied:americanToProb(bestOdds),book:bestBook}:null;
    };

    // Gather all game predictions with live odds integration
    const allPreds=Object.entries(MO).flatMap(([rk,matchups])=>
      matchups.map(([a,b])=>{
        const rawWP=getWP(a,b,boosts);const winner=rawWP>=0.5?a:b;const loser=rawWP>=0.5?b:a;
        const rawConf=Math.max(rawWP,1-rawWP);
        const calConf=calibrate(rawConf,T[winner].s,T[loser].s);
        const ta=T[winner],tl=T[loser];
        const clash=getStyleClash(winner,loser);
        const injEdge=tl.inj?0.04:0;
        const momEdge=(ta.mom-tl.mom)/200;
        const clutchEdge=(ta.clutch-tl.clutch)/200;
        const tempoEdge=clash?.tempoGap>12?-0.03:0;
        const coachEdge=(ta.coach&&ta.exp>tl.exp)?0.02:0;
        const totalEdge=injEdge+momEdge+clutchEdge+tempoEdge+coachEdge;
        const finalConf=Math.min(0.97,Math.max(0.03,calConf+totalEdge));
        
        // Live odds integration
        const live=findLiveLine(winner,loser);
        const liveLoser=findLiveLine(loser,winner);
        const vegasImpl=live?live.implied:null;
        const ev=vegasImpl?(finalConf-vegasImpl):0;
        const hasLive=!!live;
        
        // Get spread and total data — only if game matches our bracket matchup
        let spreadData=null,totalData=null;
        if(odds){
          const gd=odds[winner];
          // Verify the stored game is actually winner vs loser
          if(gd&&(!gd.opponent||gd.opponent===loser)){
            const fb=parlayBook==="ALL"?Object.keys(gd.books)[0]:gd.books[parlayBook]?parlayBook:Object.keys(gd.books)[0];
            if(fb){
              const bk=gd.books[fb];
              const sp=bk?.spreads||{};const tot=bk?.totals||{};
              Object.entries(sp).forEach(([name,data])=>{
                const resolved=resolveAPIName(name);
                if(resolved===winner){
                  spreadData={point:data.point,price:data.price,book:fb};
                }
              });
              const overData=Object.entries(tot).find(([k])=>k.toLowerCase()==="over");
              const underData=Object.entries(tot).find(([k])=>k.toLowerCase()==="under");
              if(overData)totalData={over:{point:overData[1].point,price:overData[1].price},under:underData?{point:underData[1].point,price:underData[1].price}:null,book:fb};
            }
          }
        }
        
        return{
          winner,loser,conf:finalConf,rawConf,winPct:Math.round(finalConf*100),
          betType:"ml",
          region:rk,regionName:RG[rk],seedW:ta.s,seedL:tl.s,
          style:ta.style,defStyle:ta.defStyle,
          injury:tl.inj||"",injW:ta.inj||"",
          momentum:ta.mom,clutch:ta.clutch,sos:ta.sos,
          tempoGap:clash?.tempoGap||0,totalEdge,
          note:ta.note?.slice(0,80)||"",
          liveOdds:live?.american||null,liveBook:live?.book||null,
          vegasImpl,ev,hasLive,loserOdds:liveLoser?.american||null,
          spreadData,totalData,
          tags:[
            ev>0.05?"+"+(ev*100).toFixed(0)+"% EV":"",
            tl.inj?"INJURY EDGE":"",
            ta.mom>=80?"HOT":"",
            ta.clutch>=80?"CLUTCH":"",
            ta.s<=2?"TOP SEED":"",
            clash?.tempoGap>12?"TEMPO CLASH":"",
            ta.sos>=70?"BATTLE TESTED":"",
          ].filter(Boolean)
        };
      })
    ).sort((a,b)=>b.conf-a.conf);

    // Generate spread legs — use live data if available, otherwise estimate from model
    const spreadLegs=parlayBetTypes.spread?allPreds.map(p=>{
      const sd=p.spreadData;
      // Estimate spread from win probability if no live data
      const estSpread=sd?sd.point:Math.round((p.conf-0.5)*-30*10)/10; // rough: 60%→-3, 75%→-7.5, 90%→-12
      const estPrice=sd?sd.price:-110;
      const estBook=sd?sd.book:null;
      const isFav=estSpread<0;
      return{
        ...p,betType:"spread",
        betLabel:`${p.winner} ${estSpread>0?"+":""}${estSpread}`,
        spreadPoint:estSpread,
        liveOdds:sd?estPrice:null,liveBook:estBook,
        conf:isFav?Math.max(0.3,p.conf-0.08):Math.min(0.95,p.conf+0.05),
        winPct:isFav?Math.max(30,p.winPct-8):Math.min(95,p.winPct+5),
        tags:[...p.tags.filter(t=>t!=="SPREAD"),"SPREAD"]
      };
    }):[];

    // Generate total legs — use live data if available, otherwise estimate from tempo
    const totalLegs=parlayBetTypes.total?allPreds.map(p=>{
      const td=p.totalData;
      const wTempo=T[p.winner]?.tempo||65;
      const lTempo=T[p.loser]?.tempo||65;
      const avgTempo=wTempo+lTempo;
      const isOver=avgTempo>130;
      // Estimate total from tempo if no live data: avg D1 game ~140, tempo adjusts
      const estTotal=td?.over?.point||Math.round(120+(avgTempo-120)*0.4);
      const estPrice=td?(isOver?td.over?.price:td.under?.price):null;
      const estBook=td?td.book:null;
      // Confidence: strong tempo signals = higher conf
      const tempoConf=Math.abs(avgTempo-130)>15?0.60:0.52;
      return{
        ...p,betType:"total",
        betLabel:`${isOver?"Over":"Under"} ${estTotal}`,
        totalPoint:estTotal,totalSide:isOver?"Over":"Under",
        gameA:p.winner,gameB:p.loser,
        liveOdds:estPrice,liveBook:estBook,
        conf:tempoConf,winPct:Math.round(tempoConf*100),
        tags:["TOTAL",avgTempo>140?"FAST PACE":"SLOW PACE",Math.abs(avgTempo-130)>15?"STRONG SIGNAL":""]
      };
    }).filter(p=>p.tags.some(t=>t)):[];

    // Build the leg pool based on selected bet types
    const mlLegs=parlayBetTypes.ml?allPreds:[];
    const allLegs=[...mlLegs,...spreadLegs,...totalLegs];

    // Calculate combined payout using REAL odds when available, model odds as fallback
    const calcPayout=(legs)=>{
      let combined=1;
      let allLive=true;
      legs.forEach(l=>{
        if(l.liveOdds!==null){
          // Use real sportsbook decimal odds
          const am=l.liveOdds;
          const decimal=am>0?(1+am/100):(1+100/Math.abs(am));
          combined*=decimal;
        }else{
          allLive=false;
          // Fallback: model probability with juice
          const juicedProb=Math.min(0.95,l.conf*1.05);
          combined*=(1/juicedProb);
        }
      });
      const hitRate=legs.reduce((a,l)=>a*l.conf,1)*100;
      const american=combined>=2?`+${Math.round((combined-1)*100)}`:`${Math.round(-100/(combined-1))}`;
      const liveCount=legs.filter(l=>l.liveOdds!==null).length;
      return{decimal:combined,american,payout:Math.round((combined-1)*100),hitRate:hitRate.toFixed(3),liveCount,totalLegs:legs.length,allLive};
    };

    const dedupe=(legs)=>{
      const seen=new Set();
      return legs.filter(l=>{
        const game=`${l.winner}-${l.loser}`;const gameR=`${l.loser}-${l.winner}`;
        if(seen.has(game)||seen.has(gameR))return false;
        seen.add(game);return true;
      });
    };

    // Strategy 1: LOCKS — top confidence from all enabled bet types
    const locks=dedupe(allLegs.filter(p=>p.winPct>=60).sort((a,b)=>b.conf-a.conf)).slice(0,parlayLegs);
    
    // Strategy 2: BALANCED — mixed bet types across regions
    const byRegion={};allLegs.forEach(p=>{const r=p.region||"X";if(!byRegion[r])byRegion[r]=[];byRegion[r].push(p);});
    const perRegion=Math.ceil(parlayLegs/4);
    const balanced=dedupe(Object.values(byRegion).flatMap(rPreds=>{
      const hi=rPreds.filter(p=>p.winPct>=70).slice(0,Math.ceil(perRegion*0.4));
      const mid=rPreds.filter(p=>p.winPct>=55&&p.winPct<70).slice(0,Math.ceil(perRegion*0.3));
      const mix=rPreds.filter(p=>p.betType!=="ml").slice(0,Math.ceil(perRegion*0.3));
      return[...hi,...mid,...mix];
    })).slice(0,parlayLegs);
    
    // Strategy 3: +EV PARLAY — prioritize positive expected value legs across all bet types
    const evSorted=[...allLegs].filter(p=>p.winPct>=40).sort((a,b)=>{
      // Primary sort: +EV legs first (model beats Vegas)
      const evA=a.ev||0,evB=b.ev||0;
      if(evA>0.03&&evB<=0.03)return -1;
      if(evB>0.03&&evA<=0.03)return 1;
      // Secondary: total edge score
      return(b.totalEdge+evB)-(a.totalEdge+evA);
    });
    const moonshot=dedupe(evSorted).slice(0,parlayLegs);

    const hasAnyLive=allLegs.some(p=>p.hasLive);
    const localParlays={
      locks:{name:"Locks Parlay",desc:`${parlayLegs} highest-confidence picks`,color:"var(--acc)",tag:"SAFE",legs:locks,payout:calcPayout(locks)},
      balanced:{name:"Balanced Parlay",desc:"Spread across all 4 regions",color:"var(--green)",tag:"SMART",legs:balanced,payout:calcPayout(balanced)},
      moonshot:{name:hasAnyLive?"+EV Parlay":"Edge Parlay",desc:hasAnyLive?"Model beats Vegas on these lines":"Best edge scores from analytics",color:"var(--orange)",tag:hasAnyLive?"+EV":"EDGE",legs:moonshot,payout:calcPayout(moonshot)},
    };

    // AI mode
    if(parlayType==="auto"){
      const betTypeLabels=[];
      if(parlayBetTypes.ml)betTypeLabels.push("Moneyline");
      if(parlayBetTypes.spread)betTypeLabels.push("Spread");
      if(parlayBetTypes.total)betTypeLabels.push("Over/Under Totals");
      const betTypeStr=betTypeLabels.join(", ");
      const topLegs=allLegs.sort((a,b)=>b.conf-a.conf).slice(0,30);
      const gameData=topLegs.map(p=>{
        if(p.betType==="spread")return`SPREAD: ${p.winner} ${p.spreadPoint>0?"+":""}${p.spreadPoint} vs ${p.loser}: ${p.winPct}%conf, ${p.regionName||""}${p.liveOdds?", line:"+p.liveOdds:""}`;
        if(p.betType==="total")return`TOTAL: ${p.totalSide} ${p.totalPoint} (${p.gameA} vs ${p.gameB}): ${p.winPct}%conf${p.liveOdds?", line:"+p.liveOdds:""}`;
        let line=`ML: ${p.winner}(${p.seedW}) over ${p.loser}(${p.seedL}): ${p.winPct}%conf, ${p.regionName}, edge:${(p.totalEdge*100).toFixed(1)}%`;
        if(p.hasLive)line+=`, LIVE:${p.liveOdds>0?"+":""}${p.liveOdds}@${p.liveBook}`;
        return line;
      }).join("\n");
      const prompt=`You are an elite sports betting analyst. Build NCAA tournament parlays.

ALLOWED BET TYPES: ${betTypeStr}
${!parlayBetTypes.ml?"IMPORTANT: Do NOT include any Moneyline bets. ONLY use "+betTypeStr+".":""}

Available legs:
${gameData}

Build three ${parlayLegs}-leg parlays using ONLY these bet types: ${betTypeStr}
1. LOCKS: Safest to hit
2. BALANCED: Mix across regions
3. +EV VALUE: Best edges

Rules: never both sides of same game, spread across regions, 1-sentence rationale per leg.

JSON only, no markdown:
{"locks":{"reasoning":"Why safe","legs":[{"pick":"Team","over":"Opponent","betType":"ml","spreadPoint":null,"totalPoint":null,"totalSide":null,"conf":85,"rationale":"reason"}]},"balanced":{"reasoning":"Strategy","legs":[same format]},"moonshot":{"reasoning":"EV","legs":[same format]}}
betType must be: ${betTypeLabels.map(b=>b==="Moneyline"?"ml":b==="Spread"?"spread":"total").join(" or ")}. EXACTLY ${parlayLegs} legs per parlay.`;
      try{
        const res=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:3000,messages:[{role:"user",content:prompt}]})});
        const d=await res.json();
        const txt=d.content?.filter(b=>b.type==="text").map(b=>b.text).join("")||"";
        const clean=txt.replace(/```json|```/g,"").replace(/<[^>]+>/g,"").trim();
        const aiData=JSON.parse(clean);
        ["locks","balanced","moonshot"].forEach(key=>{
          if(aiData[key]?.legs){
            localParlays[key].aiReasoning=aiData[key].reasoning;
            localParlays[key].legs=aiData[key].legs.map(l=>{
              const bt=l.betType||"ml";
              const pred=allPreds.find(p=>p.winner===l.pick||p.loser===l.pick)||{};
              if(bt==="spread"){
                return{...pred,betType:"spread",winner:l.pick,loser:l.over,
                  spreadPoint:l.spreadPoint||pred.spreadData?.point||-3,
                  conf:(l.conf||60)/100,winPct:l.conf||60,
                  liveOdds:pred.spreadData?.price||null,liveBook:pred.spreadData?.book||null,
                  aiRationale:l.rationale,region:pred.region||"",tags:["SPREAD",...(pred.tags||[]).filter(t=>t!=="SPREAD")]};
              }else if(bt==="total"){
                return{...pred,betType:"total",
                  totalSide:l.totalSide||"Over",totalPoint:l.totalPoint||145,
                  gameA:pred.winner||l.pick,gameB:pred.loser||l.over,
                  winner:l.totalSide||"Over",loser:l.totalSide==="Over"?"Under":"Over",
                  conf:(l.conf||55)/100,winPct:l.conf||55,
                  liveOdds:null,liveBook:null,
                  aiRationale:l.rationale,region:pred.region||"",tags:["TOTAL"]};
              }else{
                return pred.winner?{...pred,aiRationale:l.rationale}:{winner:l.pick,loser:l.over,conf:(l.conf||70)/100,winPct:l.conf||70,aiRationale:l.rationale,betType:"ml",region:"",tags:[],liveOdds:null,ev:0};
              }
            });
            localParlays[key].payout=calcPayout(localParlays[key].legs);
          }
        });
      }catch(e){/* fallback to local */}
    }
    
    setParlays(localParlays);
    setParlayLoading(false);
  },[parlayLegs,parlayType,parlayBetTypes,parlayBook,boosts,liveOdds]);
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
      setAiRes(JSON.parse(txt.replace(/```json|```/g,"").replace(/<[^>]+>/g,"").trim()));
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

  const TABS=[{id:"brief",l:"BRIEFING"},{id:"predict",l:"PICKS"},{id:"parlay",l:"PARLAY"},{id:"sim",l:"SIMULATE"},{id:"bracket",l:"BRACKET"},{id:"autogen",l:"AUTO-GEN"},{id:"value",l:"VALUE"},{id:"clash",l:"MATCHUPS"},{id:"players",l:"PLAYERS"},{id:"conf",l:"CONF"},{id:"tracker",l:"TRACKER"}];

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
        <div className="wrap" style={{display:"flex",flexWrap:"wrap",gap:0,padding:"0 12px"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="bracket")setBracketNotif(false);}} style={{
              flex:"1 0 auto",padding:"10px 10px",fontSize:11,fontWeight:700,letterSpacing:0.4,
              background:"transparent",color:tab===t.id?"#fff":"var(--m)",
              borderBottom:tab===t.id?"2px solid var(--acc)":"2px solid transparent",
              border:"none",borderTop:"none",borderLeft:"none",borderRight:"none",
              cursor:"pointer",fontFamily:"'DM Sans'",whiteSpace:"nowrap",transition:"color 0.12s",
              position:"relative"
            }}>
              {t.l}
              {t.id==="bracket"&&bracketNotif&&(
                <span style={{position:"absolute",top:6,right:2,width:8,height:8,borderRadius:"50%",background:"var(--acc)",boxShadow:"0 0 6px var(--acc)",animation:"notifPulse 1s ease infinite"}}/>
              )}
            </button>
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
                  <button onClick={generateBriefing} disabled={briefLoading} className="btn-outline" style={{padding:"6px 14px",borderRadius:7,fontSize:12,fontFamily:"'DM Sans'",cursor:"pointer"}}>
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
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>Key Updates</div>
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
              <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>Bracket Analysis</div>
              <div style={{fontSize:14,color:"var(--t2)",lineHeight:1.6,marginBottom:18}}>{briefing.bracket_analysis}</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}} className="resp-grid3">
                {brackets.map((b,i)=>{
                  let cor=0,wrg=0,pts=0;const rp={0:10,1:20,2:40,3:80,4:160,5:320};
                  Object.entries(b.picks).forEach(([k,pk])=>{const rd=parseInt(k.split("-")[1]);if(results[k]){if(results[k]===pk){cor++;pts+=(rp[rd]||10);}else wrg++;}});
                  const total=Object.keys(b.picks).length;const filled=total>=63;
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
                <div style={{fontSize:15,fontWeight:700,color:"var(--red)",marginBottom:10}}>Danger Alerts</div>
                {briefing.danger_alerts.map((alert,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"4px 0",borderBottom:i<briefing.danger_alerts.length-1?"1px solid var(--b)":"none"}}>{alert}</div>
                ))}
              </div>
            )}

            {/* Today's Games */}
            {briefing.todays_games&&briefing.todays_games.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>Today's Games</div>
                {briefing.todays_games.map((game,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.todays_games.length-1?"1px solid var(--b)":"none"}}>{game}</div>
                ))}
              </div>
            )}

            {/* Today's Games */}
            {briefing.todays_games&&briefing.todays_games.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff",marginBottom:10}}>Today's Games</div>
                {briefing.todays_games.map((game,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.todays_games.length-1?"1px solid var(--b)":"none"}}>{game}</div>
                ))}
              </div>
            )}

            {/* Performance Flags — from AI */}
            {briefing.performance_flags&&briefing.performance_flags.length>0&&(
              <div className="gl fu" style={{padding:18,marginBottom:18,borderLeft:"3px solid var(--green)"}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--green)",marginBottom:10}}>Performance Tracker</div>
                {briefing.performance_flags.map((flag,i)=>(
                  <div key={i} style={{fontSize:14,color:"var(--t2)",lineHeight:1.5,padding:"5px 0",borderBottom:i<briefing.performance_flags.length-1?"1px solid var(--b)":"none"}}>{flag}</div>
                ))}
              </div>
            )}

            {/* Live Odds Shifts — from AI + local data */}
            {(briefing.odds_movement&&briefing.odds_movement.length>0||oddsShifts.length>0)&&(
              <div className="gl fu" style={{padding:18,marginBottom:18}}>
                <div style={{fontSize:15,fontWeight:700,color:"var(--acc)",marginBottom:10}}>Title Odds Movement</div>
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
            <button onClick={generateBriefing} className="btn-primary" style={{padding:"14px 32px",borderRadius:8,fontSize:15,fontFamily:"'DM Sans'",cursor:"pointer"}}>
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
                <div key={i} className="gl" style={{padding:16,marginBottom:12,borderLeft:`3px solid ${pred.confColor}`}}>
                  {/* Matchup header */}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12,gap:12,flexWrap:"wrap"}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"baseline",gap:4,marginBottom:4,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,fontWeight:800,color:RC[rk]}}>({T[a].s})</span>
                        <span style={{fontSize:15,fontWeight:pred.winner===a?900:500,color:pred.winner===a?"#fff":"var(--m)"}}>{a}</span>
                        <span style={{fontSize:13,color:"var(--d)"}}>vs</span>
                        <span style={{fontSize:13,fontWeight:800,color:RC[rk]}}>({T[b].s})</span>
                        <span style={{fontSize:15,fontWeight:pred.winner===b?900:500,color:pred.winner===b?"#fff":"var(--m)"}}>{b}</span>
                      </div>
                      <div style={{fontSize:12,color:"var(--m)"}}>{T[a].rec} {T[a].c} vs {T[b].rec} {T[b].c}</div>
                    </div>
                    <div style={{flexShrink:0}}>
                      <div style={{fontSize:11,fontWeight:700,letterSpacing:0.5,color:pred.confColor,padding:"4px 10px",borderRadius:5,background:`${pred.confColor}15`,border:`1px solid ${pred.confColor}30`,whiteSpace:"nowrap"}}>{pred.conf}</div>
                    </div>
                  </div>

                  {/* Pick */}
                  <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",borderRadius:8,background:"rgba(255,255,255,0.03)",marginBottom:12}}>
                    <div style={{width:40,height:40,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",background:`${pred.confColor}15`,border:`1px solid ${pred.confColor}30`,flexShrink:0}}>
                      <span className="mn" style={{fontSize:15,fontWeight:800,color:pred.confColor}}>{pred.winPct}</span>
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:15,fontWeight:900,color:"#fff"}}>PICK: {pred.winner}</div>
                      <div style={{fontSize:12,color:"var(--m)"}}>({T[pred.winner].s}) seed · {T[pred.winner].rec} · {T[pred.winner].c}</div>
                    </div>
                    <div style={{fontSize:13,color:pred.confColor,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{pred.winPct}% WIN</div>
                  </div>

                  {/* Reasoning */}
                  <div style={{marginBottom:pred.upsetAngle?6:0}}>
                    {pred.reasons.map((r,ri)=>(
                      <div key={ri} style={{display:"flex",gap:5,padding:"3px 0"}}>
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
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:6}}>
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
            {mode:"chalk",name:"Chalk",desc:"Always pick the favorite. Safest bracket — maximizes correct picks in early rounds. Best for small pools.",color:"var(--acc)",btnClass:"btn-primary",upsets:"0-2 upsets"},
            {mode:"balanced",name:"Balanced",desc:"Smart upsets only — targets games with real edges: injuries, under-seeding, style mismatches. Best for 10-50 person pools.",color:"var(--green)",btnClass:"btn-green",upsets:"5-8 upsets"},
            {mode:"chaos",name:"Upset Heavy",desc:"Maximum chaos — picks every live upset, targets Cinderellas, fades injured teams. Best for 100+ person pools.",color:"var(--red)",btnClass:"btn-red",upsets:"12-18 upsets"},
          ].map(({mode,name,desc,color,btnClass,upsets})=>(
            <div key={mode} className="gl" style={{padding:18,borderLeft:`3px solid ${color}`}}>
              <div style={{marginBottom:14}}>
                <div style={{fontSize:15,fontWeight:700,color:"#fff"}}>{name}</div>
                <div style={{fontSize:13,color:"var(--m)",lineHeight:1.5,marginTop:5}}>{desc}</div>
                <div className="mn" style={{fontSize:13,color,fontWeight:600,marginTop:6}}>{upsets}</div>
              </div>
              <button className={btnClass} onClick={()=>{
                const newPicks=generateBracket(mode);
                const nb=[...brackets];
                const targetIdx=mode==="chalk"?0:mode==="balanced"?1:2;
                nb[targetIdx]={...nb[targetIdx],picks:newPicks};
                save(nb);
                setBracketNotif(true);
                showToast(`${name} bracket generated — ${Object.keys(newPicks).length} picks`,"View Bracket",()=>{setTab("bracket");setBIdx(targetIdx);setBracketNotif(false);});
              }} style={{width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontFamily:"'DM Sans'",cursor:"pointer",letterSpacing:0.2}}>
                Generate {name} Bracket
              </button>
            </div>
          ))}
        </div>

        {/* Generate All */}
        <div className="gl" style={{padding:20,marginBottom:20,textAlign:"center",background:"linear-gradient(135deg,rgba(157,122,255,0.04),rgba(74,158,255,0.04))"}}>
          <div style={{fontSize:13,fontWeight:800,marginBottom:6,letterSpacing:-0.2}}>Generate All 3 Brackets</div>
          <p style={{fontSize:13,color:"var(--m)",marginBottom:20}}>Fill Chalk, Balanced, and Upset Heavy simultaneously — ready for any pool.</p>
          <button className="btn-primary" onClick={()=>{
            const nb=[
              {name:"Chalk",picks:generateBracket("chalk")},
              {name:"Balanced",picks:generateBracket("balanced")},
              {name:"Upset Heavy",picks:generateBracket("chaos")},
            ];
            save(nb);
            setBracketNotif(true);
            showToast("All 3 brackets generated — Chalk, Balanced, and Upset Heavy ready","View Brackets",()=>{setTab("bracket");setBracketNotif(false);});
          }} style={{padding:"14px 40px",borderRadius:8,fontSize:14,fontFamily:"'DM Sans'",cursor:"pointer",letterSpacing:0.2}}>
            Generate All 3
          </button>
        </div>

        {/* Preview generated brackets */}
        <div style={{fontSize:14,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Current Bracket Status</div>
        {brackets.map((b,bi)=>{
          const total=Object.keys(b.picks).length;const score=getBracketScore(b.picks);
          // Get regional champs
          const champs=Object.entries(RG).map(([rk,rn])=>{const k=`${rk}-3-0`;return{reg:rn,team:b.picks[k]||null,color:RC[rk]};});
          return(
            <div key={bi} className="gl" style={{padding:16,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,gap:8,flexWrap:"wrap"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:15,fontWeight:800}}>{b.name}</span>
                  {score&&<span style={{fontSize:11,fontWeight:700,color:score.color,padding:"3px 8px",borderRadius:5,background:`${score.color}12`,whiteSpace:"nowrap"}}>{score.profile}</span>}
                </div>
                <span className="mn" style={{fontSize:13,color:total>=63?"var(--green)":"var(--m)",whiteSpace:"nowrap",marginLeft:8}}>{total}/63</span>
              </div>
              {total>0&&(
                <div style={{marginTop:8}}>
                  <div style={{display:"flex",gap:4,marginBottom:6}}>
                    {champs.map((ch,ci)=>(
                      <div key={ci} style={{flex:1,textAlign:"center",padding:"6px 4px",borderRadius:6,background:"rgba(255,255,255,0.02)",overflow:"hidden",border:`1px solid ${ch.color}20`}}>
                        <div style={{fontSize:11,color:ch.color,fontWeight:700}}>{ch.reg}</div>
                        <div style={{fontSize:13,fontWeight:800,color:ch.team?"#fff":"var(--d)"}}>{ch.team||"—"}</div>
                      </div>
                    ))}
                  </div>
                  {/* F4 and Champion */}
                  {b.picks["F4-0"]&&b.picks["F4-1"]&&(
                    <div style={{display:"flex",gap:4}}>
                      <div style={{flex:1,textAlign:"center",padding:"6px 4px",borderRadius:6,background:"rgba(255,255,255,0.02)",overflow:"hidden",border:"1px solid var(--b)"}}>
                        <div style={{fontSize:10,color:"var(--m)"}}>Semi 1</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{b.picks["F4-0"]}</div>
                      </div>
                      <div style={{flex:1,textAlign:"center",padding:"6px 4px",borderRadius:6,background:"rgba(255,255,255,0.02)",overflow:"hidden",border:"1px solid var(--b)"}}>
                        <div style={{fontSize:10,color:"var(--m)"}}>Semi 2</div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{b.picks["F4-1"]}</div>
                      </div>
                      {b.picks["CHAMP"]&&(
                        <div style={{flex:1,textAlign:"center",padding:"6px 4px",borderRadius:6,overflow:"hidden",background:"rgba(20,147,255,0.06)",border:"1px solid rgba(20,147,255,0.2)"}}>
                          <div style={{fontSize:10,color:"var(--acc)"}}>Champion</div>
                          <div style={{fontSize:12,fontWeight:800,color:"var(--acc)"}}>{b.picks["CHAMP"]}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Injury-driven picks */}
        <div className="gl" style={{padding:18,marginTop:8}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--t2)",marginBottom:20}}>INJURY-DRIVEN UPSET INTELLIGENCE</div>
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
              <button key={n} onClick={()=>doSim(n)} className="btn-primary" style={{padding:"11px 22px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>{(n/1000)}k</button>
            ))}
          </div>
        </div>

        {simR&&(<>
          <div className="gl fu" style={{padding:18,marginBottom:20}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:20}}>
              <span style={{fontSize:14,fontWeight:700,color:"var(--t2)"}}>Championship Win %</span>
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
            <div style={{fontSize:14,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Final Four Rates — Top 12</div>
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
            <div style={{fontSize:14,fontWeight:700,color:"var(--t2)",marginBottom:20}}>First-Round Upset Alerts</div>
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
          <div className="gl" style={{padding:14,marginBottom:18,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
            <div>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Bracket Profile</div>
              <div style={{fontSize:13,color:"var(--m)",marginTop:2}}>
                {bScore.chalk} chalk / {bScore.upsets} upsets of {bScore.total} picks · {Math.round(bScore.chalkPct*100)}% favorites
              </div>
            </div>
            <div style={{padding:"6px 14px",borderRadius:6,background:`${bScore.color}15`,border:`1px solid ${bScore.color}30`,whiteSpace:"nowrap"}}>
              <span style={{fontSize:13,fontWeight:800,color:bScore.color,letterSpacing:0.5}}>{bScore.profile}</span>
            </div>
          </div>
        )}

        {/* Region tabs */}
        <div style={{display:"flex",gap:12,marginBottom:18}}>
          {Object.entries(RG).map(([k,v])=>(
            <button key={k} onClick={()=>setReg(k)} style={{flex:1,padding:"8px",borderRadius:8,fontSize:12,fontWeight:700,background:reg===k?RC[k]:"var(--s)",color:reg===k?"#000":"var(--m)",border:reg===k?"none":"1px solid var(--b)",cursor:"pointer",fontFamily:"'DM Sans'",transition:"all 0.15s",letterSpacing:0.2}}>{v}</button>
          ))}
        </div>

        {/* Bracket grid — horizontal columns */}
        <div style={{overflowX:"auto",WebkitOverflowScrolling:"touch",paddingBottom:12}}>
          <div style={{display:"flex",gap:8,minWidth:620}}>
            {["R64","R32","S16","E8"].map((label,ri)=>{
              const teams=ri===0?MO[reg].flat():getAdv(reg,ri);
              const pairs=[];for(let i=0;i<teams.length;i+=2)pairs.push([teams[i],teams[i+1]]);
              return(
                <div key={ri} style={{display:"flex",flexDirection:"column",justifyContent:"space-around",minWidth:140,gap:3,flexShrink:0}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--m)",textAlign:"center",padding:"0 0 4px"}}>{label}</div>
                  {pairs.map(([a,b],pi)=>{
                    const key=`${reg}-${ri}-${pi}`;const picked=brackets[bIdx].picks[key];
                    return(
                      <div key={pi} style={{display:"flex",flexDirection:"column",justifyContent:"center",flex:1,gap:1}}>
                        {[a,b].map((tm,ti)=>{
                          if(!tm)return <div key={ti} style={{height:30,background:"rgba(255,255,255,0.015)",borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"var(--d)"}}>—</div>;
                          const t=T[tm];const other=ti===0?b:a;const wp=other?getWP(tm,other):1;const sel=picked===tm;
                          return(
                            <div key={ti} onClick={()=>pick(key,tm)} style={{display:"flex",alignItems:"center",gap:4,padding:"4px 6px",borderRadius:5,cursor:"pointer",background:sel?`${RC[reg]}12`:"rgba(255,255,255,0.015)",border:sel?`1px solid ${RC[reg]}50`:"1px solid rgba(255,255,255,0.03)",transition:"all 0.1s"}}>
                              <span style={{fontSize:11,fontWeight:800,color:t.s<=4?RC[reg]:"var(--d)",width:16,textAlign:"center"}}>{t.s}</span>
                              <span style={{fontSize:13,fontWeight:sel?800:500,color:sel?"#fff":"rgba(255,255,255,0.65)",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{tm}</span>
                              <span className="mn" style={{fontSize:11,fontWeight:700,color:wp>=0.6?"var(--green)":"var(--orange)"}}>{Math.round(wp*100)}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
            {/* Regional Champion */}
            <div style={{display:"flex",flexDirection:"column",justifyContent:"center",minWidth:120}}>
              {(()=>{const k=`${reg}-3-0`;const w=brackets[bIdx].picks[k];
                if(!w)return <div className="gl" style={{padding:16,textAlign:"center"}}><div style={{fontSize:13,color:"var(--d)"}}>Pick all rounds</div></div>;
                const t=T[w];
                return <div className="gl" style={{padding:14,textAlign:"center",borderColor:`${RC[reg]}30`}}>
                  <div style={{fontSize:11,fontWeight:700,color:RC[reg],letterSpacing:0.5}}>{RG[reg]} Champ</div>
                  <div style={{fontSize:18,fontWeight:900,margin:"4px 0"}}>{w}</div>
                  <div style={{fontSize:12,color:"var(--m)"}}>({t.s}) {t.rec}</div>
                </div>;
              })()}
            </div>
          </div>
        </div>

        {/* Final Four & Championship */}
        {(()=>{
          const champs=Object.keys(RG).map(rk=>({rk,team:brackets[bIdx].picks[`${rk}-3-0`],color:RC[rk],name:RG[rk]}));
          const allChamps=champs.every(c=>c.team);
          if(!allChamps)return null;
          return(
            <div style={{marginTop:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:10}}>Final Four & Championship</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                {[[champs[0],champs[2]],[champs[1],champs[3]]].map((semi,si)=>{
                  const f4Key=`F4-${si}`;const picked=brackets[bIdx].picks[f4Key];
                  return(
                    <div key={si} className="gl" style={{padding:4}}>
                      <div style={{fontSize:11,fontWeight:700,color:"var(--m)",textAlign:"center",padding:"4px 0"}}>Semi {si+1}</div>
                      {semi.map((c,ti)=>{
                        const sel=picked===c.team;const other=semi[1-ti];
                        const wp=c.team&&other.team?getWP(c.team,other.team):0.5;
                        return(
                          <div key={ti} onClick={()=>{const nb=[...brackets];nb[bIdx]={...nb[bIdx],picks:{...nb[bIdx].picks,[f4Key]:c.team}};save(nb);}} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",cursor:"pointer",background:sel?`${c.color}15`:"transparent",borderBottom:ti===0?"1px solid var(--b)":"none"}}>
                            <div style={{width:4,height:16,borderRadius:2,background:c.color}}/>
                            <span style={{fontSize:14,fontWeight:sel?800:500,color:sel?"#fff":"var(--t2)",flex:1}}>{c.team}</span>
                            <span className="mn" style={{fontSize:12,color:"var(--m)"}}>{Math.round((ti===0?wp:1-wp)*100)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              {brackets[bIdx].picks["F4-0"]&&brackets[bIdx].picks["F4-1"]&&(
                <div className="gl" style={{padding:4,marginBottom:8}}>
                  <div style={{fontSize:12,fontWeight:700,color:"var(--acc)",textAlign:"center",padding:"6px 0"}}>Championship</div>
                  {["F4-0","F4-1"].map((f4Key,ti)=>{
                    const team=brackets[bIdx].picks[f4Key];const champPicked=brackets[bIdx].picks["CHAMP"];const sel=champPicked===team;
                    const other=brackets[bIdx].picks[ti===0?"F4-1":"F4-0"];const wp=team&&other?getWP(team,other):0.5;
                    return(
                      <div key={ti} onClick={()=>{const nb=[...brackets];nb[bIdx]={...nb[bIdx],picks:{...nb[bIdx].picks,CHAMP:team}};save(nb);}} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px",cursor:"pointer",background:sel?"rgba(20,147,255,0.08)":"transparent",borderBottom:ti===0?"1px solid var(--b)":"none"}}>
                        <span style={{fontSize:15,fontWeight:sel?900:500,color:sel?"var(--acc)":"var(--t2)",flex:1}}>{team}</span>
                        <span className="mn" style={{fontSize:13,color:"var(--m)"}}>{Math.round((ti===0?wp:1-wp)*100)}%</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {brackets[bIdx].picks["CHAMP"]&&(
                <div style={{textAlign:"center",padding:18,borderRadius:10,background:"var(--s)",border:"1px solid var(--acc)"}}>
                  <div style={{fontSize:11,fontWeight:700,color:"var(--acc)",letterSpacing:1}}>NATIONAL CHAMPION</div>
                  <div style={{fontSize:22,fontWeight:900,color:"#fff",margin:"6px 0"}}>{brackets[bIdx].picks["CHAMP"]}</div>
                </div>
              )}
            </div>
          );
        })()}
      </div>)}

      {/* ═══ BETTING VALUE TAB ═══ */}
      {tab==="value"&&(<div>
        {/* Live Odds Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>Betting Value Finder</div>
            <div style={{fontSize:13,color:"var(--m)",marginTop:3}}>Model probability vs live sportsbook odds</div>
          </div>
          <button className={oddsLoading?"btn-outline":"btn-green"} onClick={fetchLiveOdds} disabled={oddsLoading} style={{padding:"8px 16px",borderRadius:8,fontSize:12,fontFamily:"'DM Sans'",cursor:"pointer",whiteSpace:"nowrap"}}>
            {oddsLoading?"Loading...":"Fetch Live Odds"}
          </button>
        </div>

        {/* API Usage */}
        {oddsUsage&&(
          <div style={{display:"flex",gap:12,marginBottom:14,fontSize:12,color:"var(--m)"}}>
            <span>Requests used: <span className="mn" style={{color:"#fff"}}>{oddsUsage.used}</span></span>
            <span>Remaining: <span className="mn" style={{color:oddsUsage.remaining>400?"var(--green)":oddsUsage.remaining>100?"var(--orange)":"var(--red)"}}>{oddsUsage.remaining}</span>/500</span>
          </div>
        )}

        {/* Sim required notice */}
        {!simR&&(
          <div className="gl fu" style={{padding:18,textAlign:"center",marginBottom:16}}>
            <p style={{fontSize:14,fontWeight:700,marginBottom:14}}>Run a simulation to compare model vs Vegas</p>
            <button onClick={()=>{doSim(10000);}} className="btn-primary" style={{padding:"12px 28px",borderRadius:8,fontSize:14,fontFamily:"'DM Sans'",cursor:"pointer"}}>Run 10k Sims</button>
          </div>
        )}

        {/* Live Game Odds */}
        {liveOdds&&Object.keys(liveOdds).length>0&&(
          <div className="gl fu" style={{padding:16,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:12}}>Live Game Lines</div>
            {Object.entries(MO).flatMap(([rk,matchups])=>
              matchups.map(([a,b],mi)=>{
                const oddsA=liveOdds[a];const oddsB=liveOdds[b];
                // Only use odds if both teams match (prevents cross-game contamination)
                const odds=(oddsA&&(!oddsA.opponent||oddsA.opponent===b))?oddsA:(oddsB&&(!oddsB.opponent||oddsB.opponent===a))?oddsB:null;
                if(!odds)return null;
                const firstBook=Object.keys(odds.books)[0];
                const bookData=firstBook?odds.books[firstBook]:null;
                const h2h=bookData?.h2h||{};
                const spread=bookData?.spreads||{};
                const total=bookData?.totals||{};
                const wp=getWP(a,b);
                return(
                  <div key={`${rk}-${mi}`} style={{padding:"10px 0",borderBottom:"1px solid var(--b)"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <div style={{width:3,height:14,borderRadius:1,background:RC[rk]}}/>
                        <span style={{fontSize:13,fontWeight:700}}>({T[a].s}) {a} vs ({T[b].s}) {b}</span>
                      </div>
                      <span style={{fontSize:11,color:"var(--m)"}}>{firstBook||""}</span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}} className="resp-grid3">
                      <div style={{padding:"6px 8px",borderRadius:6,background:"var(--s2)",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"var(--m)",marginBottom:2}}>MONEYLINE</div>
                        <div style={{display:"flex",justifyContent:"space-around"}}>
                          {Object.entries(h2h).slice(0,2).map(([team,price],i)=>(
                            <div key={i}>
                              <div style={{fontSize:10,color:"var(--m)"}}>{team.length>10?team.slice(0,9)+"…":team}</div>
                              <div className="mn" style={{fontSize:13,fontWeight:700,color:price<0?"var(--green)":"#fff"}}>{price>0?"+":""}{price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{padding:"6px 8px",borderRadius:6,background:"var(--s2)",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"var(--m)",marginBottom:2}}>SPREAD</div>
                        <div style={{display:"flex",justifyContent:"space-around"}}>
                          {Object.entries(spread).slice(0,2).map(([team,data],i)=>(
                            <div key={i}>
                              <div className="mn" style={{fontSize:13,fontWeight:700,color:"#fff"}}>{data.point>0?"+":""}{data.point}</div>
                              <div style={{fontSize:10,color:"var(--m)"}}>{data.price>0?"+":""}{data.price}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{padding:"6px 8px",borderRadius:6,background:"var(--s2)",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"var(--m)",marginBottom:2}}>TOTAL</div>
                        <div style={{display:"flex",justifyContent:"space-around"}}>
                          {Object.entries(total).slice(0,2).map(([label,data],i)=>(
                            <div key={i}>
                              <div style={{fontSize:10,color:"var(--m)"}}>{label}</div>
                              <div className="mn" style={{fontSize:13,fontWeight:700,color:"#fff"}}>{data.point}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",marginTop:6,padding:"4px 8px",borderRadius:4,background:"rgba(255,255,255,0.02)"}}>
                      <span style={{fontSize:11,color:"var(--m)"}}>Model: <span className="mn" style={{color:"var(--acc)"}}>{a} {Math.round(wp*100)}%</span> — <span className="mn" style={{color:"var(--acc)"}}>{b} {Math.round((1-wp)*100)}%</span></span>
                    </div>
                  </div>
                );
              })
            ).filter(Boolean).slice(0,16)}
            {Object.keys(liveOdds).length===0&&<div style={{fontSize:13,color:"var(--m)",textAlign:"center",padding:12}}>No live odds available. Games may not have started yet.</div>}
          </div>
        )}

        {/* Model vs Vegas Title Odds */}
        {simR&&(
          <div className="gl fu" style={{padding:16,marginBottom:16}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>Championship Value</div>
            <div style={{fontSize:12,color:"var(--m)",marginBottom:14}}>
              Model championship probability vs pre-tournament Vegas lines. Positive edge = undervalued by Vegas.
            </div>
            <div style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr",gap:4,padding:"8px 0",borderBottom:"1px solid var(--b)"}}>
              <span style={{fontSize:11,fontWeight:700,color:"var(--d)"}}>TEAM</span>
              <span style={{fontSize:11,fontWeight:700,color:"var(--d)",textAlign:"center"}}>VEGAS</span>
              <span style={{fontSize:11,fontWeight:700,color:"var(--d)",textAlign:"center"}}>MODEL</span>
              <span style={{fontSize:11,fontWeight:700,color:"var(--d)",textAlign:"center"}}>EDGE</span>
            </div>
            {bettingValues.map((v,i)=>(
              <div key={v.name} style={{display:"grid",gridTemplateColumns:"2.5fr 1fr 1fr 1fr",gap:4,alignItems:"center",padding:"8px 0",borderBottom:"1px solid rgba(255,255,255,0.03)"}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  <div style={{width:22,height:22,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,background:RC[v.reg],color:"#000"}}>{v.seed}</div>
                  <div>
                    <div style={{fontSize:13,fontWeight:700}}>{v.name}</div>
                    <div style={{fontSize:11,color:"var(--m)"}}>{v.vegasOdds}</div>
                  </div>
                </div>
                <span className="mn" style={{textAlign:"center",fontSize:13,color:"var(--m)"}}>{v.vegasPct.toFixed(1)}%</span>
                <span className="mn" style={{textAlign:"center",fontSize:13,color:"#fff"}}>{v.modelPct.toFixed(1)}%</span>
                <span className="mn" style={{textAlign:"center",fontSize:13,fontWeight:800,color:v.edge>2?"var(--green)":v.edge>0?"var(--orange)":"var(--red)"}}>
                  {v.edge>0?"+":""}{v.edge.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Line Movement Tracker */}
        {oddsHistory.length>=2&&(
          <div className="gl fu" style={{padding:16,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontSize:14,fontWeight:700,color:"#fff"}}>Line Movement</div>
              <span style={{fontSize:11,color:"var(--d)"}}>{oddsHistory.length} snapshots</span>
            </div>
            <div style={{fontSize:11,color:"var(--m)",marginBottom:10}}>
              Compares your first odds fetch to the latest. Shows which lines are shifting and which direction sharp money is moving.
            </div>
            {(()=>{
              const first=oddsHistory[0]?.lines||{};
              const latest=oddsHistory[oddsHistory.length-1]?.lines||{};
              const movements=Object.keys(latest).map(team=>{
                const now=latest[team]?.ml;const then=first[team]?.ml;
                if(!now||!then||now===then)return null;
                const nowSpread=latest[team]?.spread;const thenSpread=first[team]?.spread;
                const mlShift=now-then;
                const spreadShift=nowSpread&&thenSpread?(nowSpread-thenSpread):null;
                const t=T[team];if(!t)return null;
                return{team,seed:t.s,region:t.r,openML:then,currentML:now,mlShift,openSpread:thenSpread,currentSpread:nowSpread,spreadShift,book:latest[team]?.book};
              }).filter(Boolean).sort((a,b)=>Math.abs(b.mlShift)-Math.abs(a.mlShift));
              
              if(movements.length===0)return <div style={{fontSize:12,color:"var(--d)",textAlign:"center",padding:8}}>No significant line movement detected yet. Fetch odds again later to compare.</div>;
              
              return movements.slice(0,12).map((m,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",borderBottom:i<movements.slice(0,12).length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                  <div style={{width:4,height:20,borderRadius:2,background:RC[m.region],flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>({m.seed}) {m.team}</span>
                      <span style={{fontSize:10,color:"var(--d)"}}>{m.book}</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:12,flexShrink:0,alignItems:"center"}}>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"var(--d)"}}>Open</div>
                      <div className="mn" style={{fontSize:12,color:"var(--m)"}}>{m.openML>0?"+":""}{m.openML}</div>
                    </div>
                    <div style={{fontSize:14,color:m.mlShift<0?"var(--green)":"var(--red)",fontWeight:800}}>→</div>
                    <div style={{textAlign:"center"}}>
                      <div style={{fontSize:10,color:"var(--d)"}}>Now</div>
                      <div className="mn" style={{fontSize:12,color:"#fff"}}>{m.currentML>0?"+":""}{m.currentML}</div>
                    </div>
                    <div style={{padding:"2px 6px",borderRadius:4,fontSize:11,fontWeight:700,
                      background:m.mlShift<0?"rgba(47,189,96,0.1)":"rgba(229,69,61,0.1)",
                      color:m.mlShift<0?"var(--green)":"var(--red)"}}>
                      {m.mlShift>0?"+":""}{m.mlShift}
                    </div>
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {/* How to read */}
        <div className="gl" style={{padding:14}}>
          <div style={{fontSize:13,fontWeight:700,color:"var(--t2)",marginBottom:6}}>How to use this</div>
          <div style={{fontSize:13,color:"var(--m)",lineHeight:1.6}}>
            Live Game Lines show real-time moneyline, spread, and totals from US sportsbooks. Championship Value compares our model against pre-tournament futures odds. A positive edge means the team is undervalued — look for 2%+ edges with strong analytics backing.
          </div>
        </div>
      </div>)}

      {/* ═══ AI PARLAY BUILDER TAB ═══ */}
      {tab==="parlay"&&(<div>
        {/* Header */}
        <div style={{marginBottom:14}}>
          <div style={{fontSize:18,fontWeight:800,color:"#fff",letterSpacing:-0.3}}>AI Parlay Builder</div>
          <div style={{fontSize:12,color:"var(--m)",marginTop:3,lineHeight:1.5}}>
            Calibrated with historical seed upset rates, injury edges, momentum, clutch, and style clashes. Picks are deduped across games and spread across regions.
          </div>
        </div>

        {/* Controls */}
        <div className="gl" style={{padding:16,marginBottom:14}}>
          {/* Leg count */}
          <div style={{fontSize:12,fontWeight:700,color:"var(--m)",marginBottom:8,letterSpacing:0.3}}>LEGS</div>
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[6,8,12,16,20].map(n=>(
              <button key={n} onClick={()=>setParlayLegs(n)} style={{flex:1,padding:"10px 0",borderRadius:8,fontSize:15,fontWeight:parlayLegs===n?800:600,fontFamily:"'IBM Plex Mono'",cursor:"pointer",
                background:parlayLegs===n?"var(--acc)":"var(--s2)",color:parlayLegs===n?"#fff":"var(--m)",
                border:parlayLegs===n?"none":"1px solid var(--b)",transition:"all 0.15s"}}>
                {n}
              </button>
            ))}
          </div>

          {/* Mode */}
          <div style={{fontSize:12,fontWeight:700,color:"var(--m)",marginBottom:8,letterSpacing:0.3}}>MODE</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
            {[
              {id:"auto",label:"AI-Powered",sub:"Claude analyzes every pick"},
              {id:"local",label:"Instant",sub:"Model engine only, no wait"},
            ].map(m=>(
              <div key={m.id} onClick={()=>setParlayType(m.id)} style={{padding:"12px",borderRadius:8,cursor:"pointer",textAlign:"center",
                background:parlayType===m.id?"rgba(20,147,255,0.08)":"var(--s2)",
                border:parlayType===m.id?"1px solid var(--acc)":"1px solid var(--b)",transition:"all 0.15s"}}>
                <div style={{fontSize:13,fontWeight:700,color:parlayType===m.id?"var(--acc)":"#fff"}}>{m.label}</div>
                <div style={{fontSize:11,color:"var(--m)",marginTop:2}}>{m.sub}</div>
              </div>
            ))}
          </div>

          {/* Bet Types */}
          <div style={{fontSize:12,fontWeight:700,color:"var(--m)",marginBottom:8,letterSpacing:0.3}}>BET TYPES</div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {[{id:"ml",label:"Moneyline"},{id:"spread",label:"Spreads"},{id:"total",label:"Totals"}].map(bt=>(
              <div key={bt.id} onClick={()=>setParlayBetTypes(p=>({...p,[bt.id]:!p[bt.id]}))} style={{flex:1,padding:"10px",borderRadius:8,cursor:"pointer",textAlign:"center",
                background:parlayBetTypes[bt.id]?"rgba(20,147,255,0.08)":"var(--s2)",
                border:parlayBetTypes[bt.id]?"1px solid var(--acc)":"1px solid var(--b)",transition:"all 0.15s"}}>
                <div style={{fontSize:12,fontWeight:700,color:parlayBetTypes[bt.id]?"var(--acc)":"var(--m)"}}>{bt.label}</div>
              </div>
            ))}
          </div>

          {/* Sportsbook Filter */}
          <div style={{fontSize:12,fontWeight:700,color:"var(--m)",marginBottom:8,letterSpacing:0.3}}>SPORTSBOOK</div>
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {["ALL","FanDuel","DraftKings"].map(bk=>(
              <div key={bk} onClick={()=>setParlayBook(bk)} style={{flex:1,padding:"10px",borderRadius:8,cursor:"pointer",textAlign:"center",
                background:parlayBook===bk?"rgba(20,147,255,0.08)":"var(--s2)",
                border:parlayBook===bk?"1px solid var(--acc)":"1px solid var(--b)",transition:"all 0.15s"}}>
                <div style={{fontSize:12,fontWeight:700,color:parlayBook===bk?"var(--acc)":"var(--m)"}}>{bk==="ALL"?"Best Line":bk}</div>
              </div>
            ))}
          </div>

          {/* Build button */}
          <button className="btn-green" onClick={buildParlays} disabled={parlayLoading} style={{width:"100%",padding:"14px",borderRadius:8,fontSize:15,fontFamily:"'DM Sans'",cursor:"pointer",letterSpacing:0.2}}>
            {parlayLoading?"Analyzing matchups...":"Build "+parlayLegs+"-Leg Parlays"}
          </button>
        </div>

        {/* Loading state */}
        {parlayLoading&&(
          <div className="gl" style={{padding:24,textAlign:"center"}}>
            <div style={{width:20,height:20,borderRadius:"50%",border:"2px solid var(--b)",borderTopColor:"var(--acc)",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/>
            <div style={{fontSize:13,color:"var(--m)"}}>{parlayType==="auto"?"AI is building your parlays...":"Crunching numbers..."}</div>
          </div>
        )}

        {/* Generated Parlays */}
        {parlays&&!parlayLoading&&(
          <div>
            {/* Quick summary bar */}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}} className="resp-grid3">
              {Object.entries(parlays).map(([key,p])=>(
                <div key={key} style={{padding:"10px",borderRadius:8,background:"var(--s)",border:`1px solid ${p.color}25`,textAlign:"center"}}>
                  <div style={{fontSize:10,fontWeight:700,color:p.color,letterSpacing:0.5}}>{p.tag}</div>
                  <div className="mn" style={{fontSize:18,fontWeight:900,color:p.color,margin:"2px 0"}}>{p.payout?.american||"—"}</div>
                  <div style={{fontSize:10,color:"var(--m)"}}>Hit: {p.payout?.hitRate}%</div>
                </div>
              ))}
            </div>

            {/* Detailed parlay cards */}
            {Object.entries(parlays).map(([key,parlay])=>(
              <div key={key} className="gl" style={{padding:0,marginBottom:14,overflow:"hidden",borderLeft:`3px solid ${parlay.color}`}}>
                {/* Card header */}
                <div style={{padding:"14px 16px",background:`${parlay.color}08`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:15,fontWeight:800,color:"#fff"}}>{parlay.name}</span>
                      <span style={{fontSize:9,fontWeight:700,color:parlay.color,padding:"2px 6px",borderRadius:3,background:`${parlay.color}20`,letterSpacing:0.5}}>{parlay.tag}</span>
                    </div>
                    <div style={{fontSize:11,color:"var(--m)",marginTop:2}}>{parlay.desc}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div className="mn" style={{fontSize:22,fontWeight:900,color:parlay.color,lineHeight:1}}>{parlay.payout?.american}</div>
                    <div style={{fontSize:10,color:"var(--m)",marginTop:2}}>$10 → ${Math.round((parlay.payout?.payout||0)/10+10)}</div>
                  </div>
                </div>

                {/* AI Reasoning */}
                {parlay.aiReasoning&&(
                  <div style={{padding:"10px 16px",background:"rgba(255,255,255,0.015)",borderBottom:"1px solid var(--b)"}}>
                    <div style={{fontSize:10,fontWeight:700,color:parlay.color,letterSpacing:0.5,marginBottom:3}}>AI ANALYSIS</div>
                    <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.5}}>{parlay.aiReasoning}</div>
                  </div>
                )}

                {/* Legs */}
                <div style={{padding:"8px 0"}}>
                  {parlay.legs?.map((leg,li)=>{
                    const confColor=leg.winPct>=80?"var(--green)":leg.winPct>=65?"var(--acc)":leg.winPct>=50?"var(--orange)":"var(--red)";
                    return(
                      <div key={li} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 16px",borderBottom:li<parlay.legs.length-1?"1px solid rgba(255,255,255,0.03)":"none"}}>
                        {/* Leg number */}
                        <div className="mn" style={{width:20,fontSize:11,fontWeight:700,color:"var(--d)",textAlign:"center",flexShrink:0}}>{li+1}</div>
                        
                        {/* Pick info */}
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,flexWrap:"wrap"}}>
                            {/* Bet type badge */}
                            {leg.betType&&leg.betType!=="ml"&&(
                              <span style={{fontSize:9,fontWeight:800,padding:"2px 5px",borderRadius:3,
                                background:leg.betType==="spread"?"rgba(157,122,255,0.12)":"rgba(245,166,35,0.12)",
                                color:leg.betType==="spread"?"#9d7aff":"var(--orange)",
                                letterSpacing:0.3}}>{leg.betType==="spread"?"SPR":"O/U"}</span>
                            )}
                            {/* Spread display */}
                            {leg.betType==="spread"?(
                              <>
                                <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{leg.winner}</span>
                                <span className="mn" style={{fontSize:13,fontWeight:800,color:"#9d7aff"}}>{leg.spreadPoint>0?"+":""}{leg.spreadPoint}</span>
                                <span style={{fontSize:11,color:"var(--d)"}}>vs {leg.loser}</span>
                              </>
                            ):leg.betType==="total"?(
                              <>
                                <span style={{fontSize:13,fontWeight:700,color:"var(--orange)"}}>{leg.totalSide} {leg.totalPoint}</span>
                                <span style={{fontSize:11,color:"var(--d)"}}>{leg.gameA||leg.winner} vs {leg.gameB||leg.loser}</span>
                              </>
                            ):(
                              <>
                                <span style={{fontSize:13,fontWeight:700,color:"#fff"}}>{leg.winner}</span>
                                <span style={{fontSize:10,color:"var(--d)"}}>{leg.seedW?"("+leg.seedW+")":""}</span>
                                <span style={{fontSize:11,color:"var(--d)"}}>over</span>
                                <span style={{fontSize:12,color:"var(--m)"}}>{leg.loser}</span>
                                <span style={{fontSize:10,color:"var(--d)"}}>{leg.seedL?"("+leg.seedL+")":""}</span>
                              </>
                            )}
                          </div>
                          {/* Rationale */}
                          {(leg.aiRationale||leg.note)&&(
                            <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2,lineHeight:1.3}}>{leg.aiRationale||leg.note}</div>
                          )}
                          {/* Tags */}
                          {leg.tags?.length>0&&(
                            <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                              {leg.tags.filter(t=>t!=="SPREAD"&&t!=="TOTAL").map((tag,ti)=>(
                                <span key={ti} style={{fontSize:9,fontWeight:700,padding:"1px 5px",borderRadius:3,
                                  background:tag.includes("EV")?"rgba(47,189,96,0.12)":tag==="INJURY EDGE"?"rgba(229,69,61,0.1)":tag==="HOT"?"rgba(245,166,35,0.1)":"rgba(255,255,255,0.04)",
                                  color:tag.includes("EV")?"var(--green)":tag==="INJURY EDGE"?"var(--red)":tag==="HOT"?"var(--orange)":"var(--m)",
                                  letterSpacing:0.3}}>{tag}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        {/* Confidence + live odds */}
                        <div style={{flexShrink:0,textAlign:"right",minWidth:50}}>
                          {leg.liveOdds!==null?(
                            <div>
                              <div className="mn" style={{fontSize:14,fontWeight:800,color:confColor}}>{leg.liveOdds>0?"+":""}{leg.liveOdds}</div>
                              <div style={{fontSize:9,color:"var(--m)"}}>{leg.liveBook||""}</div>
                            </div>
                          ):(
                            <div className="mn" style={{fontSize:14,fontWeight:800,color:confColor}}>{leg.winPct}%</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer stats */}
                <div style={{padding:"10px 16px",background:"rgba(255,255,255,0.015)",borderTop:"1px solid var(--b)",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:6}}>
                  <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
                    <span style={{fontSize:11,color:"var(--m)"}}>{parlay.legs?.length} legs</span>
                    <span style={{fontSize:11,color:"var(--m)"}}>Avg: <span className="mn" style={{color:"#fff"}}>{Math.round(parlay.legs?.reduce((a,l)=>a+l.winPct,0)/(parlay.legs?.length||1))}%</span></span>
                    {parlay.payout?.liveCount>0&&(
                      <span style={{fontSize:11,color:"var(--green)"}}>{parlay.payout.liveCount}/{parlay.payout.totalLegs} live</span>
                    )}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontSize:11,color:"var(--m)"}}>Hit: <span className="mn" style={{color:parlay.color}}>{parlay.payout?.hitRate}%</span></span>
                    <button onClick={()=>exportParlay(parlay)} className="btn-outline" style={{padding:"4px 10px",borderRadius:5,fontSize:10,fontFamily:"'DM Sans'",cursor:"pointer",whiteSpace:"nowrap"}}>
                      Export
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Disclaimer */}
            <div style={{fontSize:11,color:"var(--d)",textAlign:"center",padding:"8px 0",lineHeight:1.5}}>
              Parlays are high-risk bets. These are model-generated suggestions, not guarantees. Always bet responsibly.
            </div>
          </div>
        )}

        {/* Empty state */}
        {!parlays&&!parlayLoading&&(
          <div className="gl" style={{padding:20,textAlign:"center"}}>
            <div style={{fontSize:14,fontWeight:700,color:"#fff",marginBottom:8}}>How it works</div>
            <div style={{fontSize:13,color:"var(--m)",lineHeight:1.6,maxWidth:400,margin:"0 auto"}}>
              Select leg count, choose AI or Instant mode, and hit Build. The system analyzes all 32 first-round games, calibrates with historical seed upset data, factors in injuries, momentum, and clutch ratings, then generates three optimized parlays at different risk levels.
            </div>
          </div>
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
          <button onClick={runAI} disabled={aiLoading} className={aiLoading?"btn-outline":"btn-primary"} style={{width:"100%",padding:"12px",borderRadius:8,fontSize:14,fontFamily:"'DM Sans'",cursor:"pointer",letterSpacing:0.2}}>
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
        {/* Score Fetch Controls */}
        <div className="gl fu" style={{padding:18,marginBottom:14,background:"linear-gradient(135deg,rgba(61,214,140,0.03),rgba(74,158,255,0.03))"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <div style={{fontSize:15,fontWeight:800,letterSpacing:-0.2}}>Live Tournament Tracker</div>
              <div style={{fontSize:12,color:"var(--m)",marginTop:3}}>Scores API + AI search + manual entry</div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>fetchLiveScores(false)} disabled={fetchLoading} className={fetchLoading?"btn-outline":"btn-green"} style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                {fetchLoading?"Loading...":"Live Scores"}
              </button>
              <button onClick={fetchLatest} disabled={fetchLoading} className="btn-outline" style={{padding:"8px 14px",borderRadius:8,fontSize:12,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                AI Search
              </button>
            </div>
          </div>
          
          {/* Auto-poll toggle */}
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 10px",borderRadius:6,background:"rgba(255,255,255,0.02)",marginBottom:fetchMsg?10:0}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div onClick={()=>setAutoPolling(!autoPolling)} style={{width:36,height:20,borderRadius:10,background:autoPolling?"var(--green)":"var(--s3)",cursor:"pointer",transition:"all 0.2s",position:"relative"}}>
                <div style={{width:16,height:16,borderRadius:8,background:"#fff",position:"absolute",top:2,left:autoPolling?18:2,transition:"all 0.2s"}}/>
              </div>
              <span style={{fontSize:12,color:autoPolling?"var(--green)":"var(--m)",fontWeight:600}}>Auto-refresh every 5 min</span>
            </div>
            {lastScoreFetch&&<span style={{fontSize:11,color:"var(--d)"}}>Last: {lastScoreFetch.toLocaleTimeString()}</span>}
          </div>
          
          {fetchMsg&&<div style={{fontSize:12,color:"var(--m)",padding:"6px 8px",borderRadius:6,background:"rgba(255,255,255,0.02)",lineHeight:1.5}}>{fetchMsg}</div>}
        </div>

        {/* Live Games In Progress */}
        {liveScores&&liveScores.filter(g=>!g.completed&&g.scores&&g.scores.length>0).length>0&&(
          <div className="gl fu" style={{padding:16,marginBottom:14,borderLeft:"3px solid var(--green)"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:"var(--green)",animation:"liveDot 1.8s ease-in-out infinite"}}/>
              <span style={{fontSize:13,fontWeight:700,color:"var(--green)"}}>LIVE NOW</span>
            </div>
            {liveScores.filter(g=>!g.completed&&g.scores&&g.scores.length>0).map((game,gi)=>{
              const s0=parseInt(game.scores?.[0]?.score)||0;
              const s1=parseInt(game.scores?.[1]?.score)||0;
              const leading=s0>s1?0:s0<s1?1:-1;
              return(
                <div key={gi} style={{padding:"10px 0",borderBottom:gi<liveScores.filter(g=>!g.completed&&g.scores?.length>0).length-1?"1px solid var(--b)":"none"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        <span style={{fontSize:14,fontWeight:leading===0?800:500,color:leading===0?"#fff":"var(--m)"}}>{game.home_team}</span>
                        <span className="mn" style={{fontSize:18,fontWeight:900,color:leading===0?"var(--green)":"var(--m)"}}>{s0}</span>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginTop:4}}>
                        <span style={{fontSize:14,fontWeight:leading===1?800:500,color:leading===1?"#fff":"var(--m)"}}>{game.away_team}</span>
                        <span className="mn" style={{fontSize:18,fontWeight:900,color:leading===1?"var(--green)":"var(--m)"}}>{s1}</span>
                      </div>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div className="mn" style={{fontSize:13,color:"var(--orange)",fontWeight:700}}>LIVE</div>
                      <div style={{fontSize:11,color:"var(--d)"}}>+{Math.abs(s0-s1)} {leading===0?game.home_team?.split(" ").pop():leading===1?game.away_team?.split(" ").pop():"TIE"}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Recent Completed Games (from API) */}
        {liveScores&&liveScores.filter(g=>g.completed).length>0&&(
          <div className="gl fu" style={{padding:16,marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--m)",marginBottom:10}}>COMPLETED — {liveScores.filter(g=>g.completed).length} games</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))",gap:6}}>
              {liveScores.filter(g=>g.completed).slice(0,16).map((game,gi)=>{
                const s0=parseInt(game.scores?.[0]?.score)||0;
                const s1=parseInt(game.scores?.[1]?.score)||0;
                const winnerName=s0>s1?game.home_team:game.away_team;
                const loserName=s0>s1?game.away_team:game.home_team;
                const winScore=Math.max(s0,s1);const loseScore=Math.min(s0,s1);
                return(
                  <div key={gi} style={{padding:"8px 10px",borderRadius:6,background:"var(--s2)"}}>
                    <div style={{fontSize:12,fontWeight:700,color:"var(--green)"}}>{winnerName} {winScore}</div>
                    <div style={{fontSize:11,color:"var(--d)"}}>{loserName} {loseScore}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bracket Scoreboard */}
        <div className="gl fu" style={{padding:18,marginBottom:20}}>
          <div style={{fontSize:14,fontWeight:700,color:"var(--t2)",marginBottom:20}}>Bracket Scoreboard</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}} className="resp-grid3">
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
              <button key={i} onClick={()=>setTrkRound(i)} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,background:trkRound===i?"rgba(255,255,255,0.1)":"transparent",color:trkRound===i?"#fff":"var(--m)",border:complete?`1px solid var(--green)40`:`1px solid var(--b)`,cursor:"pointer",fontFamily:"'DM Sans'",textTransform:"uppercase"}}>
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
                    <div onClick={()=>setModal({type:"margin",data:{key:g.key,team:g.a,other:g.b}})} style={{flex:1,padding:"10px 8px",borderRadius:8,cursor:"pointer",textAlign:"center",
                      background:result===g.a?"rgba(47,189,96,0.1)":!result?"rgba(255,255,255,0.02)":"rgba(229,69,61,0.05)",
                      border:result===g.a?"1px solid rgba(47,189,96,0.25)":!result?"1px solid var(--b)":"1px solid rgba(229,69,61,0.12)",
                      transition:"all 0.15s"}}>
                      <div style={{fontSize:12,fontWeight:800,color:RC[ta?.r||g.region]}}>({ta?.s})</div>
                      <div style={{fontSize:15,fontWeight:result===g.a?900:600,color:result===g.a?"var(--green)":result?"var(--d)":"#fff"}}>{g.a}</div>
                      <div className="mn" style={{fontSize:12,color:"var(--d)",marginTop:2}}>{Math.round(wp*100)}%</div>
                    </div>
                    <div style={{display:"flex",alignItems:"center",fontSize:12,color:"var(--d)",fontWeight:800}}>VS</div>
                    {/* Team B */}
                    <div onClick={()=>setModal({type:"margin",data:{key:g.key,team:g.b,other:g.a}})} style={{flex:1,padding:"10px 8px",borderRadius:8,cursor:"pointer",textAlign:"center",
                      background:result===g.b?"rgba(47,189,96,0.1)":!result?"rgba(255,255,255,0.02)":"rgba(229,69,61,0.05)",
                      border:result===g.b?"1px solid rgba(47,189,96,0.25)":!result?"1px solid var(--b)":"1px solid rgba(229,69,61,0.12)",
                      transition:"all 0.15s"}}>
                      <div style={{fontSize:12,fontWeight:800,color:RC[tb?.r||g.region]}}>({tb?.s})</div>
                      <div style={{fontSize:15,fontWeight:result===g.b?900:600,color:result===g.b?"var(--green)":result?"var(--d)":"#fff"}}>{g.b}</div>
                      <div className="mn" style={{fontSize:12,color:"var(--d)",marginTop:2}}>{Math.round((1-wp)*100)}%</div>
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
              <button onClick={()=>setTrkRound(trkRound+1)} className="btn-primary" style={{width:"100%",marginTop:10,padding:"10px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>
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
              <button onClick={()=>setModal({type:"confirm",data:{msg:"Clear all results? This cannot be undone.",action:()=>{saveResults({});setMargins({});setBoosts({});setOddsShifts([]);setPathAlerts([]);try{localStorage.removeItem("mm26-margins");localStorage.removeItem("mm26-boosts");}catch(e){}}}})} className="btn-outline" style={{padding:"8px 14px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer",color:"var(--red)"}}>Reset All</button>
            </div>
          </div>
          <div style={{fontSize:14,color:"var(--m)",marginTop:6,lineHeight:1.5}}>
            <b>Scoring:</b> R64=10pts · R32=20pts · S16=40pts · E8=80pts · F4=160pts · Final=320pts
          </div>
        </div>
      </div>)}

      </div>

      {/* ═══ TOAST NOTIFICATION ═══ */}
      {toast&&(
        <div key={toast.id} style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:900,animation:"toastIn 0.3s ease",maxWidth:480,width:"calc(100% - 40px)"}}>
          <div style={{background:"var(--s3)",border:"1px solid var(--b2)",borderRadius:10,padding:"14px 18px",display:"flex",alignItems:"center",gap:12,boxShadow:"0 8px 30px rgba(0,0,0,0.5)"}}>
            <div style={{width:4,height:24,borderRadius:2,background:"var(--acc)",flexShrink:0}}/>
            <div style={{flex:1,fontSize:13,color:"#fff",fontWeight:500,lineHeight:1.4}}>{toast.msg}</div>
            {toast.actionLabel&&(
              <button className="btn-primary" onClick={()=>{toast.action?.();setToast(null);}} style={{padding:"8px 16px",borderRadius:6,fontSize:12,fontFamily:"'DM Sans'",cursor:"pointer",whiteSpace:"nowrap",flexShrink:0}}>
                {toast.actionLabel}
              </button>
            )}
            <div onClick={()=>setToast(null)} style={{cursor:"pointer",color:"var(--m)",fontSize:16,padding:"0 4px",flexShrink:0,lineHeight:1}}>×</div>
          </div>
        </div>
      )}

      {/* ═══ MODAL OVERLAY ═══ */}
      {modal&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(4px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}} onClick={()=>setModal(null)}>
          <div style={{background:"var(--s)",border:"1px solid var(--b2)",borderRadius:12,padding:24,maxWidth:400,width:"100%",boxShadow:"0 20px 60px rgba(0,0,0,0.5)"}} onClick={e=>e.stopPropagation()}>
            
            {/* Margin Entry Modal */}
            {modal.type==="margin"&&(
              <div>
                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>{modal.data.team} wins</div>
                <div style={{fontSize:13,color:"var(--m)",marginBottom:16}}>
                  {modal.data.team} defeats {modal.data.other}. Enter the margin of victory to adjust power ratings, or skip to just record the result.
                </div>
                <div style={{marginBottom:16}}>
                  <input
                    id="margin-input"
                    type="number"
                    placeholder="Margin of victory (e.g. 12)"
                    autoFocus
                    style={{width:"100%",padding:"12px 14px",borderRadius:8,background:"var(--s3)",border:"1px solid var(--b2)",color:"#fff",fontSize:15,fontFamily:"'IBM Plex Mono'",outline:"none"}}
                    onKeyDown={e=>{if(e.key==="Enter"){const v=e.target.value;markResult(modal.data.key,modal.data.team,v?parseInt(v)||null:null);setModal(null);}}}
                  />
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-outline" onClick={()=>{markResult(modal.data.key,modal.data.team,null);setModal(null);}} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                    Skip Margin
                  </button>
                  <button className="btn-primary" onClick={()=>{const el=document.getElementById("margin-input");const v=el?.value;markResult(modal.data.key,modal.data.team,v?parseInt(v)||null:null);setModal(null);}} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                    Submit
                  </button>
                </div>
              </div>
            )}

            {/* Confirm Modal */}
            {modal.type==="confirm"&&(
              <div>
                <div style={{fontSize:16,fontWeight:800,color:"#fff",marginBottom:4}}>Confirm</div>
                <div style={{fontSize:14,color:"var(--m)",marginBottom:20,lineHeight:1.5}}>{modal.data.msg}</div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn-outline" onClick={()=>setModal(null)} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                    Cancel
                  </button>
                  <button className="btn-red" onClick={()=>{modal.data.action();setModal(null);}} style={{flex:1,padding:"10px",borderRadius:8,fontSize:13,fontFamily:"'DM Sans'",cursor:"pointer"}}>
                    Confirm
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
