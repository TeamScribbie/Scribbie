import React from "react";
import '../styles/landing.css';

const LandingPage = () => {
  return (
    <div className="landingpage">
      <nav className="navbar">
        <a href="#" className="navlogo">Scribbie</a>
        <button className="hamburger" aria-label="Toggle menu">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-menu"
          >
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <div className="navlinkwrap">
          <span className="navlink selectedlink">Home</span>
          <span className="navlink">My Profile</span>
          <span className="navlink">Activity</span>
          <span className="navlink">How It Works</span>
        </div>
        <div className="buttonwrap">
          <button className="createbtn selectedbtn">CREATE</button>
          <button className="createbtn">SIGN IN</button>
        </div>
      </nav>

      <main className="box">
        <section className="infobox">
          <p className="infobox-boldtext">
            Discover, collect, and charity in extraordinary NFT marketplace
          </p>
          <p className="infobox-slimtext">
            In aenean posuere lorem risus nec. Tempor tincidunt aenean purus
            purus vestibulum nibh mi venenatis
          </p>
          <div className="infobox-btnwrapper">
            <button className="infobox-explorebtn selected">Explore</button>
            <button className="infobox-createbtn">Create</button>
          </div>
        </section>

        <section className="display">
          <img
            className="display-nft"
            src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1074&q=80"
            alt="NFT Display"
          />
          <div className="infowrapper">
            <div className="info">
              <img
                className="info-img"
                src="https://images.unsplash.com/photo-1535207010348-71e47296838a?ixlib=rb-1.2.1&auto=format&fit=crop&w=385&q=80"
                alt="Creator Profile"
              />
              <div>
                <p>Laura</p>
                <p>0.21 Weth</p>
              </div>
            </div>

            <div className="info2">
              <p>WE ARE HERE</p>
              <div className="iconwrapper" aria-label="Likes count">
                <svg
                  width="22"
                  height="20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.7365 2C3.6575 2 1.5 3.8804 1.5 6.5135c0 3.1074 2.3236 5.9603 4.8612 8.1207 1.2458 1.0606 2.4954 1.9137 3.4352 2.5022.4692.2937.8593.5203 1.1305.6727L11 17.85l.0731-.0409a27.984 27.984 0 0 0 1.1304-.6727c.9399-.5885 2.1895-1.4416 3.4353-2.5022C18.1764 12.4738 20.5 9.6209 20.5 6.5135 20.5 3.8805 18.3425 2 16.2635 2c-2.1054 0-3.8008 1.389-4.552 3.6426a.75.75 0 0 1-1.423 0C9.5373 3.389 7.8418 2 5.7365 2ZM11 18.7027l.3426.6672a.7502.7502 0 0 1-.6852 0L11 18.7027ZM0 6.5135C0 3.052 2.829.5 5.7365.5 8.0298.5 9.8808 1.7262 11 3.6048 12.1192 1.7262 13.9702.5 16.2635.5 19.171.5 22 3.052 22 6.5135c0 3.8183-2.8014 7.06-5.3888 9.2628-1.3167 1.121-2.6296 2.0166-3.6116 2.6314-.4918.308-.9025.5467-1.1918.7092a19.142 19.142 0 0 1-.4301.2347l-.0248.013-.007.0036-.0021.0011c-.0003.0001-.0012.0006-.3438-.6666-.3426.6672-.3424.6673-.3426.6672l-.0033-.0017-.007-.0036-.0248-.013a19.142 19.142 0 0 1-.4301-.2347 29.324 29.324 0 0 1-1.1918-.7092c-.982-.6148-2.295-1.5104-3.6116-2.6314C2.8014 13.5735 0 10.3318 0 6.5135Z"
                    fill="#E0E0E0"
                  />
                </svg>
                25
              </div>
            </div>
          </div>
        </section>
      </main>

      <section className="auction">
        <div className="title">
          <p className="titlebold">Hot auctions</p>
          <p className="titleslim">View all</p>
        </div>
        <div className="nft">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="item">
              <img
                className="item-img"
                src="https://images.unsplash.com/photo-1666032250188-b6797784b249"
                alt={`NFT Auction ${item}`}
              />
              <div className="item-title">
                <p>Lorem Ipsum</p>
                <p>1.20 Weth</p>
              </div>
              <p className="item-date">Ends in 01.34.45</p>
            </div>
          ))}
        </div>
      </section>

      <section className="started">
        <p className="started-boldtext">Getting started</p>
        <p className="started-slimtext">
          Eu, molestie commodo, enim pellentesque turpis integer sagittis
        </p>
        <div className="started-items">
          <div className="itemwrapper">
            <div className="started-items-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                aria-hidden="true"
              >
                <path
                  style={{ stroke: "none", fillRule: "nonzero", fill: "#e0e0e0" }}
                  d="M12 12v18h4v-7h4v7h4V12h-12z"
                />
                <path
                  style={{ stroke: "none", fillRule: "nonzero", fill: "#e0e0e0" }}
                  d="M12 8h12v4H12z"
                />
              </svg>
              <p className="itembold">Create your wallet</p>
              <p className="itemslim">Molestie commodo enim pellentesque</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  style={{ stroke: "none", fill: "#e0e0e0" }}
                />
                <path
                  d="M9 21h18v3H9zM13.5 15v3H16v-3z"
                  style={{ stroke: "none", fill: "#b0b0b0" }}
                />
              </svg>
              <p className="itembold">Connect your wallet</p>
              <p className="itemslim">Molestie commodo enim pellentesque</p>
            </div>
          </div>

          <div className="itemwrapper">
            <div className="started-items-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="36"
                height="36"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  style={{ stroke: "none", fill: "#e0e0e0" }}
                />
                <path
                  d="M12 12h12v3H12zM12 18h12v3H12z"
                  style={{ stroke: "none", fill: "#b0b0b0" }}
                />
              </svg>
              <p className="itembold">Start trading</p>
              <p className="itemslim">Molestie commodo enim pellentesque</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2025 Gaslur. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
