import { useEffect, useState } from "react"
import { ethers, BigNumber } from "ethers";
import { Box, Typography, Paper, Divider, Link, Grid } from "@material-ui/core";
import Chart from "react-apexcharts";
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { useAddress, useWeb3Context } from "src/hooks/web3Context";
import logo from "./logo.png";
import check from "./check.svg";
import close from "./close.svg";
import twitter from "./twitter.png";
import discord from "./discord.png";
import instagram from "./instagram.png";
import copy from "./copy.png";
import { abi as BollingerSale } from "../../abi/BollingerSale";
import { abi as Bollinger } from "../../abi/IERC20";
import { info } from "../../slices/MessagesSlice";
import { Button, Navbar, Container, Nav, NavDropdown, Accordion } from 'react-bootstrap';

import CanvasJSReact from '../../lib/canvasjs/canvasjs.react';
//var CanvasJSReact = require('./canvasjs.react');
var CanvasJS = CanvasJSReact.CanvasJS;
var CanvasJSChart = CanvasJSReact.CanvasJSChart;

const bollingerAddress = "0x8141203e53b67CEBd5529fD1CECbc937Da8b9E09";
const devAddress = "0x1f8B1b4F91CA1C06512FA23bC3E0A37930E5811d";
// const devAddress = "0x7889D01396c93cC8e4E5dC69ec730a8D3057A18C";
const presaleAddress = "0xBC2c896A0ed6Fa05E35Ac823c1eC8cd7E324b5e4";

let timeInterval;

function ConnectMenu() {
  const { connect, disconnect, hasCachedProvider, provider, chainID, connected, uri } = useWeb3Context();
  const address = useAddress();
  const [isConnected, setConnected] = useState(connected);
  const [startStatus, setStartStatus] = useState(false);
  const [depositStatus, setDepositStatus] = useState(false);
  const [claimStatus, setClaimStatus] = useState(false);
  const [avaxAmount, setAvaxAmount] = useState();
  const [avaxPrice, setAvaxPrice] = useState(73);
  const [presalestauts, setPresaleStatus] = useState("NOT START NOW");
  const [days, setDays] = useState("00");
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  const [seconds, setSeconds] = useState("00");
  const [seriesRadial, setSeriesRadial] = useState([100]);
  const [copied, setCopied] = useState(false);
  const [text, setText] = useState("100%");
  const [tokenAddress, setTokenAddress] = useState("0x8141203e53b67CEBd5529fD1CECbc937Da8b9E09");
  let buttonText = "Connect Wallet";
  let clickFunc = connect;

  let chartOption = {
    animationEnabled: true,
    backgroundColor: "transparent",
    subtitles: [{
      text: text,
      verticalAlign: "center",
      fontSize: 24,
      dockInsidePlotArea: true
    }],
    data: [{
      type: "doughnut",
      showInLegend: true,
      yValueFormatString: "#,###'%'",

      dataPoints: [
        { name: "Sold", y:(100 - seriesRadial), showInLegend: false, color: 'green' },
        { name: "Remain", y: seriesRadial, showInLegend: false, color: 'blue'  },
      ]
    }]
  }

  if (isConnected) {
    buttonText = "Disconnect";
    clickFunc = disconnect;
  }

  useEffect(() => {
    setConnected(connected);
  }, [connected, address, provider]);

  const handleDeposit = async () => {
    console.log('avax amount', avaxAmount);
    const amount_avax = parseFloat(avaxAmount * 1000000000000000000);
    const amountonAddress = await provider.getBalance(address);
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    
    if (amount_avax > amountonAddress) {
      const leftAmount = (parseFloat(amount_avax) - parseFloat(amountonAddress)) / parseFloat(1000000000000000000);
      const content = "Balance is insufficient, you need more" + leftAmount + "avax";
      window.alert(content);
    }
    try {
      const res = await presaleContract.deposite({value: String(amount_avax)});
      console.log("res:", res);
      window.alert("deposite success");
    } catch (err) {
      console.log("err:", err);
    }
  };

  const handleClaim = async () => {
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    try {
      await presaleContract.claim();
      window.alert("Claim success");
    } catch (err) {
      console.log("err:", err);
    }
  };

  const handleWithDraw = async () => {
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    try {
      await presaleContract.withDraw();
      window.alert("Withdraw success");
    } catch (err) {
      console.log("err:", err);
    }
  };

  const handleStart = async () => {
    console.log('Presale start');
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    try {
      await presaleContract.setStart();
      window.alert("Bollinger Presale Event started");
      setPresaleStatus("STARTED");
    } catch (err) {
      console.log("err:", err);
    }
  };

  const handleEnd = async () => {
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    try {
      await presaleContract.endStart();
      window.alert("Bollinger Presale Event finished");
      setPresaleStatus("END");
      setDays("00");
      setHours("00");
      setMinutes("00");
      setSeconds("00");
    } catch (err) {
      console.log("err:", err);
    }
  };

  const app = async () => {
    const startDate = new Date();
    const presaleContract = new ethers.Contract(presaleAddress, BollingerSale, provider.getSigner());
    const BollingerContract = new ethers.Contract(bollingerAddress, Bollinger, provider.getSigner());   
    const nowDate = new Date();    
    const nowDateByMiSeconds = nowDate.getTime();
    startDate.setFullYear(2022);
    startDate.setMonth(3);
    startDate.setDate(7);
    startDate.setHours(20);
    startDate.setMinutes(0);
    startDate.setSeconds(0);
    startDate.setMilliseconds(0);
    const startDateByMiSeconds = startDate.getTime();    
    try {
      const presaleStatus = await presaleContract.getStatus();
      const leftAmount = await BollingerContract.balanceOf(presaleAddress);
      const totalAmountonPresale = parseFloat(150000000000000000000000);//????    
      const ratio = parseFloat(leftAmount)/ totalAmountonPresale;
      const percent = [Math.floor(ratio * 10000)/100];
      const avaxPrice_ = await presaleContract.getPrice();
      const claimedStatus = await presaleContract.getClaimedStatus();
      const inverstorStatus = await presaleContract.getInvestorStatus();
      setStartStatus(presaleStatus);
      setAvaxPrice(Number(avaxPrice_));
      setSeriesRadial(percent);
      const textContent = String(percent) + "%";
      setText(textContent);
      console.log("percent", chartOption.data[0].dataPoints[0].y);

      if (presaleStatus) {
        if (nowDateByMiSeconds > startDateByMiSeconds) {
          const miSeconds = nowDateByMiSeconds - startDateByMiSeconds;
          const days_Num =(miSeconds - (miSeconds % 86400000)) / 86400000;
          const restSeconds = miSeconds - days_Num * 86400000 ;
          const hours_Num = (restSeconds-(miSeconds % 3600000)) / 3600000;
          const restHr = restSeconds - hours_Num * 3600000;
          const minutes_Num = (restHr-(restHr % 60000)) / 60000;
          const restMin = restHr - minutes_Num * 60000;
          const seconds_Num = (restMin - (restMin % 1000)) / 1000;
          setDays(String(days_Num));
          setHours(String(hours_Num));
          setMinutes(String(minutes_Num));
          setSeconds(String(seconds_Num));
        }        
        if(inverstorStatus) {
          setDepositStatus(false);
          setClaimStatus(true);
        } else {
          setDepositStatus(true);
          setClaimStatus(false);
        }       
      } else {
        if(inverstorStatus) {
          setDepositStatus(false);
          setClaimStatus(true);
        } else {
          setDepositStatus(false);
          setClaimStatus(false);
        }
      }
    } catch (err) {
      console.log("error: ", err);
    }
  };   

  useEffect(() => {
    if (connected) {
      if (timeInterval) {
        clearInterval(timeInterval);
        timeInterval = setInterval(() => {
          app();
        }, 1000);
      } else
        timeInterval = setInterval(() => {
          app();
        }, 1000);
    } else {
      setDepositStatus(false);
      setClaimStatus(false);
    }
  }, [connected, address, provider]);

  useEffect(() => {
    return () => {
      if (timeInterval) clearInterval(timeInterval);
    };
  }, []);

  return (
    <>
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand href="#home">
          <img src={logo} alt="Logo" style={{ width: "150px", height: "50px" }} />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            
          </Nav>
          <Nav>
          {address === devAddress && (
            <>
              <Button
              variant="info"
              color="success"
              size="large"
              disabled={startStatus}
              style={{
                backgroundColor: startStatus ? "#dddddd" : "#0eaed5",
                borderRadius: "20px",
                marginRight: "10px",
                color: "white",
                minWidth: "110px",
              }}
              onClick={handleStart}
            >
              Start
            </Button>
            <Button
              variant="info"
              color="success"
              size="large"
              disabled={!startStatus}
              style={{
                backgroundColor: startStatus ? "#333333" : "#0eaed5",
                borderRadius: "20px",
                marginRight: "10px",
                color: "white",
                minWidth: "110px",
              }}
              onClick={handleEnd}
            >
              End
            </Button>
            <Button
              variant="info"
              color="success"
              size="large"
              disabled={!startStatus}
              style={{
                backgroundColor: startStatus ? "#333333" : "#0eaed5",
                borderRadius: "20px",
                marginRight: "10px",
                color: "white",
                minWidth: "110px",
              }}
              onClick={handleWithDraw}
            >
              WithDraw
            </Button>
            </>
          )}
            <Nav.Link href=""
              style={{
                display: "flex",
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              
              <label>
                AvaxPrice   {avaxPrice}$
              </label>
            </Nav.Link>
            <Nav.Link
              href="https://majestic-capital.gitbook.io/majestic-capital/"
              style={{
                display: "flex",
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              <label>
                WHITEPAPER
              </label>
            </Nav.Link>
            <Nav.Link
              style={{
                display: "flex",
                flexDirection: 'column',
                justifyContent: 'center',
                fontSize: '15px'
              }}
            >
              <label>
                {address ? `${address.slice(0, 6)}...${address.slice(address.length - 4, address.length)}` : "No Balance"}
              </label>
            </Nav.Link>

            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={clickFunc}
              style={{ backgroundColor: "#fcebfa", borderRadius: "20px", padding: "7px 20px" }}
            >
              {buttonText}
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
    

    <div className="container">
      <div className="row">
        <div className="col-12 col-sm-2" ></div>
        <div className="col-12 col-sm-8" >
          <h1 className="text-title text-white mt-6 text-center" style={{marginTop: '60px'}}>
            Bollinger Presale Event
          </h1>
          <div>
              <div className="row">
                <div className="col-md-8">
                  <input onChange={event => setAvaxAmount(event.target.value)}
                    disabled={!depositStatus}  
                    className="input-avax mt-2"
                    value={avaxAmount}
                    style={{backgroundColor:"gray",
                      color: "white",
                      fontSize: "15px",
                    }} type="number" id="quantity" name="quantity" min="0" max="100" placeholder="Avax Amount"/>
                </div>
                <div className="col-md-2">
                  <Button
                    variant="contained"
                    color="success"
                    disabled={!depositStatus}
                    style={{
                      backgroundColor: depositStatus ? "#0eaed5" : "#dddddd",
                      borderRadius: "20px",
                      color: "white",
                      width: "100%",
                    }}
                    onClick={handleDeposit}
                    className="btn-buy mt-2"
                  >
                    Buy
                  </Button>
                </div>

                <div className="col-md-2">
                  <Button
                    variant="contained"
                    color="success"
                    disabled={!claimStatus}
                    style={{
                      backgroundColor: claimStatus ? "#0eaed5" : "#dddddd",
                      borderRadius: "20px",
                      color: "white",
                      width: "100%",
                    }}
                    onClick={handleClaim}
                    className="btn-buy mt-2"
                  >
                    Claim
                  </Button>
                </div>
              </div>               
          </div>          
        </div>       
      </div>
      <div className="row" style ={{marginTop: '60px'}}>
        <div className="col-2 col-md-1 col-sm-1">
        </div>
        <div className="col-8 col-md-9 col-sm-7">
          <h2 className="text-white text-center text-contract" >
              Bollinger Contract Address           
          </h2>
        </div>
        <div className="col-2 col-md-2 col-sm-4">       
          <CopyToClipboard text = {tokenAddress}
           onCopy={() => setCopied(true)}>
             {copied? <span className="text-white text-center text-copy" >Copied</span> : <span className="text-white text-center text-copy" style={{cursor: 'pointer'}}>copy</span>}            
           </CopyToClipboard>
        </div>
      </div>

      <div className="row " >
        {/* <div className="col-1"></div> */}
        <div className="col-md-10 offset-md-1">
          <div  style = {{marginTop: '80px', backgroundColor:"gray", color:"black" }} className="gray-box-style">
            <h2 className="text-center text-white text-md">Presale Start Time: TBA</h2>
            <h2 className="text-center text-white text-md" style={{marginTop:"30px"}}>Current Status:{presalestauts}</h2>
            <h2 className="text-center text-white text-md" style={{marginTop:"30px"}}>{days}:{hours}:{minutes}:{seconds}</h2>
          </div>
        </div>
        {/* <div className="col-1"></div> */}
      </div>
              
    </div>
    <div className="container">
      <div className="row" style={{marginTop:"60px"}}>
        <div className="col-md-10 offset-md-1">
          <div style= {{backgroundColor:"gray", color:"black", borderRadius: "20px"}} className="pt-4">
            <h2 className="text-center text-white text-md">Hard Cap: 150 000 $ Bollinger</h2>
            <div className="row">
              <div className="col-md-6">
                <div className="mt-5">
                  <h1 className="text-center text-white text-md">1$ USD</h1>
                  <h2 className="text-center text-white text-md">Price per Bollinger</h2>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-4">
                  
                    <CanvasJSChart options = {chartOption}
                      /* onRef={ref => this.chart = ref} */
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div className="container">
      <div className="row">
        <div className="col-12">
          <h1 className="text-title text-white text-center" style={{marginTop: '80px'}}>Majestic.Finance</h1>
        </div>

        <div className="col-sm-12" style={{marginTop: '40px'}}>
          <p className="text-sm text-white text-center">
            The Majestic Capital system passively rewards its users through technology that allows investors to build and compound active reward systems. 
            Through the power of our sustainable tokenomics, our users will have the ability to earn more passive income than with any other node system currently active.
            To provide a more long-term, sustainable and rewarding passive income stream through the technology of node systems.
          </p>
        </div>
        <div className="col-12">
          <h1 className="text-title text-white text-center" style={{marginTop: '80px'}}>Sustainability</h1>
        </div>
        <div className="col-sm-12" style={{marginTop: '40px'}}>
          <p className="text-sm text-white text-center">
              Sustainability is a key factor for us, having been involved in some projects, 
              seeing the difficulties of extreme growth and not being able to keep up with demand, 
              we wanted to put in place bespoke mechanisms to combat this problem. Learning from the 
              advancements and demands of the space we decided to implement key factors into our smart contract 
              to make sustainability a reality. We came up with multiple sustainability features such as 
              a unique node token distribution and an intricate tax system. All of these functions work 
              cohesively with one another to keep our economic ecosystem sustainable. 
              Our sell tax allows us to continue to build upon the project externally, 
              while our claim tax allows us to build upon the project internally. 
              The combination of these functions will allow the project to payout the same rates for time to come, 
              which will overall be better for our users rather than a 2-week pump and failure like some projects.
          </p>
        </div>

      </div>
    </div>

    <div className="container">

      <h1 className="text-title text-white text-center" style={{marginTop: '50px'}}>Tokenomics</h1>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-md text-white" style={{marginTop: '20px'}}>Buy</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-md text-white" style={{marginTop: '20px'}}>Sell</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-sm text-white">0% Slippage</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-sm text-white">10% Slippage</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-md text-white">Automatic LP</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-md text-white">Automatic LP</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-sm text-white">0% of order fees return to liquidity</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-sm text-white">1% of order fees return to liquidity</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-md text-white">Reward</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-md text-white">Reward</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-sm text-white">0% of order fees go to the reward Pool</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-sm text-white">3% of order fees go to the reward Pool</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-md text-white">Treasury</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-md text-white">Treasury</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-sm text-white">0% of order fees go to the treasury</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-sm text-white">5% of order fees go to the treasury</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-md text-white">Marketing</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-md text-white">Marketing</p>
        </div>
      </div>

      <div className="row">
        <div className="col-6 text-end" style={{paddingRight: '30px'}}>
          <p className="text-sm text-white">0% of order fess go to the marketing</p>
        </div>
        <div className="col-6 text-start"style={{paddingLeft: '30px'}}>
          <p className="text-sm text-white">1% of order fess go to the marketing</p>
        </div>
      </div>

    </div>
      
     
    <div className="container text-center text-white competitive">
      <h1 className="text-title" style={{marginTop: '70px'}}>Competitive Advantages</h1>
      <div className="row" style={{marginTop: '40px'}}>
        <div className="col-4">
          <h1 className="text-lg">FEATURES</h1>
        </div>
        <div className="col-4">
          <h1 className="text-lg">Majestic Capital</h1>
        </div>
        <div className="col-4">
          <h1 className="text-lg">Redlight District</h1>
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Fees</h1>
        </div>
        <div className="col-4">
          <h1 className="text-sm">0%/10%</h1>
        </div>
        <div className="col-4">
          <h1 className="text-sm">0%/10%</h1>
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Anti-Dump Strategy</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Auto-Liquidity</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Fees Hard Coded</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Sustainable Withdrwal Limit</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Rug-Proof: Liquidity Locked</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Manual Token Buyback</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>

      <div className="row" style={{marginTop: '20px'}}>
        <div className="col-4">
          <h1 className="text-sm">Stealth Launch</h1>
        </div>
        <div className="col-4">
          <img src={check} alt="Title" style={{ height: "18px" }} />
        </div>
        <div className="col-4">
          <img src={close} alt="Title" style={{ height: "18px" }} />
        </div>
      </div>
    </div>

    <div className="container text-center text-white social">
      <h1 className="text-title" style={{marginTop: '100px'}}>Social Media</h1>
      <div className="row" style={{marginTop: '40px', marginBottom: '60px'}}>
        <div className="col-4">
          <a href="https://twitter.com/MajesticCapita1">
           <img src={twitter} alt="Title" style={{ height: "90px" }} />
          </a>
          
        </div>
        <div className="col-4">
          <a href="https://discord.gg/dGQ5RVCAUn">
            <img src={discord} alt="Title" style={{ height: "90px" }} />
          </a>
          
        </div>
        <div className="col-4">
          <a href="https://www.instagram.com/majestic.capital/">
            <img src={instagram} alt="Title" style={{ height: "90px" }} />
          </a>
        </div>
      </div>
    </div>
    </>
  );
}

export default ConnectMenu;
